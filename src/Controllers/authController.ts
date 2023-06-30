import UserModel, { IUser } from "../Models/User.Model";
import { Request, Response, NextFunction } from "express";
import { CatchAsync, ErrorHandler } from "../utils/classes";
import jwt from "jsonwebtoken";
import { Roles } from "../Types/enums";
import Email from "../utils/email";
import crypto from "crypto";
import TaskModel from "../Models/Tasks.Model";
import { gapBetweenReq } from "../utils/rate-limit";

interface CookieOptions {
  expires: Date;
  secure?: boolean;
  httpOnly: boolean;
}

export interface CustomRequest extends Request {
  user?: any;
  file?: any;
}

const sendEmailRequest = (
  user: IUser,
  res: Response,
  identifier: string
): void => {
  let token: string = "";
  let url: string = "";

  switch (identifier) {
    case "signup":
      token = user.verificationTokenFunc();
      url = `${process.env.URL}/users/${identifier}/${token}`;
      new Email(user, url).sendVerificationMail();
      break;
    case "forget-password":
      token = user.sendResetPasswordToken();
      url = `${process.env.URL}/users/${identifier}/${token}`;
      new Email(user, url).sendPasswordReset();
      break;
    default:
      break;
  }
  user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      message: "Please check your email to verify your account",
      url,
    },
  });
};

exports.restrictTo = (...roles: Roles[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          "You do not have the permission to perform this action",
          403
        )
      );
    }
    next();
  };
};

export const createHashed = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const jwtToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = (user: IUser, code: number, res: Response): void => {
  // Data is already stored in DB So we can remove this data to prevent it for sending as a response

  const token = jwtToken(user._id);
  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  res.status(code).json({
    status: "success",
    token,
  });
};

exports.signUpUser = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.body.role) next(new ErrorHandler("You cannot set the roles", 400));

    const user = await UserModel.create(req.body);

    if (!user) {
      next(new ErrorHandler("Fail to create the user", 400));
    }
    sendEmailRequest(user, res, "signup");
  }
);

exports.resendSignUpToken = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      next(new ErrorHandler(`No user found with ${req.body.email}`, 400));
    }
    if (user?.verificationTokenExpiresIn) {
      gapBetweenReq(user.verificationTokenExpiresIn, next);
    }
    sendEmailRequest(user!, res, "signup");
  }
);

exports.createUser = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const hashedToken = createHashed(req.params.token);
    const user = await UserModel.findOne({ verificationToken: hashedToken });
    if (!user) {
      return next(
        new ErrorHandler("Token doesn't match or it is expired", 400)
      );
    }
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $unset: { verificationToken: 1, verificationTokenExpiresIn: 1 },
        verified: true,
      },
      { new: true }
    )!;

    new Email(user).sendWelcome();
    sendToken(user, 200, res);
  }
);

exports.loginUser = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    if (!password || !email) {
      next(new ErrorHandler("Please provide correct email and password", 400));
    }
    const user: any = await UserModel.findOne({ email }).select("+password");
    if (!user || !(await user?.correctPassword(password, user.password))) {
      next(new ErrorHandler("Please provide correct email and password", 400));
    }
    if (user.verified === false)
      next(
        new ErrorHandler(
          "Your account it not verified! Please verify your account",
          400
        )
      );

    const token = sendToken(user, 200, res);
    res.status(200).json({ status: "success", token });
  }
);

exports.protectRoute = CatchAsync(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      res.status(401).json({
        status: "error",
        message: "You are not authorized. Please login!",
      });
    }

    const decode = jwt.verify(
      token!,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;

    const freshUser = await UserModel.findById(decode.id);

    if (!freshUser) {
      next(
        new ErrorHandler("The user belongs to this token doesn't exist", 401)
      );
    }

    const isPasswordChanged = (freshUser as IUser).passwordChanged(
      decode.iat as number
    );
    if (isPasswordChanged) {
      next(new ErrorHandler("Password have been changed recently", 401));
    }
    req.user = freshUser;
    next();
  }
);

exports.updatePassword = CatchAsync(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { newPassword, confirmNewPassword } = req.body;
    const user = await UserModel.findByIdAndUpdate(req.user._id, {
      password: newPassword,
      confirmPassword: confirmNewPassword,
    });
    sendToken(user as IUser, 200, res);
  }
);
exports.passwordAndEmailCheck = CatchAsync(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (
      req.body.password ||
      req.body.confirmPassword ||
      req.body.passwordChangeAt ||
      req.body.email ||
      req.body.role
    ) {
      return next(
        new ErrorHandler(
          "To update password or email use /users/update-password/ or /users/update-email/ route",
          404
        )
      );
    }
    if (req.body.role) {
      return next(new ErrorHandler("Only admin can update user role", 404));
    }

    next();
  }
);

exports.passwordBeforeSaving = CatchAsync(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.body.currentPassword) {
      return next(
        new ErrorHandler(
          "Current Password is required to perform this action",
          401
        )
      );
    }
    const user = (await UserModel.findById(req.user.id).select(
      "+password"
    )) as IUser;
    if (
      !(await user.correctPassword(
        req.body.currentPassword,
        user.password as string
      ))
    ) {
      return next(new ErrorHandler("Incorrect current password", 401));
    }
    next();
  }
);

exports.forgotPassword = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      next(
        new ErrorHandler(`User with email:${req.body.email} doesn't exist`, 404)
      );
    }
    if (user?.resetTokenExpiresIn) {
      gapBetweenReq(user.resetTokenExpiresIn, next);
    }
      await user?.save({ validateBeforeSave: false });
      sendEmailRequest(user!, res, "forget-password");
  }
);


exports.resetPassword = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const hashedToken = createHashed(req.params.token);
    const user = await UserModel.findOne({ passwordResetToken: hashedToken });
    if (!user) {
      return next(
        new ErrorHandler("Token doesn't match or it is expired", 400)
      );
    }
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $unset: { passwordResetToken: 1, resetTokenExpiresIn: 1 },
        password: req.body.newPassword,
        confirmPassword: req.body.confirmNewPassword,
      },
      { new: true }
    )!;
    sendToken(user, 200, res);
  }
);

exports.CheckUser = CatchAsync(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const task: any = await TaskModel.findById(req.params.id);
    if (!task) {
      next(new ErrorHandler("Task doesn't exist", 400));
    }
    if (task.user.equals(req.user._id)) {
      next(new ErrorHandler("This task doesn't belong to you", 401));
    }
    next();
  }
);

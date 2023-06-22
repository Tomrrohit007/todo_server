import UserModel, { IUser } from "../Models/User.Model";
import { Request, Response, NextFunction } from "express";
import { CatchAsync, ErrorHandler } from "../utils/classes";
import jwt from "jsonwebtoken";
import { Roles } from "../Types/enums";
import Email from "../utils/email";
import crypto from "crypto";


export interface CustomRequest extends Request {
  user?: any;
  file?:any;
}

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

const createHashed = (token:string):string =>{
  return crypto.createHash("sha256").update(token).digest("hex");
}

const jwtToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createTokenAndSend = (user: IUser, code: number, res: Response): void => {
  // Data is already stored in DB So we can remove this data to prevent it for sending as a response
  user.password = undefined;
  user.passwordChangeAt = undefined;

  const token = jwtToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  res.status(code).json({
    status: "success",
    token,
    data: user,
  });
};

const sendToken = (user: IUser, code: number, res: Response): void => {
  // Data is already stored in DB So we can remove this data to prevent it for sending as a response
  user.password = undefined;
  user.passwordChangeAt = undefined;

  const token = jwtToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  res.status(code).json({
    status: "success",
    token,
  });
};

exports.createUser = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const newUser: IUser = await UserModel.create(req.body);
    new Email(newUser).sendWelcome();
    createTokenAndSend(newUser, 200, res);
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
      token as string,
      process.env.JWT_SECRET as string
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
    req.user.password = newPassword;
    req.user.confirmPassword = confirmNewPassword;
    await req.user.save();

    sendToken(req.user, 200, res);
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
    const resetToken = user!.sendResetPasswordToken();
    const resetPasswordUrl = `${process.env.URL}/users/reset-password/${resetToken}`
    if (user) {
      await user.save({ validateBeforeSave: false });
      new Email(user, resetPasswordUrl).sendPasswordReset();
    }
    res.status(200).json({
      status: "success",
      message: "Please check your email for reset password",
      resetPasswordUrl
    });
  }
);

exports.resetPassword = CatchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    console.log(req.params.token);
    const hashedToken = createHashed(req.params.token);
    const user = await UserModel.findOne({ passwordResetToken: hashedToken });
    if (!user) {
      return next(
        new ErrorHandler("Token doesn't match or it is expired", 400)
      );
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.resetTokenExpiresIn = undefined;
    await user.save();

    sendToken(user, 200, res);
  }
);
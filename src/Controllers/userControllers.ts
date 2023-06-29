import UserModel, { IUser } from "../Models/User.Model";
import { Request, Response, NextFunction } from "express";
import { CatchAsync, ErrorHandler } from "../utils/classes";
import { CustomRequest } from "../Controllers/authController";
const handlerFactory = require("./handlerFactory");
import multer from "multer";
const cloudinary = require("../utils/cloudinary");

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: any
): any => {
  if (file.mimetype.startsWith("image")) {
    console.log("Valid File");
    callback(null, true);
  } else {
    console.log("Not a valid File");
    callback(
      new ErrorHandler("Not an image! Please upload only images.", 400),
      false
    );
  }
};

export const uploadUserPhoto = multer({
  storage: multer.diskStorage({}),
  fileFilter: multerFilter,
}).single("image");

export const hashImage = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload a image", 400));
  }
  if (req.file.size > 5 * 1024 * 1024)
    return next(
      new ErrorHandler(`Please upload a file with size less than 5MB!`, 400)
    );

  const publicId = req.user.publicId;
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }

  const originalFilename = req.file.originalname.split(".")[0];
  const currentDate = new Date().toLocaleDateString().split("/").join("-");
  const currentTime = new Date().toLocaleTimeString().split(" ").join("_");
  const filename = `${originalFilename}_${currentDate}_${currentTime}`;

  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: filename,
    folder: "Todo/user-images",
    format: "webp",
    transformation: [
      { width: 600, height: 600, crop: "fill", gravity: "face", quality: 80 },
    ],
  });

  await UserModel.findByIdAndUpdate(req.user._id, {
    image: result.secure_url,
    publicId: result.public_id,
  });
  res.status(200).json({
    status: "success",
    image: { url: result.secure_url, publicId: result.public_id },
  });
};

export const destroyUserPhoto = CatchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!(req.user as IUser).publicId) {
      return next(new ErrorHandler("User doesn't have any photo", 400));
    }
    await cloudinary.uploader.destroy((req.user as IUser).publicId);
    await UserModel.findByIdAndUpdate((req.user as IUser).id, {
      image: "",
      publicId: "",
    });
    res.status(201).json({
      status: "deleted successfully",
    });
  }
);

exports.getUsers = handlerFactory.getAll(UserModel);

exports.currentUser = CatchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await UserModel.findById(req.user._id)
      .select(
        "-passwordChangeAt -resetTokenExpiresIn -passwordResetToken -role -__v -publicId"
      )
      .populate({ path: "tasks", select: "-__v" });
    res.status(200).json({ status: "success", user });
  }
);

exports.updateUser = handlerFactory.updateOne(UserModel);

exports.getUserProfile = handlerFactory.getOne(UserModel, {
  path: "tasks",
  select: "-__v",
});

exports.beforeDeleteUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  req.params.id = req.body.id;
  next();
};
exports.deleteUser = handlerFactory.deleteOne(UserModel);

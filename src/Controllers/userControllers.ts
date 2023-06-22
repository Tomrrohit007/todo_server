import UserModel, { IUser } from "../Models/User.Model";
import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../utils/classes";
import { CustomRequest } from "../Controllers/authController";
import multer from "multer";
const cloudinary = require("../utils/cloudinary");
const handlerFactory = require("./handlerFactory");

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

const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single("image");

export const hashImage = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next();
  }

  const publicId = req.user.publicId;
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }

  const originalFilename = req.file.originalname.split(".")[0];
  const currentDate = new Date().toLocaleDateString();
  const filename = `${originalFilename}_${currentDate}`;

  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: filename,
    folder: "user-images",
    format: "webp",
    transformation: [
      { width: 600, height: 600, crop: "fill", gravity: "face", quality: 80 },
    ],
  });

  (req.user as IUser).publicId = result.public_id;
  (req.user as IUser).image = result.secure_url;
  next();
};

export const destroyUserPhoto = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
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
};

exports.getUsers = handlerFactory.getAll(UserModel);

exports.currentUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  res.status(400).json({ status: "success", user: req.user });
};

exports.updateUser = handlerFactory.updateOne(UserModel);

exports.getUserProfile = handlerFactory.getOne(UserModel);

exports.beforeDeleteUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  req.params.id = req.body.id;
  next();
};
exports.deleteUser = handlerFactory.deleteOne(UserModel);

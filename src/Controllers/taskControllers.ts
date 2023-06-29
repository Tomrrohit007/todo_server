import { Request, Response, NextFunction } from "express";
import TaskModel from "../Models/Tasks.Model";
import { CatchAsync, ErrorHandler } from "../utils/classes";
import { CustomRequest } from "./authController";
const handlerFactory = require("./handlerFactory");
// const cloudinary = require("../utils/cloudinary");
import multer from "multer";

// Set up multer storage
const storage = multer.memoryStorage();

// Set up multer file filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  if (file.mimetype.startsWith("image")) {
    // Accept only image files
    callback(null, true);
  } else {
    callback(new ErrorHandler("Only image files are allowed.", 400));
  }
};

// Create multer upload instance
exports.uploadFilter = multer({ storage, fileFilter }).array("images", 4);

exports.setUser = CatchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const title = req.body.title;
    const description=req.body.description;
    const user = req.user._id;
    req.body = {title, description, user}
    console.log(title, description, user)
    next();
  }
);

exports.getAllTask = handlerFactory.getAll(TaskModel);

exports.createTask = handlerFactory.createOne(TaskModel);

exports.updateTask = handlerFactory.updateOne(TaskModel);

exports.deleteTask = handlerFactory.deleteOne(TaskModel);

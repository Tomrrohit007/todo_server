import { Response, NextFunction } from "express";
import TaskModel from "../Models/Tasks.Model";
import { CustomRequest } from "./authController";
const handlerFactory = require("./handlerFactory");

exports.setUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    req.body.user = req.user._id
    next();
  };

exports.getAllTask = handlerFactory.getAll(TaskModel);

exports.createTask = handlerFactory.createOne(TaskModel);

exports.updateTask = handlerFactory.updateOne(TaskModel);

exports.deleteTask = handlerFactory.deleteOne(TaskModel);

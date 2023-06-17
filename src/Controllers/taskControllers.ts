import TaskModel, { ITask } from "../Models/Tasks.Model";
import { Request, Response, NextFunction } from "express";
import { APIFeatures, CatchAsync, ErrorHandler } from "../utils/classes";
import mongoose from "mongoose";

exports.getAllTask = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const feature = new APIFeatures(TaskModel.find(), req.query)
      .filter()
      .sorting()
      .limitFields();
    const allTask = await feature.query.exec();

    res.status(200).json({ count: allTask.length, data: allTask });
  }
);

exports.createTask = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const newTask: ITask = await TaskModel.create(req.body);
    res.status(200).json({ status: "success", data: newTask });
  }
);

exports.updateTask = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      next(new ErrorHandler("Task is not found", 500));
    }

    const newTask: ITask | null = await TaskModel.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json({ status: "success", data: newTask });
  }
);

exports.deleteTask = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ status: "error", message: "Task not found" });
      return;
    }

    const newTask: ITask | null = await TaskModel.findByIdAndDelete(id);

    res.status(200).json({ status: "success", data: newTask });
  }
);

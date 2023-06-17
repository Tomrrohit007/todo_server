import UserModel, { IUser } from "../Models/User.Model";
import { Request, Response, NextFunction } from "express";
import { CatchAsync } from "../utils/classes";

exports.createUser = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const newUser: IUser = await UserModel.create(req.body);
    res.status(200).json({ status: "success", data: newUser });
  }
);

exports.updateUser = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const newTask: IUser | null = await UserModel.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json({ status: "success", data: newTask });
  }
);

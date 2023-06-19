import UserModel, { IUser } from "../Models/User.Model";
import { Request, Response, NextFunction } from "express";
import { APIFeatures, CatchAsync } from "../utils/classes";

exports.getUsers = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const feature = new APIFeatures(UserModel.find(), req.query)
      .filter()
      .sorting()
      .limitFields();
    const allUser = await feature.query.exec();

    res.status(200).json({ count: allUser.length, data: allUser });
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


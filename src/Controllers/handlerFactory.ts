import { Request, Response, NextFunction } from "express";
import { APIFeatures, CatchAsync } from "../utils/classes";
import { ErrorHandler } from "../utils/classes";


export interface CustomRequest extends Request {
  user?: any;
  file?: any;
}

exports.getAll = (Model: any) =>
  CatchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      let query = {};
      if (req.params.tourId) query = { tour: req.params.tourId };
      const features = new APIFeatures(Model.find(query), req.query)
        .filter()
        .sorting()
        .limitFields()
        .pagination();

      const data = await features.query;
      res.status(200).json({ count: data.length, data });
    }
  );

exports.getOne = (Model: any, popOptions?: any) =>
  CatchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      let query = Model.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);

      const doc = await query;

      if (!doc) {
        return next(
          new ErrorHandler(`Document with id /${req.params.id}/ not found`, 404)
        );
      }

      res.status(200).json({ status: "success", data: doc });
    }
  );

// Delete one
exports.deleteOne = (Model: any) =>
  CatchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const doc = await Model.findByIdAndDelete(req.params.id).exec();

      if (!doc) {
        next(
          new ErrorHandler(`Invalid ${Model.modelName.toLowerCase()} ID`, 404)
        );
        return;
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );

//Update one
exports.updateOne = (Model: any) =>
  CatchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        { ...req.body, image: req.user.image, publicId: req.user.publicId },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doc) {
        next(
          new ErrorHandler(`Invalid ${Model.modelName.toLowerCase()} ID`, 404)
        );
        return;
      }

      res.status(201).json({
        status: "success",
        data: doc,
      });
    }
  );

// Create One
exports.createOne = (Model: any) =>
  CatchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const newDoc = await Model.create(req.body);
      res.status(201).json({ message: "Created Successfully", data: newDoc });
    }
  );

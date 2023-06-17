import { Request, Response, NextFunction } from "express";

export class APIFeatures {
  constructor(public query: any, private queryStr: any) {}

  public filter(): APIFeatures {
    const queryObj = { ...this.queryStr };
    const excludeFields: string[] = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    this.query = this.query.find(queryObj);
    return this;
  }

  public sorting(): APIFeatures {
    if (typeof this.queryStr.fields === "string") {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-date");
    }
    return this;
  }

  public limitFields(): APIFeatures {
    if (typeof this.queryStr.fields === "string") {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
}

export class ErrorHandler extends Error {
  public status: string;
  public isOperational: boolean;

  constructor(public message: string, public statusCode: number) {
    super(message);
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

export const CatchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

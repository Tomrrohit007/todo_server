require("dotenv").config();
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import TaskRouter from "./src/Routers/taskRouters";
import UserRouter from "./src/Routers/userRouters";
import { Error } from "./src/Types/interfaces";
import { ErrorHandler } from "./src/utils/classes";

process.on("uncaughtException", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN...");
  process.exit(1);
});


const app: Express = express();
app.use(express.json());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
   console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use("/tasks", TaskRouter);
app.use("/users", UserRouter);

app.all("*", (req: Request, res: Response, next: NextFunction):void => {
  next(
    new ErrorHandler(`Cannot find the ${req.originalUrl} route on the server!`, 404)
  );
});

//Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});


// If given route doesn't match with any routes in our app then this middleware will be executed

mongoose.connect(process.env.MONGODB_URI!);

const server = app.listen(process.env.PORT_NO, () => {
  console.log("Connected to DB and Listening...");
});

process.on("unhandledRejection", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! SHUTTING DOWN....");
  server.close(() => {
    process.exit(1);
  });
});

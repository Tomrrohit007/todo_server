import mongoose from "mongoose";

type Priority = "low" | "medium" | "high";

export interface ITask extends mongoose.Document {
  title: string;
  description: string;
  date: Date;
  priority: Priority;
  status: string;
  user: mongoose.Schema.Types.ObjectId;
}

const taskSchema: mongoose.Schema<ITask> = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    unique: true,
    maxLength: [40, "Must have characters less than or equal to 40"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["Incomplete", "In Progress", "Completed"],
    default: "In Progress",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "Task must belong to a user"],
  },
});

const TaskModel = mongoose.model<ITask>("tasks", taskSchema);

export default TaskModel;

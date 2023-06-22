import TaskModel from "../Models/Tasks.Model";
const handlerFactory = require("./handlerFactory");

exports.getAllTask = handlerFactory.getAll(TaskModel);

exports.createTask = handlerFactory.createOne(TaskModel);

exports.updateTask = handlerFactory.updateOne(TaskModel);

exports.deleteTask = handlerFactory.deleteOne(TaskModel);

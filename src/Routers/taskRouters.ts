import { Router } from "express";
const TaskControllers =  require("../Controllers/taskControllers")
const AuthController = require("../Controllers/authController");
const TaskRouter = Router()

// Protected
TaskRouter.use(AuthController.protectRoute);

TaskRouter.route('/').get(TaskControllers.getAllTask).post(TaskControllers.createTask)

TaskRouter.route("/:id")
  .patch(TaskControllers.updateTask)
  .delete(TaskControllers.deleteTask);

export default TaskRouter
import { Router } from "express";
const TaskControllers = require("../Controllers/taskControllers");
const AuthController = require("../Controllers/authController");
const TaskRouter = Router();

// Protected
TaskRouter.use(AuthController.protectRoute);

TaskRouter.route("/")
  .get(TaskControllers.getAllTask)
  .post(
    TaskControllers.setUser,
    TaskControllers.createTask
  );

TaskRouter.route("/:id")
  .patch(
    AuthController.CheckUser,
    TaskControllers.updateTask
  )
  .delete(TaskControllers.deleteTask);

export default TaskRouter;

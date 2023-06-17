import { Router } from "express";
const TaskControllers =  require("../Controllers/taskControllers")
const TaskRouter = Router()

TaskRouter.route('/').get(TaskControllers.getAllTask).post(TaskControllers.createTask)

TaskRouter.route("/:id")
  .patch(TaskControllers.updateTask)
  .delete(TaskControllers.deleteTask);

export default TaskRouter
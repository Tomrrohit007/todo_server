import { Router } from "express";
const UserController = require("../Controllers/userControllers");
const UserRouter = Router();

UserRouter.route("/").post(UserController.createUser);

UserRouter.route("/:id").patch(UserController.updateUser);

export default UserRouter;

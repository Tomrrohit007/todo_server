import { Router } from "express";
const UserController = require("../Controllers/userControllers");
const AuthController = require("../Controllers/authController");
const UserRouter = Router();

// AUTH
UserRouter.route("/login").post(AuthController.loginUser);
UserRouter.route("/signup").post(AuthController.createUser);

UserRouter.route("/forgot-password").post(AuthController.forgotPassword);

UserRouter.route("/reset-password/:token").post(AuthController.resetPassword);

//Protected
UserRouter.route("/").get(
  AuthController.protectRoute,
  AuthController.restrictTo("admin"),
  UserController.getUsers
);
UserRouter.route("/:id")
  .patch(
    AuthController.protectRoute,
    AuthController.passwordAndEmailCheck,
    UserController.uploadUserPhoto,
    UserController.hashImage,
    UserController.updateUser
  )
  .delete(
    AuthController.protectRoute,
    AuthController.restrictTo("admin"),
    UserController.beforeDeleteUser,
    UserController.deleteUser
  );
  UserRouter.route("/profile").get(
    AuthController.protectRoute,
    UserController.currentUser
  )


export default UserRouter;

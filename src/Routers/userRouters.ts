import { Router } from "express";
const UserController = require("../Controllers/userControllers");
const AuthController = require("../Controllers/authController");
const UserRouter = Router();

// AUTH
UserRouter.route("/login").post(AuthController.loginUser);

UserRouter.route("/signup").post(AuthController.signUpUser);
UserRouter.route("/signup/resend").post(
  AuthController.resendSignUpToken
);
UserRouter.route("/verify-user/:token").post(AuthController.createUser);

UserRouter.route("/forgot-password").post(AuthController.forgotPassword);
UserRouter.route("/forgot-password/resend").post(AuthController.resendForgotPassword);
UserRouter.route("/reset-password/:token").post(AuthController.resetPassword);

UserRouter.use(AuthController.protectRoute);

UserRouter.route("/profile-picture")
  .patch(UserController.uploadUserPhoto, UserController.hashImage)
  .delete(UserController.destroyUserPhoto);

UserRouter.route("/profile").get(UserController.currentUser);

UserRouter.route("/").get(
  AuthController.restrictTo("admin"),
  UserController.getUsers
);

UserRouter.route("/:id")
  .patch(AuthController.passwordAndEmailCheck, UserController.updateUser)
  .delete(
    AuthController.restrictTo("admin"),
    UserController.beforeDeleteUser,
    UserController.deleteUser
  )
  .get(AuthController.restrictTo("admin"), UserController.getUserProfile);

export default UserRouter;

import { createHashed } from "./../Controllers/authController";
import validator from "validator";
import mongoose, { Document, Schema } from "mongoose";
import { Country, Gender, Roles } from "../Types/enums";
import { NextFunction } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  gender: Gender;
  country: Country;
  image?: string;
  publicId?: string;
  role: Roles;
  password: string | undefined;
  confirmPassword: string | undefined;
  verified: boolean;
  verificationToken?: string;
  verificationTokenExpiresIn?: Date;
  passwordChangeAt?: Date;
  passwordResetToken?: string;
  resetTokenExpiresIn?: Date;
  createdAt: Date;
  correctPassword: (
    hashedPassword: string,
    userPassword: string
  ) => Promise<boolean>;
  passwordChanged: (JWTTimestamp: number) => boolean;
  sendResetPasswordToken: () => string;
  verificationTokenFunc: () => string;
}

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (email: string): boolean {
          return validator.isEmail(email);
        },
        message: "Invalid email address",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: Object.values(Gender),
    },
    country: {
      type: String,
      required: true,
      enum: Object.values(Country),
    },
    image: {
      type: String,
      default: "",
    },
    publicId: String,
    role: {
      type: String,
      default: Roles.user,
    },
    password: {
      type: String,
      required: [true, "A password is required"],
      minlength: [8, "A password must have a minimum length of 8 characters"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "A password is required"],
      minlength: [8, "A password must have a minimum length of 8 characters"],
      validate: {
        validator: function (this: IUser, el: string): boolean | string {
          return el === this.password;
        },
        message: "Passwords don't match",
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiresIn: Date,
    passwordChangeAt: Date,
    passwordResetToken: String,
    resetTokenExpiresIn: Date,
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

(userSchema.pre as any)(
  "save",
  async function (this: IUser, next: NextFunction) {
    if (!this.isModified("password")) next();
    this.password = await bcrypt.hash(this.password as string, 12);
    this.confirmPassword = undefined;
    next();
  }
);

(userSchema.pre as any)(
  "save",
  async function (this: IUser, next: NextFunction) {
    if (!this.isModified("password") || this.isNew) {
      next();
    }

    this.passwordChangeAt = new Date(Date.now() - 1000);
    next();
  }
);

userSchema.methods.correctPassword = async function (
  hashedPassword: string,
  userPassword: string
): Promise<boolean> {
  const isCorrect = await bcrypt.compare(hashedPassword, userPassword);
  return isCorrect;
};

userSchema.methods.passwordChanged = function (JWTTimestamp: number): boolean {
  if (this.passwordChangeAt) {
    const timeStamp = Math.floor(this.passwordChangeAt.getTime() / 1000);
    return JWTTimestamp < timeStamp;
  }

  return false;
};

userSchema.methods.sendResetPasswordToken = function (this: IUser): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = createHashed(resetToken);
  this.resetTokenExpiresIn = new Date(Date.now() + 10 * 30000);
  return resetToken;
};

userSchema.methods.verificationTokenFunc = function (this: IUser): string {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = createHashed(token);
  this.verificationTokenExpiresIn = new Date(Date.now() + 10 * 60000);
  console.log("Triggered")
  return token;
};

userSchema.virtual("tasks", {
  ref: "tasks",
  foreignField: "user",
  localField: "_id",
});

const UserModel = mongoose.model<IUser>("users", userSchema);

export default UserModel;

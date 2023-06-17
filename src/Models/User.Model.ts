import mongoose, { Document, Schema } from "mongoose";
import { Country, Gender } from "../Types/enums";
// import validator from "validator";

export interface IUser extends Document {
  name: string;
  email: string;
  gender: Gender;
  country: Country;
  image?: string;
  publicId?: string;
  password: string;
  confirmPassword: string;
  passwordChangeAt?: Date;
  passwordResetToken?: string;
  resetTokenExpiresIn?: Date;
  active?: boolean;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  gender: {
    type: String,
    required: true,
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
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  resetTokenExpiresIn: Date,
});

const UserModel = mongoose.model<IUser>("users", userSchema);

export default UserModel;

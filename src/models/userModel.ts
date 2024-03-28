import mongoose from "mongoose";

interface User extends mongoose.Document {
  _id: string;
  id: string;
  googleId?: string;
  facebookId?: string;
  email: string;
  password: string;
  name: string;
  image: string;
  provider: string;
}

const userSchema = new mongoose.Schema(
  {
    googleId: String,
    facebookId: String,
    email: { type: String, unique: true },
    password: String,
    name: String,
    image: String,
    provider: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = mongoose.model<User>("users", userSchema);

export default UserModel;

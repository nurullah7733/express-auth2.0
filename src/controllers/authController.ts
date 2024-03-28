import { Request, Response, NextFunction } from "express";
import { generateToken } from "../utils/jwt/jwt";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";

import passport from "passport";
import createService from "../services/common/createService";
// These functions should match the user profile info with your DB and create a user if doesn't exist
export const googleAuthCallback = (req: Request, res: Response) => {
  const token = generateToken(req.user);
  res.cookie("token", token.token, {
    httpOnly: true,
    maxAge: 3600000,
    secure: process.env.NODE_ENV === "production",
  });

  const userProfile = encodeURIComponent(JSON.stringify(req.user));
  // Append user profile data as a parameter when redirecting
  const frontendRedirectUrl = new URL(process.env.FRONTEND_DOMAIN as string);
  frontendRedirectUrl.searchParams.append("profile", userProfile);

  res.redirect(frontendRedirectUrl.toString());
};

export const facebookAuthCallback = (req: Request, res: Response) => {
  // Handle the response after Facebook auth completes
  // Similar logic as the google callback
};

// register
export const userRegister = async (req: Request, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    req.body.provider = "local";
    req.body.image =
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    let data = await userModel.create(req.body);
    return res.status(200).json({ status: "success", data: data });
  } catch (error) {
    return res.status(400).json({ status: "fail", data: error });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ status: "error", data: err.message });
    }

    if (!user) {
      // If `info` contains a message, use it; otherwise, default to "Invalid credentials"
      const message = info.message ? info.message : "Invalid credentials";
      return res.status(200).json({ status: "fail", data: message });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ status: "error", data: err.message });
      }

      const sanitizedUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        image: user.image,
        googleId: user.googleId,
        facebookId: user.facebookId,
      };
      res.cookie("token", generateToken(user).token, {
        httpOnly: true,
        maxAge: 3600000,
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(200).json({
        status: "success",
        data: sanitizedUser,
      });
    });
  })(req, res, next);
};

// logout controller

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("connect.sid");
    res.clearCookie("token");

    return res
      .status(200)
      .json({ status: "success", data: "Logout successfully" });
  } catch (error) {
    return res.status(400).json({ status: "fail", data: error });
  }
};

import express from "express";
import passport from "passport";
import {
  googleAuthCallback,
  facebookAuthCallback,
  logout,
  login,
  userRegister,
} from "../controllers/authController";

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  googleAuthCallback
);

router.get("/auth/facebook", passport.authenticate("facebook"));
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook"),
  facebookAuthCallback
);

router.post("/register", userRegister);
router.post("/login", login);
router.get("/logout", logout);

export default router;

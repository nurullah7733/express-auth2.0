import express, { Request, Response } from "express";
import UserModel from "./src/models/userModel";
const app = express();
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import passport from "passport";
import dotenv from "dotenv";
import router from "./src/routes/api";
import authRouter from "./src/routes/authRoute";
dotenv.config();
import {
  findOrCreateUserByGoogleId,
  findOrCreateUserByFacebookId,
  findUserByEmail,
} from "./src/services/authService/authService";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
// request limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Body Parser Implement
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// express session
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: process.env.EXPRESS_SESSION as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(cookieParser());

// passport implement
// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findOrCreateUserByGoogleId(profile);

        return done(null, user);
      } catch (err: any) {
        return done(err);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findOrCreateUserByFacebookId(profile);
        return done(null, user);
      } catch (err: any) {
        return done(err);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email: string, password: string, done: any) => {
      try {
        const user = await findUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "User not found." });
        }

        if (user.provider && user.provider !== "local") {
          // Inform the user they should use their provider's log in method
          return done(null, false, {
            message: `Please log in using your ${user.provider} account.`,
          });
        }

        if (!user.password) {
          // Account exists but no password is set, which means user have never set or has removed it
          return done(null, false, {
            message:
              "Please set your password or log in using a linked account.",
          });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err: any) {
    done(err, null);
  }
});
app.use(passport.initialize());
app.use(passport.session());

// Routing Implement
app.use("/", router);
// for social login
app.use("/", authRouter);

// ******* its for cloud database *******
let URI = process.env.DATABASE_URL as string;
let option = { user: "nur", pass: "nur" };

mongoose.connect(URI, option).then(
  () => console.log("Database Connection Success"),
  (e) => console.log(e)
);

// undefiend Route Implement
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ status: "fail", data: "Not Found" });
});

module.exports = app;

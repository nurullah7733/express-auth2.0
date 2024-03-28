import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const authVerifyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token || req.headers["token"];
  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ status: "unauthorized" });
      } else {
        req.headers["email"] = decoded.sub;
      }
    }
  );
};

export default authVerifyMiddleware;

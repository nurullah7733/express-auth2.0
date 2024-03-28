// src/services/tokenService.ts
import jwt from "jsonwebtoken";

export const generateToken = (user: any) => {
  const expiresIn = "1h"; // Set token expiration as needed
  const payload = {
    sub: user.email, // subject, you can use any unique part of the user object
    iat: Date.now(), // issued at
  };

  const signedToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: expiresIn,
  });
  return {
    token: signedToken,
    expires: expiresIn,
  };
};

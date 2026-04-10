import { Request, Response, NextFunction } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

function getJwtSecret(): Secret {
  const s = process.env.JWT_SECRET?.trim();
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
}

export const createToken = (id: string, email: string, expiresIn: string) => {
  const payload = { id, email };
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  } as SignOptions);
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[`${COOKIE_NAME}`];
  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  }
  return new Promise<void>((resolve, reject) => {
    return jwt.verify(token, getJwtSecret(), (err, success) => {
      if (err) {
        reject(err.message);
        return res.status(401).json({ message: "Token Expired" });
      } else {
        resolve();
        res.locals.jwtData = success;
        return next();
      }
    });
  });
};
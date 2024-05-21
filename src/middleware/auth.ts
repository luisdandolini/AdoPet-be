import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export default function (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err)
      return res.status(500).json({ message: "Failed to authenticate token" });

    req.userId = (decoded as any).id;
    next();
  });
}

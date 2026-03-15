import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../common/config";
import { createUser, findUserByEmail } from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: "User associated with this email already exists" });
  }

  try {
    const user = await createUser(email, password);
    res.json({
      message: "User created successfully",
      userId: user.id,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({
    message: "User signed in successfully",
    token,
  });
};

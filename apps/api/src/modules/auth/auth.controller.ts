import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../common/config";
import {
  createSession,
  createUser,
  findUserByEmail,
  getUserById,
  getUserProfile,
  listSessionsForUser,
  updateUserPassword,
  updateUserProfile,
} from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ message: "First name and last name are required" });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: "User associated with this email already exists" });
  }

  try {
    const user = await createUser(email, password, firstName, lastName);
    res.json({
      message: "User created successfully",
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
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
  const userAgent = req.headers["user-agent"] as string | undefined;
  const ipAddress =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    (req.ip === "::1" ? "127.0.0.1" : req.ip);

  await createSession(user.id, userAgent, ipAddress, new Date(Date.now() + 60 * 60 * 1000));
  res.json({
    message: "User signed in successfully",
    token,
  });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await getUserProfile(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    const user = await updateUserProfile(userId, firstName, lastName);

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from the current password" });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    await updateUserPassword(userId, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Failed to update password" });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessions = await listSessionsForUser(userId);

    res.json({ sessions });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

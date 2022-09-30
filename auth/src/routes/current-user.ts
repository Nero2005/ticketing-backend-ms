import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { currentUser } from "@oo-ticketing-dev/ticketing-common";
import { requireAuth } from "@oo-ticketing-dev/ticketing-common";
import { UserModel } from "../models/user.model";

const router = express.Router();

router.get(
  "/api/users/currentuser",
  currentUser,
  async (req: Request, res: Response) => {
    try {
      const { email, id } = req.user!;
      const user = await UserModel.findOne({ email, _id: id });
      res.json({ user });
    } catch (err: any) {
      return res.json({ user: null });
    }
  }
);

export { router as currentUserRouter };

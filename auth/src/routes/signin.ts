import express, { NextFunction, Request, Response } from "express";
import * as argon from "argon2";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import {
  BadRequestError,
  validateResource,
} from "@oo-ticketing-dev/ticketing-common";
import { SigninUserInput, signinUserSchema } from "../schemas/auth.schema";

const router = express.Router();

router.post(
  "/api/users/signin",
  validateResource(signinUserSchema),
  async (req: Request<{}, {}, SigninUserInput, {}>, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) throw new BadRequestError("Credentials incorrect");
    const passwordsMatch = await argon.verify(existingUser.password, password);
    if (!passwordsMatch) throw new BadRequestError("Credentials incorrect");
    // generate json web token and store in a cookie
    const userJwt = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userJwt,
    };
    return res
      .status(200)
      .json({ user: existingUser, message: "Signed in successfully" });
  }
);

export { router as signinRouter };

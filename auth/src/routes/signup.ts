import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  validateResource,
} from "@oo-ticketing-dev/ticketing-common";
import { UserModel } from "../models/user.model";
import { CreateUserInput, createUserSchema } from "../schemas/auth.schema";

const router = express.Router();

router.post(
  "/api/users/signup",
  validateResource(createUserSchema),
  async (req: Request<{}, {}, CreateUserInput, {}>, res: Response) => {
    const { email, password, name } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }
    const newUser = UserModel.build({
      email,
      password,
      name,
    });
    await newUser.save();
    // generate json web token and store in a cookie
    const userJwt = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userJwt,
    };
    return res
      .status(201)
      .json({ user: newUser, message: "Signed up successfully" });
  }
);

export { router as signupRouter };

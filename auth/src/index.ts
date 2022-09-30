import { Application } from "express";
import mongoose from "mongoose";
import { app } from "./app";

const start = async (app: Application) => {
  if (!process.env.JWT_KEY) {
    throw new Error("No JWT_KEY");
  }
  if (!process.env.AUTH_DATABASE_URL) {
    throw new Error("No AUTH_DATABASE_URL");
  }
  try {
    await mongoose.connect(process.env.AUTH_DATABASE_URL);
    console.log("Connected to database");
  } catch (err: any) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });
};

start(app);

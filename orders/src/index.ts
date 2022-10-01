import { Application } from "express";
import mongoose from "mongoose";
import { app } from "./app";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { natsWrapper } from "./nats-wrapper";

const start = async (app: Application) => {
  console.log("Starting up orders... nice");
  if (!process.env.JWT_KEY) {
    throw new Error("No JWT_KEY");
  }
  if (!process.env.ORDERS_DATABASE_URL) {
    throw new Error("No ORDERS_DATABASE_URL");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("No NATS_CLUSTER_ID");
  }
  if (!process.env.NATS_URL) {
    throw new Error("No NATS_URL");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("No NATS_CLIENT_ID");
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    await mongoose.connect(process.env.ORDERS_DATABASE_URL);
    console.log("Connected to database");
  } catch (err: any) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });
};

start(app);

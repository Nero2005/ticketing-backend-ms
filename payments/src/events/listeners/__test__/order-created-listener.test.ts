import {
  OrderCreatedEvent,
  OrderStatus,
} from "@oo-ticketing-dev/ticketing-common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../../models/orders.model";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: "2022-09-27T14:20:00",
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 15,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it("creates the order", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const order = await OrderModel.findById(data.id);
  expect(order!.id).toEqual(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acknowledges the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

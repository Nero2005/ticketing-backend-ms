import {
  OrderCancelledEvent,
  OrderStatus,
} from "@oo-ticketing-dev/ticketing-common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../../models/orders.model";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const order = await OrderModel.build({
    id: orderId,
    status: OrderStatus.Created,
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  }).save();
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order };
};

it("sets the order status to cancelled", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const order = await OrderModel.findById(data.id);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it("acknowledges the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

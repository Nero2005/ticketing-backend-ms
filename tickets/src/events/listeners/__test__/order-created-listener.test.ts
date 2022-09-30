import {
  OrderCreatedEvent,
  OrderStatus,
} from "@oo-ticketing-dev/ticketing-common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../../models/tickets.model";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = await TicketModel.build({
    title: "concert",
    price: 25,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }).save();
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: "2022-09-27T14:20:00",
    ticket: {
      id: ticket.id,
      price: 5,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};

it("sets the orderId of the ticket", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await TicketModel.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acknowledges the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const props = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(props.orderId).toEqual(data.id);
});

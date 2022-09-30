import { OrderCancelledEvent } from "@oo-ticketing-dev/ticketing-common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../../models/tickets.model";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const ticket = await TicketModel.build({
    title: "concert",
    price: 25,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }).save();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket.set({
    orderId,
  });
  await ticket.save();
  const data: OrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket, orderId };
};

it("removed the orderId of the ticket", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await TicketModel.findById(ticket.id);
  console.log(updatedTicket);
  expect(updatedTicket!.orderId).toBeUndefined();
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
  expect(props.id).toEqual(data.ticket.id);
});

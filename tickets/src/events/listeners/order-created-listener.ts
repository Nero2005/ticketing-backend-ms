import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/tickets.model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queue: string = "tickets-service";
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticket = await TicketModel.findById(data.ticket.id);
    if (!ticket) throw new NotFoundError("Ticket");
    ticket.set({
      orderId: data.id,
    });
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      userId: ticket.userId,
      title: ticket.title,
      price: ticket.price,
      orderId: ticket.orderId,
    });
    msg.ack();
  }
}

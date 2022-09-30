import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/tickets.model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queue: string = "tickets-service";
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const ticket = await TicketModel.findById(data.ticket.id);
    if (!ticket) throw new NotFoundError("Ticket");
    ticket.set({
      orderId: undefined,
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

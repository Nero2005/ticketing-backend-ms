import {
  Listener,
  NotFoundError,
  Subjects,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from "@oo-ticketing-dev/ticketing-common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/tickets.model";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queue: string = "orders-service";
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const ticket = await TicketModel.findByEvent(data);
    if (!ticket) throw new NotFoundError("Ticket");
    const { title, price } = data;
    ticket.set({
      title,
      price,
    });
    await ticket.save();
    msg.ack();
  }
}

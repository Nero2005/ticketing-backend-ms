import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from "@oo-ticketing-dev/ticketing-common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/tickets.model";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queue: string = "orders-service";
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    await TicketModel.build({
      id,
      title,
      price,
    }).save();
    msg.ack();
  }
}

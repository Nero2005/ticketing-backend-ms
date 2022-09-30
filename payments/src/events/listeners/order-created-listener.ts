import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/orders.model";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queue: string = "payments-service";
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = await OrderModel.build({
      id: data.id,
      userId: data.userId,
      version: data.version,
      status: data.status,
      price: data.ticket.price,
    }).save();
    msg.ack();
  }
}

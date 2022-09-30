import {
  ExpirationCompleteEvent,
  Listener,
  NotFoundError,
  OrderStatus,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/orders.model";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queue: string = "orders-service";
  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await OrderModel.findById(data.orderId).populate("ticket");
    if (!order) throw new NotFoundError("Order");
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    msg.ack();
  }
}

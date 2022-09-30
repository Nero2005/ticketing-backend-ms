import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/orders.model";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queue: string = "payments-service";
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await OrderModel.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order) throw new NotFoundError("Order");
    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    msg.ack();
  }
}

import {
  Listener,
  NotFoundError,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/orders.model";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queue: string = "orders-service";
  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await OrderModel.findById(data.orderId);
    if (!order) throw new NotFoundError("Order");
    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();
    msg.ack();
  }
}

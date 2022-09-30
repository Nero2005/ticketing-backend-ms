import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

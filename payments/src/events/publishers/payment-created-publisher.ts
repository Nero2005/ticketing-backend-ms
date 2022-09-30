import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

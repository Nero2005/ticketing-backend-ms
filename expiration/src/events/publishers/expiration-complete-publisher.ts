import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@oo-ticketing-dev/ticketing-common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}

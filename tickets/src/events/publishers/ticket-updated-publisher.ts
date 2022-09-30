import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@oo-ticketing-dev/ticketing-common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

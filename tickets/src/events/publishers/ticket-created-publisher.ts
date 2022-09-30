import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@oo-ticketing-dev/ticketing-common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}

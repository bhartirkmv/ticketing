import { Publisher , Subjects , TicketUpdatedEvent } from "@bhartitickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
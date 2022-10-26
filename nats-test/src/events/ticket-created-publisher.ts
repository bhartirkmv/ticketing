import { Publisher } from "../../../common/src/events/base-publisher";

import { TicketCreatedEvent } from "./ticket-created-event";

import { Subjects } from "./subjects";


// Publisher is a generic class, that is why we have TicketCreatedEvent type 
// associated with the Publisher
export class TicketCreatedPublisher extends Publisher <TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
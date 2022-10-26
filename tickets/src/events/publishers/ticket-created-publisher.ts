import { Publisher , Subjects , TicketCreatedEvent } from '@bhartitickets/common';

// This is a generic class, so we need to mention the type of event that we 
// are going to emit from this publisher.
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated;
}


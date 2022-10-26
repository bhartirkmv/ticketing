import { Message } from 'node-nats-streaming';

import { Subjects , Listener , TicketCreatedEvent } from '@bhartitickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

// Listener is a generic type, That's why we need to put this thing
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  // It is very easy to misspell the queue-group-name. That is why we are 
  // defining it only once in a separate file and then using the same everywhere else
  queueGroupName = queueGroupName;

  // This message property will come much handy when we call ack()
  // We need to get an acknowledgement when the event is successfully listened.
  // This is a signal to node-nats-streaming server that the message has been received and it need
  // not send it to another copy of the service listening to this event.
  async onMessage( data: TicketCreatedEvent['data'], msg: Message){
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title, 
      price
    });
    await ticket.save();

    msg.ack();
  }
}

// This class means we need to implement the abstract properties. But the base properties
// Of the original abstract class remains intact with all the child classes as well.
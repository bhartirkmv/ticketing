

import { Message} from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';


// Listener is a generic class, so, we need to provide an argument for type T
export class TicketCreatedListener extends Listener< TicketCreatedEvent > {

  // By providing this annotation, we make sure that we can never 
  // Change the value of subject to anything else.
  // readonly is an alternate for final in JAVA
  // It prevents a property of a class from being changed.
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'payment-service';

  // Typescript is making sure, we always put correct argument on the data type
  onMessage(data: TicketCreatedEvent['data'], msg: Message){
    console.log('Event data!', data);
    msg.ack();
  }  

}
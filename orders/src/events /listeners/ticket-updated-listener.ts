import { Message } from 'node-nats-streaming';
import { Subjects, Listener , TicketUpdatedEvent } from '@bhartitickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {

    // The below version thing is to validate the version. if the version is
    // not correct, It will throw an error and because of that ack will not happen.
    // As ack does not happen, NATS server will re attempt to send the event again.

    // In order to make sure that in future errors do not pop up while typing, we are doing this
      const ticket = await Ticket.findByEvent(data);

      if(!ticket) {
        throw new Error('Ticket not found');
      }
      const { title , price } = data;
      ticket.set({
        title,
        price
      });

      // When we do ticket.save()-- It will increament the version to match the 
      // new version.
      await ticket.save();
      msg.ack();
  }
}


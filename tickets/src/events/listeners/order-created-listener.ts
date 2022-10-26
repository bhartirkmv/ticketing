// We will take the help of typescript to help us through development

import { Listener, OrderCreatedEvent , Subjects} from "@bhartitickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

// The listener is a generic type and we need to provide a type argument.
export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  readonly  subject = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // When this function is called, we need to find the ticket and lock it down

    // Find the ticket that the order is reserving 
    const ticket = await Ticket.findById(data.ticket.id);



    // If no ticket, throw error
    if(!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId property.
    ticket.set({ orderId: data.id});

    // Save the ticket 

    await ticket.save();
    // This is a good example of how to implement a listener that publishes its own events
    // We need to await to make sure that if there is an error that pops up, then 
    // The next command which is msg.ack() is not called. That kind of makes sure that 
    // we do not acknowledge before we are certain about the acknowledgement.
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId : ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version

    });

    // Ack the message
    msg.ack();

  }

}
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@bhartitickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // Create a listener 
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // We need to generate an ID on the fly.
  // Create and save a ticket inside the ticket collection 
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();
  // Create a fake data object 
  const data : TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 999,
    userId : 'adjnjnmdd'
  }
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  // Create a false msg object 

  // Return all of this stuff

  return { msg, data, ticket, listener};

};


it(' finds, updates and saves a ticket', async () => {
  const { msg, data, ticket , listener } = await setup();

  await listener.onMessage(data,msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(ticket.version+1);

});

it('acks the message ', async () => {

  const { msg, data, listener} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();

});

// The tests above are happy path tests. 
// We want to add a few scenarios so that we can handle some bad scenarios as well.

it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener , ticket } = await setup();
  data.version =10;

  // if we do not have a try catch block over here, 
  // If there is a failure ( Error being thrown) in the thing that we are testing
  // It will automatically lead to the failure of our test case. 
  try{
    await listener.onMessage(data, msg);

  } catch (err) {

  }
  
  expect(msg.ack).not.toHaveBeenCalled();
});
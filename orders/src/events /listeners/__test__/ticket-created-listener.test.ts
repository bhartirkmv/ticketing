import mongoose from "mongoose";
import { TicketCreatedEvent } from "@bhartitickets/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

// We will create a reusable setup function which can be used
// at both the places.
// This is the way we will setup the tests for every listener.
const setup = async () => {
  // create an instance of the listener 
  const listener = new TicketCreatedListener(natsWrapper.client);


  // create a fake data event 
  const data : TicketCreatedEvent['data'] = {
    version: 0,
    // The id has to be a real mongodb id, because we are going to create 
    // an entry to the local mongodb database using this id.
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  // create a fake message object-- Message is a type of object coming from 
  // the node-nats-streaming 
  // -- this ignore is for telling typescript that it should let it be 
  // We are going to implement as we want to.
  // @ts-ignore
  const msg : Message = {
    // When we call ack, we are actually going to invoke that function.
    ack: jest.fn()
  }

  return { listener , data , msg};
};

it('creates and saves a ticket', async () => {
  
  const { listener , data , msg } = await setup();
  // create an instance of the listener 

  await listener.onMessage(data, msg);
  // For running a query we need the Ticket model over here. 
  // I ahd a confusion earlier that how does the ticket model gets invoked 
  // from this file, but the thing is , we are invoking the  function in this file
  // And wuthin that file which contains the function , the Ticket model has been imported.
  

  // Write assertions to make sure a ticket was created.
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message' , async () => {
  
  

  // call the onMessage function with the data object and the message Object.
  const { listener , data , msg } = await setup();
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack() function is called.
  expect(msg.ack).toHaveBeenCalled();


});
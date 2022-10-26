import mongoose from "mongoose";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent , OrderStatus} from "@bhartitickets/common";
import { Message } from "node-nats-streaming";


const setup =  async () => {
  // Create an instance of a Listener

  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and Save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price : 99,
    userId : 'asff'
  });

  await ticket.save();

  // Create the fake data event
  // Basicaly we are faking in terms of how the actual data is going to come.
  const data : OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'wdjmdnd',
    expiresAt: 'sddmdnmd',
    ticket: {
      id: ticket.id,
      price: ticket.price,

    }
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener , ticket , data, msg};

};

it('sets the orderId of the ticket', async () => {

  const { listener, ticket ,data , msg } = await setup();
  // ticket that we have here , is an out of date ticket document
  // when the onMessage function is called- The ticket will be updated

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);


 
});

it('acks the message', async () => {
  const { listener, ticket ,data , msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket ,data , msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  // @ts-ignore
  console.log(natsWrapper.client.publish.mock.calls);

  // We can tell typescript that something is mock function by using the below lines as we;l

  // (natsWrapper.client.publish as jest.Mock).mock.calls
  

});


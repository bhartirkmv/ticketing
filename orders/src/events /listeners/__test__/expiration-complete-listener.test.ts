import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderStatus, ExpirationCompleteEvent } from "@bhartitickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'asksbsn',
    expiresAt: new Date(),
    ticket
  });

  await order.save();

  const data : ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  //@ts-ignore
  const msg: Message =  {
    ack: jest.fn()
  }

  return { listener, order , ticket, data , msg};
};

it('updates the order status to cancelled', async () => {
  const { listener , order , ticket , data , msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits the Ordercancelled event ', async () => {
  const { listener , order , ticket , data , msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // JSON.parse() is used to convert the JSON object to a javascript object.
  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(eventData.id).toEqual(order.id);

});

it('acks the message', async () => {
  const { listener , order , ticket , data , msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
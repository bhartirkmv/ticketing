import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order , OrderStatus} from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/orders for post requests',  async () => {
  const response = await request(app)
  .post('/api/orders')
  .send({});

  expect(response.status).not.toEqual(404);
});

it('Can only be accessed when the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie',global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if the ticket does not exist ', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticketId
    })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  // We need to do a little bit of setup for this test.
  // We have to first create a ticket --> Save it to database
  // Create an order --> Save it to database.
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    
    title: 'concert',
    price: 20
  });
  await ticket.save();
  const order = Order.build({
    userId: 'banmanna',
    status : OrderStatus.Created,
    ticket : ticket,
    expiresAt : new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id})
    .expect(400);

});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    
    title: 'concert',
    price:20
  });

  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId : ticket.id})
    .expect(201);

});


// It reminds us that we need to implement this test functionality.
it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    
    title: 'concert',
    price:20
  });

  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId : ticket.id})
    .expect(201);

    // It just tests whether the function has been called.
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});





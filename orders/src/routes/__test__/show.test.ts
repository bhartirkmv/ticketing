import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';



it ('fetches the order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    
    title: 'concert',
    price: 20
  });
  await ticket.save();

  const user = global.signin();

  // Make a request to build an order with this ticket
  const { body : order} =await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId : ticket.id})
    .expect(201);

  

  // Make request to fetch this order
  const { body : fetchOrder } = await request(app)
  // We need to use string interpolation to use order.id
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

    expect(fetchOrder.id).toEqual(order.id);

});

it ('returns an error if one user tries to fetch another users order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    
    title: 'concert',
    price: 20
  });
  await ticket.save();

  const user = global.signin();

  // Make a request to build an order with this ticket
  const { body : order} =await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId : ticket.id})
    .expect(201);

  

  // Make request to fetch this order
  const { body : fetchOrder } = await request(app)
  // We need to use string interpolation to use order.id
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);

    

});



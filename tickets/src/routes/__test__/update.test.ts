import request from 'supertest';

import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

// 400 is invalid request 
// 401 is forbidden -- Authorization access maybe 

it('returns a 404 if a provided id does not exist ', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'asshgfdhs',
      price: 20
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated ', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'asshgfdhs',
      price: 20
    })
    .expect(401);
});


//  Right now we have only one userId floating around the entore application.

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'asfhjdkd',
      price: 20
    })

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'gsnshsbnm',
      price: 34
    })
    .expect(401);

  
  
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdfghjkl',
      price: 20
    })

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 30
    })
    .expect(400);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'sjsghjs',
      price: -30
    })
    .expect(400);

});

it('updates the tickets provided valid inputs', async () => {
  const cookie = global.signin();
  const response = request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'sjhdgfbjms',
      price: 20
    });

  await request(app)
    .put(`/api/tickets/${(await response).body.id}`)
    .set('Cookie', cookie)
    .send({
      title:'new title',
      price :100
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${(await response).body.id}`)
    .send();
  expect(ticketResponse.body.title).toEqual('new title');
  expect(ticketResponse.body.price).toEqual(100);
});

it('Publishes an event', async () => {
  const cookie = global.signin();
  const response = request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'sjhdgfbjms',
      price: 20
    });

  await request(app)
    .put(`/api/tickets/${(await response).body.id}`)
    .set('Cookie', cookie)
    .send({
      title:'new title',
      price :100
    })
    .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signin();
  const response = request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'sjhdgfbjms',
      price: 20
    });

  
    const ticket = await Ticket.findById((await response).body.id);
    ticket!.set({ orderId:  new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    await request(app)
    .put(`/api/tickets/${(await response).body.id}`)
    .set('Cookie', cookie)
    .send({
      title:'new title',
      price :100
    })
    .expect(400);


    // 400 is the bad request error.
});


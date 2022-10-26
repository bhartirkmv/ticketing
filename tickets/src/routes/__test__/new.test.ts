import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

// Jest now knows that we are trying to mock that file. 
// So, anything in our test tries to use that file, jest will reroute that request to 
// the fake file that we created in __mocks__

it('has a route handler listening to /api/tickets for post requests',  async () => {
  const response = await request(app)
  .post('/api/tickets')
  .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

  expect(response.status).toEqual(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided ', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 10
    })
    .expect(400);


});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'assjdd',
      price: -10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'fgdnmsb'
    })
    .expect(400);
});

it('creates a ticket with valid inputs ', async () => {

  //  Add in a check to make sure a ticket was saved to our database.
  // This find function finds all the elements inside the Ticket.
  
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'asdbnd',
      price: 20
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

// We are going to create a ticket and then actually look at that mock function 
// to ensure that thing actually got invoked.
it('Publishes an event ', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'asdbnd',
      price: 20
    })
    .expect(201);

  // Right after this , we should be able to say that the publish function was called,
    //console.log(natsWrapper);
    // mock functions keeps track internally how many times it has been called. Different 
    // arguments it has been provided. We are going to write out different expectations about those number
    // of calls , arguments with which it is called 
    expect (natsWrapper.client.publish).toHaveBeenCalled();

});

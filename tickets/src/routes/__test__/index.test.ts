import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'asldk',
      price:20
    });
};

it('can fetch a list of tickets ', async () => {
  // Because we are getting a promise from the creatTicket() function
  // We do need to await it. Any type of http request returns a promise only.
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);

});
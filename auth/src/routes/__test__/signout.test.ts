import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'bhartirkmv@gmail.com',
      password: 'password'
    })
    .expect(201);

  // Because below there is a post request, we need to send back 
  // something. So, we send back an empty object.

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
  console.log(response.get('Set-Cookie'));
});
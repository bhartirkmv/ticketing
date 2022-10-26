import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
  

  const cookie = await global.signin();
// Because attaching cookies with all subsequent requests is not 
// a feature of supertest. We would not be getting back the cookies in the 
// below request. And the response.body would be undefined.

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('Responds with null if not authenticated', async () =>{
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
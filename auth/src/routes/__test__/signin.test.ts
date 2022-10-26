import request from 'supertest';
import { app } from '../../app';

it('Fails when a email that does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'bhartirkmv@gmail.com',
      password: 'password'
    })
    .expect(400);
});

it('Fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'bhartirkmv@gmail.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'bhartirkmv@gmail.com',
      password: 'asgdhjsjdhbs'
    })
    .expect(400);
});

it('On signin we should be able to send some cookie when given valid credentials', async ()=> {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'bhartirkmv@gmail.com',
      password: 'password'
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'bhartirkmv@gmail.com',
      password: 'password'
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
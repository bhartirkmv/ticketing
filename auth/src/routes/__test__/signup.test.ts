import request from 'supertest';

// Supertest is used to simulate a request 
// intended for our route handler.

import { app } from '../../app';



it('returns a 201 on successful signup', async () => {
  return  request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

    
});

it('Returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'bharti',
      password: 'password'
    })
    .expect(400);
});

it('Returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'bhartirkmv@gmail.com',
      password: 'p'
    })
    .expect(400);
});

it('Returns a 400 with missing email and password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      
    })
    .expect(400);
});

// We can use two consucutive statements within a test case. 
// The final result will be an and of the two results.

it('Disallows duplicate emails', async ()=> {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'nbhartii@gmail.com',
      password: 'password'

    })
    .expect(201);


  await request(app)
    .post('/api/users/signup')
    .send({
      email:'nbhartii@gmail.com',
      password: 'passwd'
    })
    .expect(400);
});

it('Sets a cookie after a successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'harsh@gmail.com',
      password: 'password'
    })
    .expect(201);
    // get is a method that is built into respose
    // that allows us to get any of the headers that has been set. 

    expect(response.get('Set-Cookie')).toBeDefined();
});
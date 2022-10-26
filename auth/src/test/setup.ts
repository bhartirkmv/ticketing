
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';


// This is a code to tell typescript that there is a 
// global property called signin

declare global {
  var signin: () => Promise<string[]>;
}

// We are going to define a hook function.
// Whatever we pass inside this function will be executed before
// all of our tests starts executing.
// 
let mongo: any;


beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {}).then((result) => {
    console.log(result.connection.readyState)  
    console.log(result.connection.host)
   }).catch((err) => {
  
   });;

});


// Before each test starts, we are going to reach mongodb database
// and we are going to delete or reset all the data inside there.

// We are going to delete all those different collections.

beforeEach(async () => {
  
  const collections = await mongoose.connection.db.collections();

  for( let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll ( async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});



// This global keyword is to define a global function.
// which can be accessed from anywhere. The reason 
// for defining this global function is that we do not want to 
// import the file containing this function in all our test suites.

global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,password
    })
    .expect(201);

    const cookie = response.get('Set-Cookie');
    return cookie;


};

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';



// This is a code to tell typescript that there is a 
// global property called signin

declare global {
  var signin: () => string[];
}

// We are going to define a hook function.
// Whatever we pass inside this function will be executed before
// all of our tests starts executing.
// 
let mongo: any;

// This makes sure that all the tests inside our project use the 
// fake or mocked version of the NATS STREAMING SERVER.
jest.mock('../nats-wrapper.ts');
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
  jest.clearAllMocks();
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

global.signin =  () => {
  // Build a JWT payload. It will be an object { id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };


  // Create the JWT by using the same type of JWT sign when we were 
  // creating the Json web token.
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object -- Take the JWT and stick it into an object with a key jwt and value with the value of token

  const session = { jwt: token};
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base 64.
  const base64 = Buffer.from(sessionJSON).toString('base64');
  // return the string thats the cookie with encoded data

  // The expectation when we are using supertest is that all of our cookies 
  // included in an array. 
  return [`session=${base64}`];

};
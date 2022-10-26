import mongoose from 'mongoose';
import { app } from './app';

// We will be connecting with mongodb and starting the server 
// in this file , independent of app.js so that the mongodb dependencies 
// can be kept out of the testing environment.

const start = async () => {
  // The reason for checking this here is : If we implement this in our route handler,
  // Then we will get to know about the error much later, only when we 
  // Try to access that route handler after deployment.
  console.log('Starting up....');
  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY must be defined');
  }
  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI must be defined');
  }
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to mongodb');
  }catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('v0.0.1');
    console.log('Listening on port 3000');
  });
  
};

start();

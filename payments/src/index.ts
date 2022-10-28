import mongoose from 'mongoose';
import { app } from './app';
// The lowercase n indicates that the natsWrapper is an instance of the class.
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';


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
  if(!process.env.NATS_CLIENT_ID){
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if(!process.env.NATS_URL){
    throw new Error('NATS_URL must be defined');
  }
  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  try{
    // 1st argument: clusterId, 2nd Argument: client Id 3rd Argument : url
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID,process.env.NATS_URL );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      // When process.exit() is called the container  having the tickets 
      // project is killed and then the pod restarts the container again.
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());


    new OrderCancelledListener(natsWrapper.client).listen();
    new OrderCreatedListener(natsWrapper.client).listen();
   

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

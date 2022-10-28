import { natsWrapper } from './nats-wrapper';

import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  console.log('Starting up....');
  
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

    new OrderCreatedListener(natsWrapper.client).listen();

  }catch (err) {
    console.error(err);
  }  
  
};

start();

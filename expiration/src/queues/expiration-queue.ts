import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

// Its always better to create an interface to list the 
// information that we are going to store in a particular kind of 
// data transfer

interface Payload {
  orderId: string;
}


// The first Argument is the Queue-name which is similar to a channel. i.e. 
// the bucket inside of redis where the queue elements will be stored.
// The second argument is the options object. This is to connect the queue
// to the redis server.

// We will apply Payload as a generic type to Queue
// This gives typescript enough information about what kind 
// of data is flowing through the Queue
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  },
});


// THis processes the job which comes back from Redis
expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId
  });
});

export { expirationQueue };
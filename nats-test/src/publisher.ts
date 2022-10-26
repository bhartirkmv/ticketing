// Dedicated to piblishing events

import nats from 'node-nats-streaming';

import { TicketCreatedPublisher } from './events/ticket-created-publisher';
console.clear();

// We are going to use this library to create a client. 
// The client is going to connect to NATS STREAMING SERVER.
// And exchange some information with it. 

// In documentations instead of client they name it stan-- It is 
// a terminology that they like to use.


// The second argument 'abc' is called the client Id.
const stan = nats.connect('ticketing', 'abc', {
  // Remember the NATS server is running in a kubernetes cluster
  // This localhost will not be available directly.
  url: 'http://localhost:4222'
});

// To wait for this thing to connect , we can't use the async await. We 
// Will primarily have to take the event driven approach.

// After connection the nats client will emit a connect event.
// When that connect event is emitted , the function will be called.
stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);

  // Publishing an event to the NATS streaming server is an asynchronous event.
  try{
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20
    });

    
  } catch (err) {
    console.error(err);
  }
  

  
  // We can not send Javascript across the NATS streaming server. 
  // In order to send javascript object across the NATS server , we first need to convert it
  // it to JSON, which is a plain string.
  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20
  // });

  // // The callback function is optional. This callback function is going 
  // // going to be invoked after we publish the data. 

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });
});








// Dedicated to Listening to events 

// All information in NATS streaming is exchanged as string for us. 

import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
});

stan.on('connect', () => {

  // Here we do not have a callback function. Rather we take the data and 
  // then add an event listener.
  // We have added this listener to a QUEUE GROUP. So, even if we create multiple instances
  // The event will be emitted to only one member inside the queue group.
  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();

});

// These are watching for interrupt signals or terminate signals.
// These are the signals that are sent to the current process anytime the ts-node-dev 
// restarts the programs or we hit cntl+C on the terminal.\
// This reaches out to the NATS streaming server and asks it to close down.
process.on('SIGINT', ()=> stan.close());
process.on('SIGTERM', () => stan.close());


///////////////////////////////////////////




import { Listener, OrderCreatedEvent , Subjects} from "@bhartitickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

// Listener is a generic type. We need to plugin the type of event we want to listen for.

// We are assigning the properties to the class.
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject =  Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data : OrderCreatedEvent['data'], msg : Message) {

    // We need to calculate the time difference bwtween right now(The time this code runs)
    // and the time -- expiresAt provided in the data section.
    //  The below line will give us a time in milliseconds.
    const delay = new Date(data.expiresAt).getTime()- new Date().getTime();
    console.log('Waiting this many milliseconds to process the job:', delay);
    await expirationQueue.add({
      orderId: data.id
    }, {
      delay
    });

    msg.ack();

  }

}


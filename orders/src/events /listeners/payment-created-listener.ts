import { Subjects , Listener , PaymentCreatedEvent, OrderStatus } from '@bhartitickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';

import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data : PaymentCreatedEvent['data'], msg : Message) {
    // In the orders model, we need to update that particular order to be complete.
    const order = await Order.findById(data.orderId);

    if(!order){
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete
    });
    await order.save();

    msg.ack();

  }
}

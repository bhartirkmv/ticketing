
import { OrderCancelledEvent , Subjects , Listener, OrderStatus} from "@bhartitickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg : Message) {
    // We are using findOne , because we want to find the order with an 
    // Id as well as the version.

    // In case of order we need not worry too much , because there is 
    // never going to be intermediate update events.
    // But we are including version just to possibly prepare the code 
    // for any future events like order updated.
    const order = await Order.findOne({
      _id: data.id,
      // For order cancelled event the version would have been updated by one.
      version: data.version-1
    });

    if(!order) {
      throw new Error('Order not found!');
    }

    order.set({
      status: OrderStatus.Cancelled
    });
    await order.save();
    
    msg.ack();

  }
}
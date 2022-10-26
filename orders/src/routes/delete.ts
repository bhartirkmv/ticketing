import express, { Request , Response } from 'express';
import { NotAuthorizedError, NotFoundError, requireAuth } from '@bhartitickets/common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledEvent } from '@bhartitickets/common';
import { OrderCancelledPublisher } from '../events /publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';



// When a user makes a delete request , we are not actually going to delete 
// The underlying order. rather we are going to update the status to cancelled.


const router = express.Router();

router.delete('/api/orders/:orderId',requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('ticket');

  if(!order) {
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id ){
    throw new NotAuthorizedError();

  }

  order.status = OrderStatus.Cancelled;

  // Always remember to call await. Without that the async call will not be 
  // completed and thus we will get an error.
  await order.save();
  
  // Publish an event saying this was cancelled.

  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id
    }
  });

  // Status of 204 indicated that a record is deleted.
  res.status(204).send(order);
});

export { router as deleteOrderRouter };

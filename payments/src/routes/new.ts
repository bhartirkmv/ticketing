// We are calling this new because we are creating a new charge record in our 
// database

import express, { Request, Response} from 'express';
import { body } from 'express-validator';

import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@bhartitickets/common';

import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { stripe } from '../stripe';
import { natsWrapper } from '../nats-wrapper';

import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';

const router = express.Router();

router.post('/api/payments',
  requireAuth,  
  [
    body('token')
      .not()
      .isEmpty()
      .withMessage('token must be provided'),
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('order not specified')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // The req.params is the thing which is present directly on the url
    const { token , orderId } = req.body;

    console.log(orderId);

    const order = await Order.findById(orderId);
    if(!order) {
      throw new NotFoundError();
    }
    if(order.userId != req.currentUser!.id){
      throw new NotAuthorizedError();
    }

    // After this we want to make sure that the order is not yet cancelled.

    if(order.status == OrderStatus.Cancelled){
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    // Only after these three checks are passed, we are going to bill our credit card.
    // All the API hits needs await. Because it is always going to take them some t
    // time to resolve the result.
    // We are going to get a promise and we are awaiting the promise to resolve.
    const charge = await stripe.charges.create({
      currency : 'usd',
      amount: order.price * 100,
      source: token
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    });

    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({ id: payment.id});
});

export { router as createChargeRouter};
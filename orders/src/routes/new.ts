
import mongoose from 'mongoose';
import express, { Request , Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@bhartitickets/common';

import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

import { OrderCreatedPublisher } from '../events /publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

// We can extract the below thing possibly into an environment variable 
// That will allow us make changes to the window of time in the Kubernetes config file 
// rather than redeploying the application.
const EXPIRATION_WINDOW_SECONDS = 1*60;

router.post('/api/orders', requireAuth, 
[
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input : string ) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Ticket id must be provided')

], validateRequest, 
async (req: Request, res: Response) => {
  // Find the ticket the user is trying to order in database
  const { ticketId } = req.body;
  const ticket = await Ticket.findById(ticketId);

  if(!ticket){
    // Our error handling will automatically cputure the error and 
    // throw a 404 error in a particluar format
    throw new NotFoundError();
  }
  const isReserved = await ticket.isReserved();
  
  if(isReserved) {
    throw new BadRequestError('Ticket is already reserved');
  }

  // Calculation an expiration date for this order. After that the ticket will
  // be unlocked and the order will move into cancelled state.
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  // Build the order and save it to the database
  // Build method takes orderAttrs and returns an OrderDoc
  const order = Order.build({
    userId: req.currentUser!.id,
    status : OrderStatus.Created,
    expiresAt: expiration,
    ticket : ticket
  });

  await order.save();
  // Publish an event saying that an order was created.

  // In order to publish an event we need an active NATS client.
  // The NATS wrapper class does exactly that for us.

  // Whenever we communicate time stamp across various services 
  // We do that in time zone agnostic manner.

  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    status: order.status,
    userId: order.userId,
    expiresAt : order.expiresAt.toISOString(),
    ticket : {
      id: ticket.id,
      price: ticket.price
    }

  });

  res.status(201).send(order);
});

export { router as newOrderRouter };

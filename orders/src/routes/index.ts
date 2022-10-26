import { requireAuth } from '@bhartitickets/common';
import express, { Request , Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders',requireAuth, async (req: Request, res: Response) => {
  // Orders are tied to a specific user. We want only specific users to see orders 
  // that they have created.
  // The populate method populates the ticket content in place of the 
  // ticket object in response.
  const orders = await Order.find({
    userId : req.currentUser!.id
  }).populate('ticket');
  res.send(orders);
});

export { router as indexOrderRouter };

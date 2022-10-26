import express, { Request , Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@bhartitickets/common';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  // findbyId is a query helper built directly into our model.
  const ticket = await Ticket.findById(req.params.id);

  if(!ticket) {
    throw new NotFoundError();
  }

  // Whenever we leave off the statuscode it will default to 200.
  res.send(ticket);
});

export { router as showTicketRouter };
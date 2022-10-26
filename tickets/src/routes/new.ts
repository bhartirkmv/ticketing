import express , { Request , Response } from 'express';
import { body } from 'express-validator';
import { requireAuth , validateRequest} from '@bhartitickets/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// We will put the validation logic right after requireAuth
// because if the user is not authenticated, we do not want to waste time 
// in validating what the user has supplied 

router.post('/api/tickets',requireAuth,[
  body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),

  body('price')
    .isFloat({ gt: 0})
    .withMessage('Price must be greater than zero'),

  

], validateRequest, async ( req: Request, res: Response) => {
  const { title, price } = req.body;

  // We get access to the req.currentuser property because we have already executed 
  // the currentUser middleware back inside app.ts.

  const ticket = Ticket.build({
    title,
    price,
    userId: req.currentUser!.id
  });
  await ticket.save();
  // The title and other attributes over database and req.body are not the same
  // Remember, we have some pre and post saved hooks in mongoose.
  // We might sanitize the entries before saving it to the database.
  await new TicketCreatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    version: ticket.version,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId
  });
  res.status(201).send(ticket);
});

export { router as createTicketRouter};
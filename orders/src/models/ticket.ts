import mongoose from 'mongoose';
import { updateIfCurrentPlugin} from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';



// We might think that we already have a ticket model built in the tickets section
// Why can't we use this Tickets model in the common library and reuse it
// The answer is NO. Because this ticket we have created inside the orders might 
// have totally different attributes compared to the tickets in the tickets directory.
// There can be a lot of additional info present in the tickets service
// but the orders service cares only about the title, price and the version
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// We are going to add a new method to decide whether a ticket has been reserved or not.

export interface TicketDoc extends mongoose.Document {
  title: string,
  price: number,
  version: number;
  // If this things gets called, we are going to return promise as a boolean.
  isReserved() : Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build( attrs : TicketAttrs) : TicketDoc;
  //We will add a new query method to find a ticket by model and version.
  findByEvent(event : {
    id: string, version: number
  }) : Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,

  },
  price: {
    type: Number,
    required : true,
    min: 0
  }
}, {
  // Mongodb saves the id as _id. It is only when we convert it to JSON and 
  // Send it over, we convert that _id to id.
  toJSON: {
    transform ( doc, ret) {
      ret.id = ret._id;
      delete ret._id;

    }
  }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);


// This statics object can be used to define a function over the entire model
ticketSchema.statics.build = (attrs : TicketAttrs) => {
  return new Ticket({
    // We are doing _id because mongodb saves items with id as _id
    // If we put only id then an extra property will be made
    // And mongodb will create a property _id with random Id.
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  }
   
  );
}

ticketSchema.statics.findByEvent = ( event : { id: string, version: number}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version -1
  });
};
// We need to define a function keyword rather than an arrow function
ticketSchema.methods.isReserved = async function() {

   // This ticket is not already reserved by someone else 
  // -- If a ticket has been reserved, that means it has been associated with an order.
  // And the order document status nust be not cancelled
  // If the order is cancelled, the ticket it is associated with is not a valid reservation anymore.

  // Run query to look for all orders. Find an order where the ticket
  // is the ticket we just found *and* the orders status is *not* cancelled.
  // If we find an order from that means that the ticket *is* reserved.
  // this === the ticket document that we called reserved on.
  const existingOrder = await Order.findOne({
    ticket : this,
    status : {
      // This is a special mongodb operator
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });
  // We are doing the !! to just return a boolean.
  return !!existingOrder;

}



const Ticket = mongoose.model<TicketDoc, TicketModel> ('Ticket', ticketSchema);

export { Ticket };
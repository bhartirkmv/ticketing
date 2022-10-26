import mongoose from 'mongoose';
// The below npm module is being used for versioning. --
// Use case -- Optimistic Concurrency Control
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';


interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// The goal of this interface is to list out all the properties that a 
// document has. Or an instance of a ticket has. This includes all the other 
// properties that a document has as well. For example -- One of the properties 
// Listed out in the mongodb document is __v.

interface TicketDoc extends mongoose.Document{
  title: string;
  price: number;
  userId: string;
  // This version property is going to allow us to write out something such as ticket.version
  version: number;
  // We need to mark this property as optional
  // The question mark indicates that orderId is either string or undefined.
  orderId?: string;

}

interface TicketModel extends mongoose.Model<TicketDoc>{

  // The first value is the function and the second one is the 
  // return value of that function.
  build (attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
  title: {
    // This type below (String) is the type of mongoose and not typescript.
    type: String,
    required: true
  },
  price: {
    type: Number,
    required : true
  }, 
  userId : {
    type: String, 
    required : true
  }, 
  orderId: {
    type: String
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);


ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
}


const Ticket = mongoose.model<TicketDoc, TicketModel> ('Ticket', ticketSchema);

export { Ticket };
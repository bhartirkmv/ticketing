import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@bhartitickets/common';
import { TicketDoc } from './ticket';

export { OrderStatus };


// This interface is about creating a new order.
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket : TicketDoc;
}

/// The properties that are required to create an order 
// might be different that end up in an order.

// This interface is about an instance of an order.
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt : Date;
  ticket : TicketDoc;
  version: number;
}

interface OrderModel extends mongoose.Model <OrderDoc> {
  build(attrs : OrderAttrs) : OrderDoc;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  status : {
    type: String,
    required : true,
    // mongoose will make sure that status is set to one of the 
    // values listed inside the enum.
    enum: Object.values(OrderStatus),
    default : OrderStatus.Created, 
  },
  expiresAt : {
    // This is not required in all the circumstances.
    // If someone has paid for an order, we do not want to expire that order
    type: mongoose.Schema.Types.Date
  },
  ticket : {
    // ref: 'Ticket' -- This property will be used to populate tickets.
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }

}, {
  // The goal of this is to transform some info into JSON
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = ( attrs: OrderAttrs) => {
  return new Order(attrs);
};

// model is a generic type , that's why we are putting in two types besides it.
const Order = mongoose.model<OrderDoc, OrderModel> ('Order', orderSchema);

export { Order };

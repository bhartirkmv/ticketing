import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from '@bhartitickets/common';


// List of properties needed while building a model
interface OrderAttrs {
  id: string;
  version: number;
  userId : string;
  price : number;
  // For status, we will use the enum.
  status: OrderStatus;
}

// List of properties that an order has.
// The idea of _id property is already there in mongoose.Document
// We need not re list it 
interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status : OrderStatus;
}

// List of properties that the model itself contains.
// This is going to list out any custom method that we are 
// going to add to the overall collection.
interface OrderModel extends mongoose.Model<OrderDoc> {
  // There has to be a build model. Its going to take in some object 
  // of type orderattrs and return an instance of an OrderDoc.

  build ( attrs : OrderAttrs ) : OrderDoc;
}

// The properties inside the orderschema will be roughly same 
// as that listed in OrderDoc. The difference will be the version 
// Property which is automatically managed by mongoose-update-if module
const orderSchema = new mongoose.Schema({
  userId : {
    type: String,
    required : true
  }, 
  price: {
    type: Number,
    required : true
  }, 
  status : {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret){
      ret.id= ret._id;
      delete ret._id;
    }
  }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id : attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status

  });
}

const Order = mongoose.model<OrderDoc, OrderModel> ('Order', orderSchema);

export { Order };


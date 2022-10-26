import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { OrderStatus } from '@bhartitickets/common';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// This statement tells jest to redirect the import to stripe.ts file to the mocked file
// jest.mock('../../stripe.ts');

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asfsnfd',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'sgfhjs',
      orderId: order.id
    })
    .expect(401);


});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId : userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token:'sbjsbs'
    })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId : userId,
    version: 0,
    price,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  
  const stripeCharges = await stripe.charges.list({ limit : 10});
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount == price*100;
  });

  expect(stripeCharge).toBeDefined();
  // calls contains all the times the function was called 
  // We are taking 0th element because we know it is called 
  // Only one time and then we are taking the first element of that call.

  // While using as jest.Mock we are teaching typescript what to expect
  // We are not really testing reaching out to the stripe API itself.
  // // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // // expect(chargeOptions.source).toEqual('tok_visa');
  // // expect(chargeOptions.currency).toEqual('usd');


  const payment = await Payment.findOne({
    orderId : order.id,
    stripeId : stripeCharge!.id
  });

  // null and undefiend are two different things. If we use expect(null).tobeDefined
  // then it will always return true.
  expect(payment).not.toBeNull();

});
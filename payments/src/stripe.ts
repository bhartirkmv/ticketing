import Stripe from 'stripe';

// Stripe is a class and to make use of that class , 
// we need to create an instance out of that class.

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-08-01',
});

// We have got a single file , that is going to import stripe , 
// create an instance of this library and make it available to the
// rest of our project.


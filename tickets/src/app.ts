import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@bhartitickets/common';

import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';



const app = express();

// The below thing has been added to ensure that express trusts the 
// proxy, because it is running behind ingress- nginx

app.set('trust proxy', true);
app.use(json());

// In the cookieSession we are going to pass in a configuration object. 

// Whenever jest runs our test at the terminal, It is 
// going to set the NODE_ENV variable to the string 'test'
// So, if we are in any other environment, be it dev or prod
// this secure will be set to true.

app.use(
  cookieSession({
    signed: false,
    secure:false
    //secure: process.env.NODE_ENV !== 'test'
  })
);
// cookie-session has to run first so that it can take a look at the cookie and 
// set the req.session property. if we do not do this before then 
// whenever currentUser runs , it will be running too soon.
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);



// Any route that we do not recognize, 
// we are immediately gonna throw a not found error.

app.all('*', async (req, res, next) => {
  throw new NotFoundError() ;
});

app.use(errorHandler);


// These curly braces are required because we are doing a named export.
export { app };
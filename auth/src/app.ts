import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import cookieSession from 'cookie-session';


import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@bhartitickets/common';



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
    secure: process.env.NODE_ENV !== 'test'
  })
);
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res, next) => {
  throw new NotFoundError() ;
});

app.use(errorHandler);


// These curly braces are required because we are doing a named export.
export { app };
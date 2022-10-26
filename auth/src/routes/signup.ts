import express, { Request , Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@bhartitickets/common';
import { User } from '../models/user';



const router = express.Router();

router.post('/api/users/signup',[
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
  .trim()
  .isLength( { min: 4, max: 20} )
  .withMessage('Password must be between 4 and 20 characters')
], 
validateRequest,
async (req : Request, res : Response) => {

  
  const { email , password} = req.body;

  const existingUser = await User.findOne( { email });

  if(existingUser) {
    throw new BadRequestError('Email already in use');
  }

  const user = User.build({
    email,
    password
  })
  await user.save();

  // Generate JWT
  // In jwt.sign() the first argument is the payload that we want to store
  // In the jsonwebtoken. In the payload, we want to store some information anout the 
  // details of the user.

  const userJwt = jwt.sign({
    id: user.id,
    email: user.email
  }, process.env.JWT_KEY!);

  // Store it on the session req object.

  req.session = {
    jwt: userJwt
  };


  res.status(201).send(user);

});

export { router as signupRouter };
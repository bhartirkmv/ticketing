import express from 'express';

import { currentUser } from '@bhartitickets/common';


const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  

  // If the token has been messed with in any way, then this 
  // jwt.verify() is going to throw an error. So, we will handle it with a try 
  // catch block.

  // Below if req.currentUser is not there it will come as undefined 
  // We do not want to send over undefined rather we want to send null.
  res.send({currentUser: req.currentUser || null}); 


  
});

export { router as currentUserRouter };
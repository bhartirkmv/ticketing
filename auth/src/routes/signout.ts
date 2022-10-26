import express from 'express'

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  // This terminates the browsing session. And the 
  // cookies which are stored in the browser are deleted. 
  // That leads to the deletion of jwt as well.
  req.session =null;

  res.status(200).send({});
});

export { router as signoutRouter };
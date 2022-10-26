// To keep track of what the user has filled in the form, 
// we are going to use some hooks.

import { useState } from 'react';
// The below router object is what through which we programmatically 
// route the user around in our app.
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const signup = () => {

  // Inside the component, we are creating two new pieces of state.

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest , errors } = useRequest ({
    url: '/api/users/signup',
    method: 'post',
    body:{
      email, password
    },
    onSuccess: () => Router.push('/')
  });

  // Anytime someone hits the submit button, we want to handle the submission 
  // event coming off from the form. 

  const onSubmit = async (event) => {
    // The below statement is to make sure that the form does not 
    // Submit itself through the browser.
    event.preventDefault();
    
    await doRequest();
    

    
  };
  return (
    <form onSubmit = { onSubmit }>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label> Email Address</label>
        <input value= {email} onChange = {e => setEmail(e.target.value) } className="form-control" />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input value= {password} onChange = { e => setPassword(e.target.value )} type="password" className="form-control" />
      </div>
      { errors }
      
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};

export default signup;
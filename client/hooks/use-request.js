import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess}) => {
  // We are creating some errors piece of state that will be containing some 
  // jsx inside of it.
  // We will also be creating a function request, which will be executing the request itself.

  // Initially, the value of errors will be null until the time 
  // the use request has been called.
  const [errors, setErrors] = useState(null);
  const doRequest = async (props = {}) => {
    try{
      // The below line is to make sure that when one 
      // makes a bad request and then a good one 
      // The message of the earlier bad request goes away.
      setErrors(null);
      const response = await axios[method](url,{
        ...body, ...props
      });
      if(onSuccess) {
        // The onSuccess callback is called with response.data 
        onSuccess(response.data);
      }
      return response.data;
      
    }catch(err) {
      // If there is an error that occured, we are going to turn it into a jsx block
      // On err we get the actual errors on err.response.data.errors
      setErrors(
        <div className="alert alert-danger"> 
          <h4> Ooops...</h4>
          <ul className ="my-0">
            {
              err.response.data.errors.map(err => (
                <li key= {err.message}>{err.message} </li>
              ))
              }

          </ul>
        
        </div>
      );
      
    }
  };
  // The usual convention of using react hooks is returning an array
  // But here we will be returning an object.
  return { doRequest , errors };
};

export default useRequest;
import  Router  from "next/router";
import { useEffect } from "react";
import  useRequest  from '../../hooks/use-request';

const signout = () => {

  const { doRequest } = useRequest ({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/')
  });

  // We are using useEffect because we want to call the do request and 
  // that to only one time.
  // There is nothing like on click button etc.
  useEffect (() => {
    doRequest()
  }, []);
  return <div> Signing you out ....</div>;

};

export default signout;


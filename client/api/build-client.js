import axios from 'axios';

const buildClient = ( { req } ) => {
  if( typeof window === 'undefined') {
    // We are on the server
    // When a request is coming from the server, It is pretty much sure that 
    // The browser window corresponding that will be undefined.
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // we must be on the browser 
    // We need not add any headers because the browser will take care of all that in this case.

    return axios.create({
      baseUrl: '/'
    });
  }

};

export default buildClient;
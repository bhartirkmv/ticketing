// At the top we are going to import bootstrap CSS
// This custom app component can also be used to show some 
// screen that will be used to show some elements on the screen 
// that will ve visible on every single page. 


// The component prop is the page that we are trying to show. 
// If we want to show something which is visible on every page, 
// we can wrap the component with that extra element.

import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// This is a custom app component which wraps up the pages.

const AppComponent = ( { Component , pageProps, currentUser } ) => {

  // We pass down the pageProps inside the child component as a prop.

  return <div>
    <Header currentUser={currentUser} />
    <div className='container'>
      <Component currentUser = { currentUser} {...pageProps} />
    </div>
    
  </div> 
  
  
};

AppComponent.getInitialProps = async (appContext) => {
  
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  // This statement runs for all the pages present inside the App component.
  let pageProps = {};
  // We are manually running the geyInitiaProps function for the child component
  // Of course only if they have the getInitialProps defined inside of them.
  if(appContext.Component.getInitialProps){
    // This pageProp is the prop inside a particular component, If there is any
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  
  return {
    pageProps,
    ...data
  }
};

export default AppComponent;
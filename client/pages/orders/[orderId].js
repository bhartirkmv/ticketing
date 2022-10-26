import { useEffect , useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';


const OrderShow = ( { order, currentUser} ) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors} = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: () => Router.push('/orders'),
  });

  // When my component renders, I want to call the below function only one time.
  useEffect(()=> {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft/1000));

      // We need to make sure that we call the helper function once per second.
    }
    // We are calling findTime Left manually first time to ensure the issue 
    // Mentioned below does not appear.
    findTimeLeft();
    // setInterval is going to call the findTimeLeft 1000 ms into the future.
    // In our component the time is going to appear after 1 s has been elapsed.
    // Thos setInterval runs forever unless we stop it. Even if we navigate away from this component
    // This timer is going to run forever.
    const timerId = setInterval(findTimeLeft,1000);
    return () => {
      clearInterval(timerId);
    };

  }, []);
  // Every second we will recalculate the number of milliseconds left and 
  // update a piece of state, which will cause the entire component to re-render.
  if(timeLeft < 0) {
    return (
      <div> Order expired</div>
    )
  }
  return(
    <div>
      Time left to pay : {timeLeft} seconds.
      <StripeCheckout 
      token = { ({ id} )=> doRequest({ token: id})}
      stripeKey = "pk_test_51LvsG5FTw1HtxW3fZGtLQgcaRaTZSL8cuidaiaxGhqoIdilTGe8vWPhsdYPubGp2m90xxzKrFASHETyylrxb6Tbs00XhI56ngn"
      amount = {order.ticket.price * 100}
      email = { currentUser.email}
      />
      { errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client ) => {

  // This is specifically orderId because that is how we named our file.
  const { orderId } = context.query;

  const {data} = await client.get(`/api/orders/${orderId}`);
  return { order : data };
};

export default OrderShow;
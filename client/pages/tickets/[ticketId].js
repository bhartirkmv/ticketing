
import Router from 'next/router';
import useRequest from "../../hooks/use-request";
// This type of route is called a wildcard route.
const TicketShow = ({ ticket }) => {

  const { doRequest , errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId : ticket.id
    },
    onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      { errors }
      <button onClick= { ()=> doRequest() } className="btn btn-primary">Purchase</button>
    </div>
  );
}

TicketShow.getInitialProps = async (context, client) => {
  // We are specifically pulling out a property called ticketId 
  // because that is what this file is named.
  const { ticketId } = context.query;
  const { data }=  await client.get(`/api/tickets/${ticketId}`);

  return { ticket : data };

};

export default TicketShow;

import Link from 'next/link';
// We need the Link component of Next JS to use it with anchor tag
//....

const LandingPage = ({ currentUser, tickets }) => {
  // We are creating a helper variable to make sure the big block of jsx easier to read.
  const ticketList = tickets.map((ticket) => {
    // Whenever we build ia list of different elements, react wants us to define 
    // a key property.
    return(
      <tr key= {ticket.id}>
      <td>{ ticket.title}</td>
      <td> {ticket.price }</td>
      <td>
        <Link href= "/tickets/[ticketId]" as= {`/tickets/${ticket.id}`}>
          <a> View</a>
        </Link>
      </td>
    </tr>
    );
    
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>

          </tr>
        </thead>

        <tbody>
          { ticketList}
        </tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  // This component has now the access to client, which we are using to make 
  // request during the initial rendering process.
  const { data } = await client.get('/api/tickets');

  return { tickets : data };
};

export default LandingPage;
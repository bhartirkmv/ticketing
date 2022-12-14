import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
  // Create an instance of a ticket 
  const ticket = Ticket.build({
    title: 'concert',
    price : 5,
    userId: '123'
  });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice

  // We can use ticket.id because of the JSON change property that
  // we used earlier.
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched 
  firstInstance!.set({ price: 10});
  secondInstance!.set({ price :15});

  // Save the first fetched ticket
  await firstInstance!.save();
  // Save the second fetched ticket
  

  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  // We want our code to enter into catch. Because that means 
  // that the statement did not run correctly.
  // If the below line is somehow invoked, it just means that the test failed.
  throw new Error('Should not reach this point');
});

it('increaments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
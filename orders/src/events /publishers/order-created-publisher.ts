import { Publisher, Subjects, OrderCreatedEvent } from "@bhartitickets/common";

// This Publisher is a generic class which takes an event that it is going to emit
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}


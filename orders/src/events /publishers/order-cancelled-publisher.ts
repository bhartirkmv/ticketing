import { Subjects, Publisher , OrderCancelledEvent } from "@bhartitickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
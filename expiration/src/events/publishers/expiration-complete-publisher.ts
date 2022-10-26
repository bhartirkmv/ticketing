import { Subjects, Publisher , ExpirationCompleteEvent } from "@bhartitickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
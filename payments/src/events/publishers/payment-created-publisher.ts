import { Subjects , PaymentCreatedEvent, Publisher} from "@bhartitickets/common";


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  readonly subject = Subjects.PaymentCreated;
}
import {
  buildSchema,
  DocumentType,
  modelOptions,
  prop,
} from "@typegoose/typegoose";
import mongoose, { Model } from "mongoose";

type PaymentAttrs = {
  orderId: string;
  stripeId: string;
};

interface PaymentDoc extends DocumentType<Payment> {
  orderId: string;
  stripeId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentModelType extends Model<PaymentDoc> {
  build(order: PaymentAttrs): PaymentDoc;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
})
export class Payment {
  @prop({ required: true })
  public orderId!: string;

  @prop({ required: true })
  public stripeId!: string;

  public static build(payment: PaymentAttrs) {
    return new PaymentModel(payment);
  }
}

const paymentSchema = buildSchema(Payment);
const PaymentModel = mongoose.model<PaymentDoc, PaymentModelType>(
  "Payment",
  paymentSchema
);
export { PaymentModel };

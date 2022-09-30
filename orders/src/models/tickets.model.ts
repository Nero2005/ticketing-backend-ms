import {
  buildSchema,
  DocumentType,
  modelOptions,
  prop,
} from "@typegoose/typegoose";
import mongoose, { Model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderModel, OrderStatus } from "./orders.model";

type TicketAttrs = {
  id: string;
  title: string;
  price: number;
};

export interface TicketDoc extends DocumentType<Ticket> {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

interface TicketModelType extends Model<TicketDoc> {
  build(ticket: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
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
export class Ticket {
  @prop({ required: true })
  public title!: string;

  @prop({ required: true, min: 0 })
  public price!: number;

  public static build({ id, title, price }: TicketAttrs) {
    return new TicketModel({
      _id: id,
      title,
      price,
    });
  }

  public static findByEvent({ id, version }: { id: string; version: number }) {
    return TicketModel.findOne({
      _id: id,
      version: version - 1,
    });
  }
}
const ticketSchema = buildSchema(Ticket);
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await OrderModel.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder;
};
const TicketModel = mongoose.model<TicketDoc, TicketModelType>(
  "Ticket",
  ticketSchema
);

export { TicketModel };

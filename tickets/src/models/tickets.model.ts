import {
  buildSchema,
  DocumentType,
  modelOptions,
  prop,
} from "@typegoose/typegoose";
import mongoose, { Model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { CreateTicketInput } from "../schemas/tickets.schema";

type TicketAttrs = CreateTicketInput & {
  userId: string;
};

export interface TicketDoc extends DocumentType<Ticket> {
  userId: string;
  title: string;
  price: number;
  version: number;
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TicketModelType extends Model<TicketDoc> {
  build(ticket: TicketAttrs): TicketDoc;
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
  public userId!: string;

  @prop({ required: true })
  public title!: string;

  @prop({ required: true, min: 0 })
  public price!: number;

  @prop({})
  public orderId?: string;

  public static build(ticket: TicketAttrs) {
    return new TicketModel(ticket);
  }
}
const ticketSchema = buildSchema(Ticket);
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);
const TicketModel = mongoose.model<TicketDoc, TicketModelType>(
  "Ticket",
  ticketSchema
);

export { TicketModel };

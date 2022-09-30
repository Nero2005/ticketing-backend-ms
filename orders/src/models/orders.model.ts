import { OrderStatus } from "@oo-ticketing-dev/ticketing-common";
import {
  buildSchema,
  DocumentType,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import mongoose, { Model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Ticket, TicketDoc } from "./tickets.model";

export { OrderStatus };

type OrderAttrs = {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
};

export interface OrderDoc extends DocumentType<Order> {
  userId: string;
  version: number;
  status: string;
  expiresAt: Date;
  ticket: TicketDoc;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderModelType extends Model<OrderDoc> {
  build(order: OrderAttrs): OrderDoc;
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
export class Order {
  @prop({ required: true })
  public userId!: string;

  @prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.Created,
  })
  public status!: string;

  @prop({ required: true, type: () => mongoose.Schema.Types.Date })
  public expiresAt!: Date;

  @prop({ ref: "Ticket" })
  public ticket!: Ref<Ticket>;

  public static build(order: OrderAttrs) {
    return new OrderModel(order);
  }
}
const orderSchema = buildSchema(Order);
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);
const OrderModel = mongoose.model<OrderDoc, OrderModelType>(
  "Order",
  orderSchema
);

export { OrderModel };

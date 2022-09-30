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

export { OrderStatus };

type OrderAttrs = {
  userId: string;
  status: OrderStatus;
  id: string;
  price: number;
  version: number;
};

export interface OrderDoc extends DocumentType<Order> {
  userId: string;
  status: string;
  price: number;
  version: number;
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

  @prop({ required: true })
  public price!: number;

  public static build(order: OrderAttrs) {
    return new OrderModel({
      _id: order.id,
      userId: order.userId,
      status: order.status,
      price: order.price,
      version: order.version,
    });
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

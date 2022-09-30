import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateResource,
} from "@oo-ticketing-dev/ticketing-common";
import express, { Request, Response, NextFunction } from "express";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { OrderModel } from "../models/orders.model";
import { PaymentModel } from "../models/payments.model";
import { natsWrapper } from "../nats-wrapper";
import {
  CreateChargeInput,
  createChargeSchema,
} from "../schemas/payments.schema";
import { stripe } from "../stripe";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  validateResource(createChargeSchema),
  async (req: Request<{}, {}, CreateChargeInput, {}>, res: Response) => {
    const { token, orderId } = req.body;
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("Order");
    if (req.user!.id !== order.userId) throw new NotAuthorizedError();
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError("Cannot pay for a cancelled order");
    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });
    const payment = await PaymentModel.build({
      orderId,
      stripeId: charge.id,
    }).save();
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });
    res.status(201).json({ payment });
  }
);

export { router as createChargeRouter };

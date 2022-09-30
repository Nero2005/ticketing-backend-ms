import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@oo-ticketing-dev/ticketing-common";
import express, { Request, Response } from "express";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { OrderModel, OrderStatus } from "../models/orders.model";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.patch(
  "/api/orders/:id",
  requireAuth,
  async (req: Request<{ id: string }>, res: Response) => {
    const order = await OrderModel.findById(req.params.id).populate("ticket");
    if (!order) throw new NotFoundError("Order");

    if (order.userId !== req.user!.id) throw new NotAuthorizedError();
    order.status = OrderStatus.Cancelled;
    await order.save();
    // publish an event cancelled event
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    return res.json({ order });
  }
);

export { router as deleteOrderRouter };

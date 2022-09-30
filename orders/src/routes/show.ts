import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@oo-ticketing-dev/ticketing-common";
import express, { Request, Response } from "express";
import { OrderModel } from "../models/orders.model";

const router = express.Router();

router.get(
  "/api/orders/:id",
  requireAuth,
  async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    const order = await OrderModel.findById(req.params.id).populate("ticket");
    if (!order) throw new NotFoundError("Order");

    if (order.userId !== req.user!.id) throw new NotAuthorizedError();
    return res.json({ order });
  }
);

export { router as showOrderRouter };

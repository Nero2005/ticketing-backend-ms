import { requireAuth } from "@oo-ticketing-dev/ticketing-common";
import express, { Request, Response } from "express";
import { OrderModel } from "../models/orders.model";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await OrderModel.find({ userId: req.user!.id }).populate(
    "ticket"
  );
  return res.json({ orders });
});

export { router as indexOrderRouter };

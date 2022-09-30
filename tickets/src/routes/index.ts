import express, { Request, Response } from "express";
import { TicketModel } from "../models/tickets.model";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await TicketModel.find({
    orderId: undefined,
  });

  return res.status(200).json({ tickets });
});

export { router as indexTicketRouter };

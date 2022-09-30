import {
  NotFoundError,
  requireAuth,
  validateResource,
} from "@oo-ticketing-dev/ticketing-common";
import express, { Request, Response } from "express";
import { TicketModel } from "../models/tickets.model";
import {
  CreateTicketInput,
  createTicketSchema,
} from "../schemas/tickets.schema";

const router = express.Router();

router.get(
  "/api/tickets/:id",
  requireAuth,
  async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    const { id } = req.params;
    const foundTicket = await TicketModel.findOne({ _id: id });
    if (!foundTicket) {
      throw new NotFoundError("Ticket");
    }

    return res.status(200).json({ ticket: foundTicket });
  }
);

export { router as showTicketRouter };

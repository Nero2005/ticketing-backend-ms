import {
  requireAuth,
  validateResource,
} from "@oo-ticketing-dev/ticketing-common";
import express, { Request, Response } from "express";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { TicketModel } from "../models/tickets.model";
import { natsWrapper } from "../nats-wrapper";
import {
  CreateTicketInput,
  createTicketSchema,
} from "../schemas/tickets.schema";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  validateResource(createTicketSchema),
  async (req: Request<{}, {}, CreateTicketInput, {}>, res: Response) => {
    const { title, price } = req.body;
    console.log(req.user!.id);
    const newTicket = TicketModel.build({
      title,
      price,
      userId: req.user!.id,
    });
    await newTicket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: newTicket.id,
      title: newTicket.title,
      price: newTicket.price,
      userId: newTicket.userId,
      version: newTicket.version,
    });

    return res.status(201).json({ ticket: newTicket });
  }
);

export { router as createTicketRouter };

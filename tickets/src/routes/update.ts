import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateResource,
} from "@oo-ticketing-dev/ticketing-common";
import {
  CreateTicketInput,
  createTicketSchema,
} from "../schemas/tickets.schema";
import { TicketModel } from "../models/tickets.model";
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  validateResource(createTicketSchema),
  async (
    req: Request<{ id: string }, {}, CreateTicketInput>,
    res: Response
  ) => {
    const { id } = req.params;
    const { title, price } = req.body;
    const ticket = await TicketModel.findById(id);
    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    if (ticket.userId !== req.user!.id) {
      throw new NotAuthorizedError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved ticket");
    }

    ticket.set({
      title,
      price,
    });
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });
    return res.json({ ticket });
  }
);

export { router as updateTicketRouter };

import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateResource,
} from "@oo-ticketing-dev/ticketing-common";
import express, { Request, Response } from "express";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { OrderModel, OrderStatus } from "../models/orders.model";
import { TicketModel } from "../models/tickets.model";
import { natsWrapper } from "../nats-wrapper";
import { CreateOrderInput, createOrderSchema } from "../schemas/orders.schema";

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  validateResource(createOrderSchema),
  async (req: Request<{}, {}, CreateOrderInput, {}>, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await TicketModel.findById(ticketId);

    if (!ticket) throw new NotFoundError("Ticket");

    const isReserved = await ticket.isReserved();
    if (isReserved) throw new BadRequestError("Ticket is already reserved");

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = OrderModel.build({
      userId: req.user!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status as OrderStatus,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });
    return res.status(201).json({ order });
  }
);

export { router as newOrderRouter };

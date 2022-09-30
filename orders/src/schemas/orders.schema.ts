import { number, object, string, TypeOf } from "zod";

export const createOrderSchema = object({
  body: object({
    ticketId: string({
      required_error: "Ticket is required",
    }).min(1, "Ticket is required"),
  }),
});

export type CreateOrderInput = TypeOf<typeof createOrderSchema>["body"];

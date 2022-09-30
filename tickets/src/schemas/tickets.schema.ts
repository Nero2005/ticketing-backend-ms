import { number, object, string, TypeOf } from "zod";

export const createTicketSchema = object({
  body: object({
    title: string({
      required_error: "Title is required",
    }).min(1, "Title is required"),
    price: number({
      required_error: "Price is required",
    }).gt(0, "Price must be greater than 0"),
  }),
});

export type CreateTicketInput = TypeOf<typeof createTicketSchema>["body"];

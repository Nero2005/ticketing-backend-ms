import { object, string, TypeOf } from "zod";

export const createChargeSchema = object({
  body: object({
    token: string({
      required_error: "Token is required",
    }).min(1, "Token is required"),
    orderId: string({
      required_error: "Order id is required",
    }).min(1, "Order id is required"),
  }),
});

export type CreateChargeInput = TypeOf<typeof createChargeSchema>["body"];

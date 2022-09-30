import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }).min(1, "Name is required"),
    email: string({
      required_error: "Email is required",
    }).email("Email is invalid"),
    password: string({
      required_error: "Password is required",
    })
      .trim()
      .min(4, "Password must be between 4 and 20")
      .max(20, "Password must be between 4 and 20"),
  }),
});

export const signinUserSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Email is invalid"),
    password: string({
      required_error: "Password is required",
    })
      .trim()
      .min(4, "Password must be between 4 and 20")
      .max(20, "Password must be between 4 and 20"),
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type SigninUserInput = TypeOf<typeof signinUserSchema>["body"];

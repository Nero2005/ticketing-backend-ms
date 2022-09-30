import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { OrderModel, OrderStatus } from "../../models/orders.model";
import { PaymentModel } from "../../models/payments.model";
import { stripe } from "../../stripe";

// jest.mock("../../stripe");

it("can only be accessed if user is signed in", async () => {
  const res = await request(app).post("/api/payments").send({});
  expect(res.status).toEqual(401);
});

it("returns a status other than 401 if user is signed in", async () => {
  const res = await request(app)
    .post("/api/payments")
    .set("Cookie", await signin())
    .send({});

  expect(res.status).not.toEqual(401);
});

it("returns a 404 if the order is not found", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", await signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: "1",
    })
    .expect(404);
});

it("returns a 401 if the order does not belong to the user", async () => {
  const order = await OrderModel.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    version: 0,
  }).save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", await signin())
    .send({
      orderId: order.id,
      token: "1",
    })
    .expect(401);
});

it("returns a 400 if the order is cancelled", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = await OrderModel.build({
    userId,
    status: OrderStatus.Cancelled,
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    version: 0,
  }).save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", await signin(userId))
    .send({
      orderId: order.id,
      token: "1",
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = await OrderModel.build({
    userId,
    status: OrderStatus.Created,
    id: new mongoose.Types.ObjectId().toHexString(),
    price,
    version: 0,
  }).save();

  const res = await request(app)
    .post("/api/payments")
    .set("Cookie", await signin(userId))
    .send({
      orderId: order.id,
      token: "tok_visa",
    })
    .expect(201);

  console.log(res.body);

  const charges = await stripe.charges.list({ limit: 50 });
  const charge = charges.data.find((charge) => charge.amount === price * 100);
  expect(charge).toBeDefined();
  expect(charge!.currency).toEqual("usd");

  const payment = await PaymentModel.findOne({
    orderId: order.id,
  });
  expect(payment).not.toBeNull();
});

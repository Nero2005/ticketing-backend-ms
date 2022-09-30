import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { TicketModel } from "../../models/tickets.model";

it("can only be accessed if user is signed in", async () => {
  const id = new mongoose.Types.ObjectId().toString("hex");
  const res = await request(app).get(`/api/orders/${id}`);
  expect(res.status).toEqual(401);
});

it("returns a status other than 401 if user is signed in", async () => {
  const id = new mongoose.Types.ObjectId().toString("hex");
  const res = await request(app)
    .get(`/api/orders/${id}`)
    .set("Cookie", await signin())
    .send({});

  expect(res.status).not.toEqual(401);
});

it("returns a 404 if the order does not exist", async () => {
  const cookie = await signin();
  const ticket = await TicketModel.build({
    title: "concert",
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  }).save();

  const {
    body: { order },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
  const id = new mongoose.Types.ObjectId().toString("hex");
  await request(app)
    .get(`/api/orders/${id}`)
    .set("Cookie", await signin())
    .expect(404);
});

it("returns a 401 if the user did not make the order", async () => {
  const cookie = await signin();
  const ticket = await TicketModel.build({
    title: "concert",
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  }).save();

  const {
    body: { order },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", await signin())
    .expect(401);
});

it("fetches the order", async () => {
  const cookie = await signin();
  const ticket = await TicketModel.build({
    title: "concert",
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  }).save();

  const {
    body: { order },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const res = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", cookie)
    .expect(200);
  expect(res.body.order.id).toEqual(order.id);
});

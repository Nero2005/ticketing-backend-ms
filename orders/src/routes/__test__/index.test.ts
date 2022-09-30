import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { TicketModel } from "../../models/tickets.model";

it("can only be accessed if user is signed in", async () => {
  const res = await request(app).get("/api/orders").send({});
  expect(res.status).toEqual(401);
});

it("returns a status other than 401 if user is signed in", async () => {
  const res = await request(app)
    .get("/api/orders")
    .set("Cookie", await signin())
    .send({});

  expect(res.status).not.toEqual(401);
});

it("fetches orders for a particular user", async () => {
  const cookie1 = await signin();
  const cookie2 = await signin();
  const ticket1 = await TicketModel.build({
    title: "concert 1",
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  }).save();
  const ticket2 = await TicketModel.build({
    title: "concert 2",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  }).save();
  const ticket3 = await TicketModel.build({
    title: "concert 3",
    price: 30,
    id: new mongoose.Types.ObjectId().toHexString(),
  }).save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie1)
    .send({
      ticketId: ticket1.id,
    })
    .expect(201);
  const {
    body: { order: order1 },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2)
    .send({
      ticketId: ticket2.id,
    })
    .expect(201);
  const {
    body: { order: order2 },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2)
    .send({
      ticketId: ticket3.id,
    })
    .expect(201);

  const res = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie2)
    .expect(200);
  expect(res.body.orders.length).toEqual(2);
  expect(res.body.orders[0].id).toEqual(order1.id);
  expect(res.body.orders[1].id).toEqual(order2.id);
  expect(res.body.orders[0].ticket.id).toEqual(ticket2.id);
  expect(res.body.orders[1].ticket.id).toEqual(ticket3.id);
});

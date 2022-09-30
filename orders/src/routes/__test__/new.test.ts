import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { OrderModel, OrderStatus } from "../../models/orders.model";
import { TicketModel } from "../../models/tickets.model";
import { natsWrapper } from "../../nats-wrapper";

it("can only be accessed if user is signed in", async () => {
  const res = await request(app).post("/api/orders").send({});
  expect(res.status).toEqual(401);
});

it("returns a status other than 401 if user is signed in", async () => {
  const res = await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({});

  expect(res.status).not.toEqual(401);
});

it("returns an error if an ticket id is not provided", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({
      ticketId: "",
    })
    .expect(400);

  await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({})
    .expect(400);
});

it("returns an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId().toString("hex");
  await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = TicketModel.build({
    title: "concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const order = OrderModel.build({
    ticket,
    userId: new mongoose.Types.ObjectId().toString("hex"),
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = TicketModel.build({
    title: "concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const res = await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const findOrder = await OrderModel.findOne({
    id: res.body.order.id,
  });
  // on saving a document and finding it, id and _id exist, in response json only id exists
  // but in references, only _id exist unless populated
  expect(findOrder?.ticket._id).toEqual(ticket._id);
});

it("emits an order created event", async () => {
  const ticket = TicketModel.build({
    title: "concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const res = await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

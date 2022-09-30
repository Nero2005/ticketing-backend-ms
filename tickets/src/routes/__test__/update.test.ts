import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { TicketModel } from "../../models/tickets.model";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const res = await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", await signin())
    .send({ title: "title", price: 1 });

  expect(res.status).toEqual(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const res1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({ title: "title 1", price: 10 });

  expect(res1.body.ticket.title).toEqual("title 1");

  const res = await request(app)
    .put(`/api/tickets/${res1.body.ticket.id}`)
    .send({ title: "title edited", price: 11 });

  expect(res.status).toEqual(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const res1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({ title: "title 1", price: 10 });

  const res = await request(app)
    .put(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", await signin())
    .send({ title: "title edited", price: 11 });

  expect(res.status).toEqual(401);

  const res2 = await request(app)
    .get(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", await signin())
    .send();

  expect(res2.body.ticket.price).toEqual(10);
});

it("returns a 400 provided an invalid title or price", async () => {
  const cookie = await signin();
  const res1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title 1", price: 10 });

  const res = await request(app)
    .put(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 10 });

  const res2 = await request(app)
    .put(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "title", price: -10 });

  expect(res.status).toEqual(400);
  expect(res2.status).toEqual(400);

  const res3 = await request(app)
    .get(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", await signin())
    .send();

  expect(res3.body.ticket.price).toEqual(10);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = await signin();
  const res1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title 1", price: 10 });

  const res = await request(app)
    .put(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "title updated", price: 11 });

  expect(res.status).toEqual(200);

  const res3 = await request(app)
    .get(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", await signin())
    .send();

  expect(res3.body.ticket.price).toEqual(11);
  expect(res3.body.ticket.title).toEqual("title updated");
});

it("publishes an event", async () => {
  const cookie = await signin();
  const res1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title 1", price: 10 })
    .expect(201);

  const res2 = await request(app)
    .put(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "title updated", price: 11 })
    .expect(200);

  const res3 = await request(app)
    .get(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", await signin())
    .send()
    .expect(200);

  expect(res3.body.ticket.price).toEqual(11);
  expect(res3.body.ticket.title).toEqual("title updated");

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects a ticket that is reserved", async () => {
  const cookie = await signin();
  const res1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title 1", price: 10 })
    .expect(201);

  const ticket = await TicketModel.findById(res1.body.ticket.id);
  ticket!.set({
    orderId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket!.save();

  const res2 = await request(app)
    .put(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", cookie)
    .send({ title: "title updated", price: 11 })
    .expect(400);
});

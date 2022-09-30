import request from "supertest";
import { app } from "../../app";
import { TicketModel } from "../../models/tickets.model";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const res = await request(app).post("/api/tickets").send({});
  expect(res.status).not.toEqual(404);
});

it("can only be accessed if user is signed in", async () => {
  const res = await request(app).post("/api/tickets").send({});
  expect(res.status).toEqual(401);
});

it("returns a status other than 401 if user is signed in", async () => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({});

  expect(res.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({
      title: "new title",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({
      title: "new title",
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await TicketModel.find({});
  expect(tickets.length).toEqual(0);

  const title = "new title";

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({
      title,
      price: 10,
    })
    .expect(201);

  tickets = await TicketModel.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
});

it("publishes an event", async () => {
  const title = "new title";
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({
      title,
      price: 10,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

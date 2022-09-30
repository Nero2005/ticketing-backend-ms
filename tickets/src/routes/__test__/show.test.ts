import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";

it("returns a 404 if ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const res = await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", await signin())
    .send();

  expect(res.status).toEqual(404);
});

it("returns the ticket if ticket is found", async () => {
  const title = "new title";
  const price = 10;

  const res1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const res = await request(app)
    .get(`/api/tickets/${res1.body.ticket.id}`)
    .set("Cookie", await signin())
    .send()
    .expect(200);

  expect(res.body.ticket.title).toEqual(title);
  expect(res.body.ticket.price).toEqual(price);
});

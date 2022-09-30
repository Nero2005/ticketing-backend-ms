import request from "supertest";
import { app } from "../../app";

const createTicket = async () => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({
      title: "title 1",
      price: 10,
    })
    .expect(201);
};

it("can fetch a list of tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const res = await request(app).get("/api/tickets").send();

  expect(res.status).toEqual(200);
  expect(res.body.tickets.length).toEqual(3);
});

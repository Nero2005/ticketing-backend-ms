import request from "supertest";
import { app } from "../../app";

it("returns a 400 with nonexistent email", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
      name: "Test Test",
    })
    .expect(400);
});

it("returns a 400 with incorrect password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
      name: "Test Test",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password2",
      name: "Test Test",
    })
    .expect(400);
});

it("returns a cookie with valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
      name: "Test Test",
    })
    .expect(201);

  const res = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
      name: "Test Test",
    })
    .expect(200);
  expect(res.get("Set-Cookie")).toBeDefined();
});

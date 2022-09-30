import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  const cookie = await signin();

  const res = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);
  // console.log(res.body);
  expect(res.body.user.email).toEqual("test@test.com");
});

it("responds with null current user if not authenticated", async () => {
  const res = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);
  // console.log(res.body);
  expect(res.body.user).toEqual(null);
});

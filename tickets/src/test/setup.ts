import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: () => Promise<string[]>;
}

jest.mock("../nats-wrapper.ts");

let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "mysupersafesecret";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = async () => {
  // build a json web token payload {id, email}
  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = { id, email: "test@test.com" };
  // sign token
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // build session
  const session = { jwt: token };
  // turn session into json
  const sessionJSON = JSON.stringify(session);
  // encode into base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  return [`session=${base64}`];
};

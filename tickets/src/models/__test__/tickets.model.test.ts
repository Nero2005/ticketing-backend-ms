import request from "supertest";
import { app } from "../../app";
import { TicketModel } from "../tickets.model";

it("implements optimistic concurrency control", async () => {
  const ticket = await TicketModel.build({
    title: "concert",
    price: 5,
    userId: "1234",
  }).save();

  const instance1 = await TicketModel.findById(ticket.id);
  const instance2 = await TicketModel.findById(ticket.id);

  instance1!.set({
    price: 10,
  });
  instance2!.set({
    price: 15,
  });

  await instance1!.save();

  try {
    await instance2!.save();
  } catch (err) {
    return;
  }
  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = await TicketModel.build({
    title: "concert",
    price: 5,
    userId: "1234",
  }).save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
  await ticket.save();
  expect(ticket.version).toEqual(3);
});

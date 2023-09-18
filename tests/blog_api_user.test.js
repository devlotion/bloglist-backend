const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");

const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const User = require("../models/user");

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("admin", 10);
  const user = new User({
    username: "root",
    passwordHash,
  });

  await user.save();
});

describe("invalid users", () => {
  // Initializes database with User (username: root, password: admin)
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("admin", 10);
    const user = new User({ username: "DragonSlayerxx", passwordHash });

    await user.save();
  });

  test("creating invalid user (same username)", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "DragonSlayerxx",
      name: "Luke Artas",
      password: "admin",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("username must be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  }, 10000);

  test("creating invalid user (short username)", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "no",
      name: "no",
      password: "validpassword",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("username is too short or missing");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  }, 10000);

  test("creating invalid user (short password)", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "validUsername",
      name: "Lotion",
      password: "no",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("password is too short or missing");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  }, 10000);
});

afterAll(() => {
  mongoose.connection.close();
});

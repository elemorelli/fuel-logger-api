const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, userTwoId, userOneToken, userTwoToken, populateDatabase } = require("./fixtures/db");

beforeEach(populateDatabase);

test("Should signup a new user", async () => {
  const newUser = {
    name: "new user",
    email: "new@user.com",
    password: "SomePass112233!",
  };

  const response = await request(app).post("/users").send(newUser).expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: newUser.name,
      email: newUser.email,
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe(newUser.password);
});

test("Should not signup user with invalid email", async () => {
  const newUser = {
    name: "invalid mail user",
    email: "invalidmail.com",
    password: "SomePass112233!",
  };

  await request(app).post("/users").send(newUser).expect(400);

  const user = await User.findOne({ email: "invalidmail.com" });
  expect(user).toBeNull();
});

test("Should not signup user with weak password", async () => {
  const newUser = {
    name: "weak password user",
    email: "weak@user.com",
    password: "password123",
  };

  await request(app).post("/users").send(newUser).expect(400);

  const user = await User.findOne({ email: "weak@user.com" });
  expect(user).toBeNull();
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.userOneToken).toBe(user.tokens[1].userOneToken);
});

test("Should not login nonexisting user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "nonregistered@user.com",
      password: userOne.password,
    })
    .expect(404);
});

test("Should not login user with bad password", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "invalidPassword",
    })
    .expect(404);
});

test("Should get profile for user", async () => {
  await request(app).get("/users/me").set("Authorization", `Bearer ${userOneToken}`).send().expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  await request(app).delete("/users/me").set("Authorization", `Bearer ${userOneToken}`).send().expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userTwoToken}`)
    .attach("avatar", "tests/fixtures/avatar.jpeg")
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should get own avatar", async () => {
  await request(app).get("/users/me/avatar").set("Authorization", `Bearer ${userOneToken}`).expect(200);
});

test("Should get others' avatar with no authentication", async () => {
  await request(app).get(`/users/${userOneId}/avatar`).expect(200);
});

test("Should get 404 on invalid user's avatar", async () => {
  await request(app).get(`/users/404/avatar`).expect(404);
});

test("Should get 404 on user without avatar", async () => {
  await request(app).get(`/users/${userTwoId}/avatar`).expect(404);
});

test("Should get 404 on own user without avatar", async () => {
  await request(app).get(`/users/me/avatar`).set("Authorization", `Bearer ${userTwoToken}`).expect(404);
});

test("Should not upload avatar for a non-image file", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userTwoToken}`)
    .attach("avatar", "tests/fixtures/textfile.txt")
    .expect(500);

  const user = await User.findById(userTwoId);
  expect(user.avatar).toBeUndefined();
});

test("Should delete user's avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOneToken}`)
    .attach("avatar", "tests/fixtures/avatar.jpeg")
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));

  await request(app).delete("/users/me/avatar").set("Authorization", `Bearer ${userOneToken}`).expect(200);

  const user2 = await User.findById(userOneId);
  expect(user2.avatar).toBeUndefined();
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOneToken}`)
    .send({
      name: "new name",
      email: "new@email.com",
      password: "ANewPass112233!!",
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe("new name");
  expect(user.email).toBe("new@email.com");
  expect(user.password).not.toBe("ANewPass112233!!");
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOneToken}`)
    .send({
      invalid_field: "invalid field",
    })
    .expect(400);

  const user = await User.findById(userOneId);
  expect(user.location).toBeUndefined();
});

test("Should not update unauthenticated user", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      name: "new name",
    })
    .expect(401);

  const user = await User.findById(userOneId);
  expect(user.name).not.toBe("new name");
});

test("Should not update user with invalid email", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOneToken}`)
    .send({
      name: "invalid email user",
      email: "newinvalidmail.com",
    })
    .expect(400);

  const user = await User.findById(userOneId);
  expect(user.name).not.toBe("invalid email user");
  expect(user.email).not.toBe("newinvalidmail.com");
});

test("Should not update user with weak password", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOneToken}`)
    .send({
      name: "weak password user",
      password: "password123",
    })
    .expect(400);

  const user = await User.findById(userOneId);
  expect(user.password).not.toBe("weak password user");
});

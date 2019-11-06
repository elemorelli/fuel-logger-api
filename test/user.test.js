const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, token, populateDatabase } = require("./fixtures/db");

beforeEach(populateDatabase);

test("Should signup a new user", async () => {

    const newUser = {
        name: "new user",
        email: "new@user.com",
        password: "SomePass112233!"
    };

    const response = await request(app)
        .post("/users")
        .send(newUser)
        .expect(201);

    // Assert that the DB was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();


    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: newUser.name,
            email: newUser.email
        },
        token: user.tokens[0].token
    });

    // Assert that the user is not saved as plan text
    expect(user.password).not.toBe(newUser.password);
});

test("Should login existing user", async () => {
    const response = await request(app)
        .post("/users/login")
        .send({
            email: userOne.email,
            password: userOne.password
        }).expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login nonexisting user", async () => {
    await request(app)
        .post("/users/login")
        .send({
            email: "nonregistered@user.com",
            password: userOne.password
        }).expect(400);
});

test("Should not login user with bad password", async () => {
    await request(app)
        .post("/users/login")
        .send({
            email: userOne.email,
            password: "invalidPassword"
        }).expect(400);
});

test("Should get profile for user", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send()
        .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401);
});

test("Should delete account for user", async () => {
    await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401);
});

test("Should update valid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "new name",
            email: "new@email.com",
            password: "ANewPass112233!!"
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
        .set("Authorization", `Bearer ${token}`)
        .send({
            location: "new location"
        })
        .expect(400);

    const user = await User.findById(userOneId);
    expect(user.location).toBeUndefined();
});

// TODO: Extra tests
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated
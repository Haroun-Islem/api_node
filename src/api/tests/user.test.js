const userController = require("../controllers/userController");
const User = require("../models/userModel");
const jsonwebtoken = require("jsonwebtoken");

jest.mock("../models/userModel");
jest.mock("jsonwebtoken");

describe("register", () => {
  test("returns a success message when a user is created", () => {
    const req = {
      body: { email: "sofiane@example.com", password: "password" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = new User(req.body);
    User.mockReturnValueOnce({
      save: jest.fn().mockImplementationOnce((callback) => {
        callback(null, user);
      }),
    });

    userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: `user created : ${user.email} `,
    });
  });

  test("returns an error message when a user cannot be created", () => {
    const req = { body: { email: "julien@example.com", password: "password" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const error = new Error("Unable to save user");
    User.mockReturnValueOnce({
      save: jest.fn().mockImplementationOnce((callback) => {
        callback(error, null);
      }),
    });

    userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: error });
  });
});

describe("login", () => {
  test("returns success message and token if credentials are valid", () => {
    const req = { body: { email: "test@example.com", password: "password" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      email: "test@example.com",
      password: "password",
      _id: "user_id",
    };
    User.findOne.mockImplementationOnce((query, callback) => {
      callback(null, user);
    });
    jsonwebtoken.sign.mockImplementationOnce(
      (payload, secret, options, callback) => {
        callback(null, "token");
      }
    );

    userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "login success",
      token: "token",
    });
  });

  test("returns an error message when user is not found", () => {
    const req = { body: { email: "test@example.com", password: "password" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findOne.mockImplementationOnce((query, callback) => {
      callback("User not found", null);
    });

    userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("returns an error message when password is incorrect", () => {
    const req = {
      body: { email: "test@example.com", password: "wrong_password" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      email: "test@example.com",
      password: "password",
      _id: "user_id",
    };
    User.findOne.mockImplementationOnce((query, callback) => {
      callback(null, user);
    });

    userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "login failed" });
  });
});

const mongoose = require("mongoose");
const User = require("../models/userModel");
const userController = require("../controllers/userController");

describe("User Controller", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/myapp", {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("Should register a new user", async () => {
    const req = {
      body: {
        email: "testuser@test.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await userController.userRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Utilisateur crée :testuser@test.com",
    });

    // Clean up
    await User.deleteOne({ email: "testuser@test.com" });
  });

  it("Should not register a user with invalid input", async () => {
    const req = {
      body: {
        password: "password123",
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await userController.userRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur." });
  });

  it("Should login an existing user", async () => {
    const user = new User({
      email: "testuser@test.com",
      password: "password123",
    });

    await user.save();

    const req = {
      body: {
        email: "testuser@test.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await userController.userLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: expect.any(String) })
    );

    // Clean up
    await User.deleteOne({ email: "testuser@test.com" });
  });

  it("Should not login a non-existing user", async () => {
    const req = {
      body: {
        email: "testuser@test.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await userController.userLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur inconnu" });
  });

  it("Should not login a user with invalid credentials", async () => {
    const user = new User({
      email: "testuser@test.com",
      password: "password123",
    });

    await user.save();

    const req = {
      body: {
        email: "testuser@test.com",
        password: "wrongpassword",
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await userController.userLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "EMail ou Mot de passe incorrect",
    });

    // Clean up
    await User.deleteOne({ email: "testuser@test.com" });
  });
});

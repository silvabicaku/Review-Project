const sinon = require("sinon");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.js");
const authServices = require("../../services/authServices.js");

describe("Signup Service", function () {
  let hashStub;
  let saveStub;
  beforeEach(function () {
    hashStub = sinon.stub(bcrypt, "hash").resolves("hashedPassword");
    saveStub = sinon.stub(User.prototype, "save").resolves({ _id: "12345" });
  });
  afterEach(function () {
    hashStub.restore();
    saveStub.restore();
  });

  it("should return a message and userId if the user is created", async () => {
    const { expect } = await import("chai");
    const data = {
      email: "test@example.com",
      name: "Test User",
      password: "password123",
      isAdmin: false,
    };
    const response = await authServices.signupService(data);
    expect(response).to.deep.equal({
      message: "User created!",
      userId: "12345",
    });
    console.log("Response from the user:", response);
  });
});

describe("Login Service", function () {
  let findOneStub;
  let compareStub;
  let jwtSignStub;

  beforeEach(function () {
    findOneStub = sinon.stub(User, "findOne").resolves({
      _id: "12345",
      email: "test@example.com",
      password: "hashedPassword",
    });
    compareStub = sinon.stub(bcrypt, "compare").resolves(true);
  });
  afterEach(function () {
    findOneStub.restore();
    compareStub.restore();
  });
  before(function () {
    jwtSignStub = sinon.stub(jwt, "sign").returns("someverylongtokenstring");
  });

  after(function () {
    jwtSignStub.restore();
  });
  it("returns an error when no user is found with provided credentials", async () => {
    const { expect } = await import("chai");
    const email = "nonexistentuser@example.com";
    const password = "password123";
    findOneStub.resolves(null);
    try {
      await authServices.loginService(email, password);
    } catch (error) {
      expect(error.message).to.equal("User not found!");
      expect(error.statusCode).to.equal(401);
    }
    it("returns an error when the validation does not pass", async () => {
      const { expect } = await import("chai");
      const email = "test@example.com";
      const password = "incorrectpassword";
      compareStub.resolves(false);
      try {
        await authServices.loginService(email, password);
      } catch (error) {
        expect(error.message).to.equal("Wrong password!");
        expect(error.statusCode).to.equal(401);
      }
    });
    it("returns a token and userId when successfully logged in "),
      async () => {
        const { expect } = await import("chai");
        const email = "test@example.com";
        const password = "password123";
        const response = await authServices.loginService(email, password);
        expect(response).to.deep.equal({
          token: "someverylongtokenstring",
          userId: "12345",
        });
      };
  });
});

describe("Get User Service", function () {
  let findByIdStub;
  let mockedUser;

  beforeEach(function () {
    mockedUser = {
      _id: "12233",
      name: "Silva",
      email: "silva@eatech.com",
      password: "hashedPassword",
      isAdmin: false,
    };

    findByIdStub = sinon.stub(User, "findById");
  });

  afterEach(function () {
    findByIdStub.restore();
  });

  it("should return a user when user exists", async () => {
    const { expect } = await import("chai");
    findByIdStub.resolves(mockedUser);

    const userId = "123";
    const result = await authServices.getUserService(userId);

    expect(result).to.have.property("message", "User fetched.");
    expect(result).to.have.property("user").that.deep.equals(mockedUser);
  });

  it("should throw an error if user does not exist", async () => {
    const { expect } = await import("chai");
    findByIdStub.resolves(null);

    const userId = "456";
    let error;

    try {
      await authServices.getUserService(userId);
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal("User not found.");
  });
});

describe("Update User Service", function () {
  let findByIdStub;
  let saveStub;

  beforeEach(function () {
    findByIdStub = sinon.stub(User, "findById");
    saveStub = sinon.stub().resolves({
      _id: "12345",
      name: "Updated Name",
      email: "updated@email.com",
      password: "updatedPassword",
      isAdmin: true,
    });
  });

  afterEach(function () {
    findByIdStub.restore();
  });

  it("should update user information when user exists", async () => {
    const { expect } = await import("chai");
    const userId = "123";
    const newData = {
      name: "Updated Name",
      email: "updated@email.com",
      password: "updatedPassword",
      isAdmin: true,
    };

    // Mocking the findById method to return a user
    findByIdStub.resolves({
      _id: userId,
      name: "Old Name",
      email: "old@email.com",
      password: "oldPassword",
      isAdmin: false,
      save: saveStub,
    });
    const result = await authServices.updateUserService(userId, newData);

    expect(result).to.have.property("message", "User updated.");
    expect(result.user).to.deep.equal({
      _id: "12345",
      name: "Updated Name",
      email: "updated@email.com",
      password: "updatedPassword",
      isAdmin: true,
    });
  });

  it("should throw an error if user does not exist", async () => {
    const { expect } = await import("chai");
    const userId = "456";
    const newData = {
      name: "Updated Name",
      email: "updated@email.com",
      password: "updatedPassword",
      isAdmin: true,
    };

    // Mocking the findById method to return null
    findByIdStub.resolves(null);
    let error;
    try {
      await authServices.updateUserService(userId, newData);
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal("User not found.");
  });
});

describe("Delete User Service", function () {
  let findByIdStub;
  let deleteOneStub;

  beforeEach(function () {
    findByIdStub = sinon.stub(User, "findById");
    deleteOneStub = sinon.stub().resolves();
  });

  afterEach(function () {
    findByIdStub.restore();
  });

  it("should delete user when user exists", async () => {
    const { expect } = await import("chai");
    const userId = "123";

    // Mocking the findById method to return a user
    findByIdStub.resolves({
      _id: userId,
      name: "Test User",
      email: "test@example.com",
      password: "hashedPassword",
      isAdmin: false,
      deleteOne: deleteOneStub,
    });

    const result = await authServices.deleteUserService(userId);

    expect(result).to.have.property("message", "User deleted");
    expect(deleteOneStub.calledOnceWithExactly({ _id: userId })).to.be.true;
  });

  it("should throw an error if user does not exist", async () => {
    const { expect } = await import("chai");
    const userId = "456";

    // Mocking the findById method to return null
    findByIdStub.resolves(null);

    let error;

    try {
      await authServices.deleteUserService(userId);
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal("User not found.");
    expect(deleteOneStub.called).to.be.false;
  });
});

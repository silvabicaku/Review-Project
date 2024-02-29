const sinon = require("sinon");
const { validationResult } = require("express-validator");
const authController = require("../../controllers/auth");
const authService = require("../../services/authServices");

describe("Signup Controller", function () {
  let req, res, next;
  let mockedResult;
  let authServiceStub;

  beforeEach(function () {
    req = {
      body: {
        email: "silva@example.com",
        name: "JSilva",
        password: "password123",
        isAdmin: false,
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
    mockedResult = {
      message: "User created!",
      userId: "12345",
    };
    const error = validationResult(req);
    isEmptyStub = sinon.stub(error, "isEmpty");
    arrayStub = sinon.stub(error, "array");

    authServiceStub = sinon.stub(authService, "signupService");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should return 201 status and result data when validation succeeds", async function () {
    const { expect } = await import("chai");
    isEmptyStub.returns(true);

    authServiceStub.resolves(mockedResult);

    await authController.signup(req, res, next);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(mockedResult)).to.be.true;
    expect(
      res.json.calledWith({
        message: "User created!",
        userId: "12345",
      })
    ).to.be.true;
  });

  it("should return 422 status and validation errors when validation fails", async function () {
    const { expect } = await import("chai");

    isEmptyStub.returns(false);
    arrayStub.resolves([{ msg: "Please enter a valid email" }]);
    try {
      await authController.signup(req, res, next);
    } catch (error) {
      expect(error.message).to.equal("Please enter a valid email");
      expect(error.statusCode).to.equal(422);
    }
  });
});

describe("Login Controller", function () {
  let req, res, next;

  beforeEach(function () {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should return 200 status and result data on successful login", async function () {
    const { expect } = await import("chai");

    const expectedResult = { userId: "123", token: "abc123" };
    sinon.stub(authService, "loginService").resolves(expectedResult);

    await authController.login(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith(expectedResult)).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should call next with an error on login failure", async function () {
    const { expect } = await import("chai");
    const error = new Error("Login failed");
    sinon.stub(authService, "loginService").rejects(error);

    await authController.login(req, res, next);

    expect(next.calledWith(error)).to.be.true;
    expect(res.status.notCalled).to.be.true;
    expect(res.json.notCalled).to.be.true;
  });
});

describe("Get User Controller", function () {
  let req, res, next;

  beforeEach(function () {
    req = {
      params: {
        userId: "123",
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should return 200 status and user data on successful user retrieval", async function () {
    const { expect } = await import("chai");
    const expectedUser = {
      userId: "123",
      name: "Silva",
      email: "silva@example.com",
    };
    sinon.stub(authService, "getUserService").resolves(expectedUser);

    await authController.getUser(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith(expectedUser)).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should call next with an error on user retrieval failure", async function () {
    const { expect } = await import("chai");
    const error = new Error("User retrieval failed");
    sinon.stub(authService, "getUserService").rejects(error);

    await authController.getUser(req, res, next);

    expect(next.calledWith(error)).to.be.true;
    expect(res.status.notCalled).to.be.true;
    expect(res.json.notCalled).to.be.true;
  });
});

describe("Update User Controller", function () {
  let req, res, next;
  let mockedResult;
  let authServiceStub;
  beforeEach(function () {
    req = {
      params: {
        userId: "123",
      },
      body: {
        email: "test@example.com",
        name: "Test User",
        password: "newpassword123",
        isAdmin: false,
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
    mockedResult = {
      message: "User updated!",
      userId: "12345",
    };

    const error = validationResult(req);
    isEmptyStub = sinon.stub(error, "isEmpty");
    arrayStub = sinon.stub(error, "array");
    authServiceStub = sinon.stub(authService, "updateUserService");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should return 200 status and updated user data on successful user update", async function () {
    const { expect } = await import("chai");

    isEmptyStub.returns(true);
    authServiceStub.resolves(mockedResult);

    await authController.updateUser(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(mockedResult)).to.be.true;
    expect(
      res.json.calledWith({
        message: "User updated!",
        userId: "12345",
      })
    ).to.be.true;
  });

  it("should return 422 status and validation errors when validation fails", async function () {
    const { expect } = await import("chai");

    isEmptyStub.returns(false);
    arrayStub.resolves([{ msg: "Validation failed." }]);
    try {
      await authController.updateUser(req, res, next);
    } catch (error) {
      expect(error.message).to.equal("Validation failed.");
      expect(error.statusCode).to.equal(422);
    }
  });
});

describe("deleteUser", function () {
  let req, res, next;

  beforeEach(function () {
    req = {
      params: {
        userId: "123",
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should return 200 status and deleted user data on successful user deletion", async function () {
    const { expect } = await import("chai");
    const expectedUser = {
      userId: "123",
      name: "Test User",
      email: "test@example.com",
      isAdmin: false,
    };
    sinon.stub(authService, "deleteUserService").resolves(expectedUser);

    await authController.deleteUser(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith(expectedUser)).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should call next with an error on user deletion failure", async function () {
    const { expect } = await import("chai");
    const error = new Error("User deletion failed");
    sinon.stub(authService, "deleteUserService").rejects(error);

    await authController.deleteUser(req, res, next);

    expect(next.calledWith(error)).to.be.true;
    expect(res.status.notCalled).to.be.true;
    expect(res.json.notCalled).to.be.true;
  });
});

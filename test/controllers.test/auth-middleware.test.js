const jwt = require("jsonwebtoken");
const sinon = require("sinon");
const User = require("../../models/user");
const authMiddleware = require("../../middleware/is-auth");

describe("Auth middleware", function () {
  let jwtStub;
  let findByIdStub;

  beforeEach(function () {
    jwtStub = sinon.stub(jwt, "verify");
    findByIdStub = sinon.stub(User, "findById");
  });

  afterEach(function () {
    jwtStub.restore();
    findByIdStub.restore();
  });

  it("should throw an error if no authorization header is present", async function () {
    const { expect } = await import("chai");
    const req = {
      get: function () {
        return null;
      },
    };
    const next = sinon.stub();

    await authMiddleware(req, {}, next);

    expect(
      next.calledWithMatch({ statusCode: 401, message: "Not authenticated." })
    ).to.be.true;
  });

  it("should throw an error if the authorization header is only one string", async function () {
    const { expect } = await import("chai");
    const req = {
      get: function () {
        return "xyz";
      },
    };
    const next = sinon.stub();

    await authMiddleware(req, {}, next);

    expect(
      next.calledWithMatch({ statusCode: 401, message: "Not authenticated." })
    ).to.be.true;
  });

  it("should throw an error if the token cannot be verified", async function () {
    const { expect } = await import("chai");
    const req = {
      get: function () {
        return "Bearer xyz";
      },
    };
    const next = sinon.stub();
    jwtStub.returns(null);

    await authMiddleware(req, {}, next);

    expect(
      next.calledWithMatch({ statusCode: 401, message: "Not authenticated." })
    ).to.be.true;
  });

  it("should throw an error if the userId is not found in the token", async function () {
    const { expect } = await import("chai");
    const req = {
      get: function () {
        return "Bearer xyz";
      },
    };
    const next = sinon.stub();
    findByIdStub.returns(null);
    jwtStub.returns({ userId: "user123" });

    await authMiddleware(req, {}, next);

    expect(
      next.calledWithMatch({ statusCode: 404, message: "User not found." })
    ).to.be.true;
  });

  it("should set req.userId and req.isAdmin if the token is successfully verified", async function () {
    const { expect } = await import("chai");
    const req = {
      get: function () {
        return "Bearer validToken"; // Provide a valid token for verification
      },
    };
    const next = sinon.stub();
    const user = {
      _id: "userId",
      isAdmin: true, // Assuming the user is an admin
    };
    const decodedToken = {
      userId: "userId",
    };

    jwtStub.returns(decodedToken);

    findByIdStub.resolves(user);

    await authMiddleware(req, {}, next);

    // Expect req.userId and req.isAdmin to be set
    expect(req.userId).to.equal(decodedToken.userId);
    expect(req.isAdmin).to.equal(user.isAdmin);

    expect(next.called).to.be.true;
  });
});

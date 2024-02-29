const sinon = require("sinon");
const authorizationMiddleware = require("../../middleware/is-admin");

describe("Authorization Middleware", function () {
  let req, res, next;

  beforeEach(function () {
    req = {
      isAdmin: false,
      path: "",
      userId: "user123",
      method: "",
      params: { reviewId: "review123" },
      review: null,
    };
    res = {};
    next = sinon.stub();
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should allow authorized requests to proceed", async function () {
    const { expect } = await import("chai");
    req.isAdmin = true;

    authorizationMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.not.be.instanceOf(Error);
  });

  it("should allow PATCH or DELETE requests on user-specific paths", async function () {
    const { expect } = await import("chai");
    req.path = "/user/user123";
    req.method = "PATCH";

    authorizationMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.not.be.instanceOf(Error);
  });

  it("should allow PATCH or DELETE requests on review-specific paths with matching userId", async function () {
    const { expect } = await import("chai");
    req.path = "/reviews/review123";
    req.method = "PATCH";
    req.review = { userId: "user123" };

    authorizationMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.not.be.instanceOf(Error);
  });

  it("should reject unauthorized requests with 403 status code", async function () {
    const { expect } = await import("chai");
    req.path = "/reviews/review123";
    req.method = "PATCH";
    req.review = { userId: "user456" };

    authorizationMiddleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(Error);
    expect(next.firstCall.args[0].statusCode).to.equal(403);
  });
});

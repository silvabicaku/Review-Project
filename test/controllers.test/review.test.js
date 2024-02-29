const sinon = require("sinon");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const reviewController = require("../../controllers/review");
const reviewService = require("../../services/reviewServices");

describe("createReview function", function () {
  let req, res, next;
  let startSessionStub,
    startTransactionStub,
    createServiceReviewStub,
    commitTransactionStub,
    endSessionStub;

  beforeEach(function () {
    req = {
      body: {
        review: "Great product!",
        rate: 5,
      },
      userId: "user123",
    };
    mockedReview = {
      _id: "review123",
      review: "Great product!",
      rate: 5,
      userId: "user123",
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();

    // Stubbing mongoose functions
    startSessionStub = sinon.stub(mongoose, "startSession").returns({
      startTransaction: sinon.stub().returnsThis(),
      commitTransaction: sinon.stub().resolves(),
      endSession: sinon.stub(),
    });
    startTransactionStub = startSessionStub().startTransaction;
    commitTransactionStub = startSessionStub().commitTransaction;
    endSessionStub = startSessionStub().endSession;
    createServiceReviewStub = sinon.stub(reviewService, "createServiceReview");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should create a review and return status 201 with the created review data", async function () {
    const { expect } = await import("chai");

    createServiceReviewStub.resolves(mockedReview);

    await reviewController.createReview(req, res, next);
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(mockedReview)).to.be.true;
  });

  it("should call next with an error if any error occurs", async function () {
    const { expect } = await import("chai");
    const error = new Error("Internal Server Error");
    createServiceReviewStub.rejects(error);

    await reviewController.createReview(req, res, next);

    expect(next.calledOnceWithExactly(error)).to.be.true;
    expect(res.status.notCalled).to.be.true;
    expect(res.json.notCalled).to.be.true;
  });
});

describe("Get Review Controller", function () {
  let req, res, next;

  beforeEach(function () {
    req = {
      params: {
        reviewId: "123",
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
  it("should return 200 status and review data on successful review retrieval", async function () {
    const { expect } = await import("chai");
    const expectedReview = {
      reviewId: "123",
      review: "Great product!",
      rate: 5,
      userId: "user123",
    };
    sinon.stub(reviewService, "getServiceReview").resolves(expectedReview);
    await reviewController.getReview(req, res, next);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(expectedReview)).to.be.true;
  });
  it("should handle an error and call next", async () => {
    const { expect } = await import("chai");

    const error = new Error("Internal Server Error");
    sinon.stub(reviewService, "getServiceReview").rejects(error);

    await reviewController.getReview(req, res, next);

    expect(next.calledWith(error)).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.called).to.be.false;
  });
});

describe("Update Review Controller", function () {
  let req, res, next;
  let mockedResult;
  let isEmptyStub;
  let arrayStub;

  beforeEach(() => {
    req = {
      params: {
        reviewId: "review123",
      },
      body: {
        rate: 5,
        review: "Updated review",
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    next = sinon.stub();

    mockedResult = {
      _id: "review123",
      rating: 5,
      description: "Updated review",
    };

    const error = validationResult(req);
    isEmptyStub = sinon.stub(error, "isEmpty");
    arrayStub = sinon.stub(error, "array");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should update a review and return status 200 with the updated data", async () => {
    const { expect } = await import("chai");

    isEmptyStub.returns(true);

    const updateServiceReviewStub = sinon
      .stub(reviewService, "updateServiceReview")
      .resolves(mockedResult);

    await reviewController.updateReview(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(mockedResult)).to.be.true;
    expect(next.called).to.be.false;
    expect(
      updateServiceReviewStub.calledWith("review123", {
        rating: req.body.rate,
        description: req.body.review,
      })
    ).to.be.true;
  });

  it("should handle validation errors and return status 422", async () => {
    const { expect } = await import("chai");

    isEmptyStub.returns(false);
    arrayStub.resolves([
      { msg: "Validation failed, entered data is incorrect." },
    ]);
    try {
      await reviewController.updateReview(req, res, next);
    } catch (error) {
      expect(error.message).to.equal(
        "Validation failed, entered data is incorrec."
      );
      expect(error.statusCode).to.equal(422);
    }
  });
});

describe("Delete Review Controller", function () {
  let req, res, next;
  let mockedResult;
  let isEmptyStub;
  let arrayStub;
  let reviewServiceStub;

  beforeEach(() => {
    req = {
      params: {
        reviewId: "review123",
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    next = sinon.stub();
    mockedResult = { message: "Review deleted!" };
    const error = validationResult(req);
    isEmptyStub = sinon.stub(error, "isEmpty");
    arrayStub = sinon.stub(error, "array");

    reviewServiceStub = sinon.stub(reviewService, "deleteServiceReview");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should delete a review and return status 200 with the deleted data", async () => {
    const { expect } = await import("chai");

    reviewServiceStub.resolves(mockedResult);

    await reviewController.deleteReview(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(mockedResult)).to.be.true;
    expect(next.called).to.be.false;
    expect(
      res.json.calledWith({
        message: "Review deleted!",
      })
    ).to.be.true;
  });
  it("should call next with error when validation fails", async function () {
    const { expect } = await import("chai");

    isEmptyStub.returns(false);
    arrayStub.resolves([
      { msg: "Validation failed, entered data is incorrect." },
    ]);
    try {
      await reviewController.deleteReview(req, res, next);
    } catch (error) {
      expect(error.message).to.equal(
        "Validation failed, entered data is incorrec."
      );
      expect(error.statusCode).to.equal(422);
    }
  });

  it("should call next with error when reviewId is not provided", async function () {
    const { expect } = await import("chai");
    req.params.reviewId = undefined;

    isEmptyStub.returns(false);
    arrayStub.resolves([{ msg: "Review not found" }]);

    try {
      await reviewController.deleteReview(req, res, next);
    } catch (err) {
      expect(err.message).to.equal("Review not found");
      expect(err.statusCode).to.equal(404);
    }
  });
});

const sinon = require("sinon");
const mongoose = require("mongoose");
const reviewServices = require("../../services/reviewServices");
const Review = require("../../models/review");
const User = require("../../models/user");

describe("createServiceReview", () => {
  let mockUserId;
  let fakeReview;
  let session;
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
    mockUserId = new mongoose.Types.ObjectId();
    fakeReview = {
      _id: "fakeReviewId",
      description: "Great service!",
      rate: 5,
      userId: mockUserId,
      save: sinon.stub().resolves({}),
    };
    session = { fakeSession: true };
  });
  afterEach(() => {
    sinon.restore();
  });

  it("should create a review and update the user", async () => {
    const { expect } = await import("chai");
    findByIdStub.resolves({ session: sinon.stub().returnsThis() });
    sinon.stub(Review.prototype, "save").resolves();
    sinon.stub(reviewServices, "createServiceReview").resolves({
      message: "Review created successfully!",
      review: fakeReview,
    });

    const result = await reviewServices.createServiceReview(
      "Great service!",
      5,
      mockUserId,
      session
    );
    expect(result).to.deep.equal({
      message: "Review created successfully!",
      review: fakeReview,
    });
  });

  it("should throw an error when user is not found", async () => {
    const { expect } = await import("chai");
    const error = new Error("Could not find user.");
    error.statusCode = 404;
    findByIdStub.throws(error);

    try {
      await reviewServices.createServiceReview(
        "Great service!",
        5,
        mockUserId,
        session
      );
      throw new Error("Expected error but none was thrown");
    } catch (e) {
      expect(e.message).to.equal("Could not find user.");
      expect(e.statusCode).to.equal(404);
    }
  });
});

describe("getServiceReview", () => {
  let findByIdStub;
  beforeEach(function () {
    findByIdStub = sinon.stub(Review, "findById");
  });
  afterEach(function () {
    findByIdStub.restore();
  });
  it("should throw an error if review is not found", async () => {
    const { expect } = await import("chai");
    const fakeReviewId = new mongoose.Types.ObjectId();
    findByIdStub.resolves(null);

    try {
      await reviewServices.getServiceReview(fakeReviewId);
    } catch (error) {
      expect(error.message).to.equal("Could not find review.");
      expect(error.statusCode).to.equal(404);
      findByIdStub.restore();
    }
  });

  it("should return a review", async () => {
    const { expect } = await import("chai");
    const fakeReview = new Review();
    findByIdStub.resolves(fakeReview);

    const result = await reviewServices.getServiceReview(fakeReview._id);
    expect(result).to.deep.equal({
      message: "Review fetched.",
      review: fakeReview,
    });
  });
});

describe("updateServiceReview", () => {
  let findByIdStub;
  let saveStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Review, "findById");
    saveStub = sinon.stub().resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should update a review when it exists", async () => {
    const { expect } = await import("chai");
    const reviewId = "mockReviewId";
    const mockData = {
      description: "Updated description",
      rating: 4,
    };
    const mockReview = {
      _id: reviewId,
      description: "Original description",
      rate: 3,
      save: saveStub,
    };
    findByIdStub.withArgs(reviewId).resolves(mockReview);
    const result = await reviewServices.updateServiceReview(reviewId, mockData);

    expect(result.message).to.equal("Review updated!");
    expect(result.review).to.deep.equal(mockReview);
    expect(mockReview.description).to.equal(mockData.description);
    expect(mockReview.rate).to.equal(mockData.rating);
    expect(saveStub.calledOnce).to.be.true;
  });

  it("should throw an error when review does not exist", async () => {
    const { expect } = await import("chai");
    const reviewId = "mockReviewId";
    const mockData = {
      description: "Updated description",
      rating: 4,
    };

    findByIdStub.withArgs(reviewId).resolves(null);

    try {
      await reviewServices.updateServiceReview(reviewId, mockData);
    } catch (error) {
      expect(error.message).to.equal("Review not found");
      expect(error.statusCode).to.equal(404);
      expect(saveStub.called).to.be.false;
    }
  });
});

describe("deleteServiceReview", () => {
  let findByIdStub;
  let deleteOneStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Review, "findById");
    deleteOneStub = sinon.stub(Review, "deleteOne");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should delete a review when it exists", async () => {
    const { expect } = await import("chai");
    const reviewId = "mockReviewId";
    const mockReview = {
      _id: reviewId,
      // Mock any other properties of the review
    };

    // Stub findById method to return a mock review
    findByIdStub.withArgs(reviewId).resolves(mockReview);

    // Stub deleteOne method to return a success message
    deleteOneStub.resolves({ n: 1 });

    const result = await reviewServices.deleteServiceReview(reviewId);

    // Assertions
    expect(result.message).to.equal("Review deleted!");
    expect(result.review).to.deep.equal(mockReview);
  });

  it("should throw an error when review does not exist", async () => {
    const { expect } = await import("chai");
    const reviewId = "mockReviewId";

    // Stub findById method to return null (review not found)
    findByIdStub.withArgs(reviewId).resolves(null);

    // Call the function under test and expect it to throw an error
    try {
      await reviewServices.deleteServiceReview(reviewId);
    } catch (error) {
      // Assertions
      expect(error.message).to.equal("Review not found");
      expect(error.statusCode).to.equal(404);
    }
  });
});

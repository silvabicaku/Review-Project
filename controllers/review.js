const reviewService = require("../services/reviewServices");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
exports.createReview = async (req, res, next) => {
  const { review, rate } = req.body;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const createdReview = await reviewService.createServiceReview(
      review,
      rate,
      req.userId,
      session
    );
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(createdReview);
  } catch (error) {
    next(error);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const result = await reviewService.getServiceReview(reviewId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      console.log("Validation errors:", errors.array());
      error.statusCode = 422;
      throw error;
    }
    if (!reviewId) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      throw error;
    }
    const data = {
      rating: req.body.rate,
      description: req.body.review,
    };
    const result = await reviewService.updateServiceReview(reviewId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }
    if (!reviewId) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      throw error;
    }
    const result = await reviewService.deleteServiceReview(reviewId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

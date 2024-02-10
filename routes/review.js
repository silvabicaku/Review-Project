const express = require("express");
const { body, validationResult } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");
const reviewController = require("../controllers/review");

const router = express.Router();
const validateRating = (value) => {
  if (value < 1 || value > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  return true;
};

const reviewValidationRules = [
  body("review")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage(
      "Review must be at least 5 characters and max 500 characters."
    ),
  body("rate")
    .trim()
    .custom(validateRating)
    .withMessage("Rating must be between 1 and 5"),
];
router.put(
  "/reviews",
  isAuth,
  reviewValidationRules,
  reviewController.createReview
);
router.get("/reviews/:reviewId", isAuth, reviewController.getReview);
router.patch(
  "/reviews/:reviewId",
  isAuth,
  isAdmin,
  reviewValidationRules,
  reviewController.updateReview
);

router.delete(
  "/reviews/:reviewId",
  isAuth,
  isAdmin,
  reviewController.deleteReview
);

module.exports = router;

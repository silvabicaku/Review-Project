const Review = require("../models/review");
const User = require("../models/user");

exports.createServiceReview = async (reviewText, rating, userId, session) => {
  //const userId = new mongoose.Types.ObjectId();
  const user = await User.findById(userId).session(session);
  if (!user) {
    const error = new Error("Could not find user.");
    error.statusCode = 404;
    throw error;
  }
  const review = new Review({
    description: reviewText,
    rate: rating,
    userId: userId,
  });
  await review.save({ session });

  user.reviews.push(review);
  user.nrOfReviews += 1;
  await user.save({ session });
  return {
    message: "Review created successfully!",
    review: review,
    user: {
      _id: user._id,
      name: user.name,
      isAdmin: user.isAdmin,
      nrOfReviews: user.nrOfReviews,
    },
  };
};

exports.getServiceReview = async (reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Could not find review.");
    error.statusCode = 404;
    throw error;
  }
  return {
    message: "Review fetched.",
    review: review,
  };
};

exports.updateServiceReview = async (reviewId, data) => {
  const updatedReview = await Review.findById(reviewId);
  if (!updatedReview) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }
  updatedReview.description = data.description;
  updatedReview.rate = data.rating;
  await updatedReview.save();
  return {
    message: "Review updated!",
    review: updatedReview,
  };
};

exports.deleteServiceReview = async (reviewId) => {
  const deletedReview = await Review.findById(reviewId);
  if (!deletedReview) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }
  //const objectId = new ObjectId(reviewId);
  await Review.deleteOne({ _id: reviewId });
  return {
    message: "Review deleted!",
    review: deletedReview,
  };
};

module.exports = (req, res, next) => {
  const {
    isAdmin,
    path,
    userId,
    method,
    params: { reviewId },
    review,
  } = req;
  if (
    isAdmin ||
    (path.startsWith(`/user/${userId}`) &&
      (method === "PATCH" || method === "DELETE")) ||
    (path.startsWith(`/reviews/${reviewId}`) &&
      (method === "PATCH" || method === "DELETE") &&
      review &&
      review.userId.toString() === userId)
  ) {
    return next(); // Allow authorized requests to proceed
  }
  const error = new Error("Not authorized.");
  error.statusCode = 403;
  return next(error);
};

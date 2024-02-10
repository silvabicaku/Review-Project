const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],

  authController.signup
);
router.post("/login", authController.login);
router.get("/user/:userId", isAuth, authController.getUser);
router.patch(
  "/user/:userId",
  isAuth,
  isAdmin,
  body("name").trim().not().isEmpty(),
  body("password").trim().isLength({ min: 5 }),
  body("email").isEmail().withMessage("Please enter a valid email"),
  authController.updateUser
);
router.delete("/user/:userId", isAuth, isAdmin, authController.deleteUser);

module.exports = router;

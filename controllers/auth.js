const authService = require("../services/authServices");
const { validationResult } = require("express-validator");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const data = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      isAdmin: req.body.isAdmin,
    };
    const result = await authService.signupService(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginService(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const result = await authService.getUserService(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const data = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      isAdmin: req.body.isAdmin,
    };
    const result = await authService.updateUserService(userId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const result = await authService.deleteUserService(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signupService = async (data) => {
  const { email, name, password, isAdmin } = data;
  const hashedPw = await bcrypt.hash(password, 12);
  const user = new User({
    email: email,
    password: hashedPw,
    name: name,
    isAdmin: isAdmin || false,
  });
  const result = await user.save();
  return { message: "User created!", userId: result._id };
};

exports.loginService = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = new Error("User not found!");
    error.statusCode = 401;
    throw error;
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    const error = new Error("Wrong password!");
    error.statusCode = 401;
    throw error;
  }
  const token = jwt.sign(
    {
      name: user.name,
      email: user.email,
      userId: user._id.toString(),
      isAdmin: user.isAdmin,
    },
    "mysecretkey",
    { expiresIn: "1h", algorithm: "HS256" }
  );
  return { token: token, userId: user._id.toString() };
};
exports.getUserService = async (userId) => {
  const user = await User.findById(userId);
  return {
    message: "User fetched.",
    user: user,
  };
};

exports.updateUserService = async (userId, data) => {
  const user = await User.findById(userId);
  user.name = data.name;
  user.email = data.email;
  user.password = data.password;
  user.isAdmin = data.isAdmin;
  const result = await user.save();
  return {
    message: "User updated.",
    user: result,
  };
};

exports.deleteUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  await user.deleteOne({ _id: userId });
  return { message: "User deleted" };
};

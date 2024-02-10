const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const reviewRoutes = require("./routes/review");

const app = express();

app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoutes);
app.use("/review", reviewRoutes);

app.use((error, req, res, next) => {
  console.log("Error in last error middleware", error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
mongoose
  .connect(
    "mongodb+srv://silvana:silvanacluster@cluster0.h4mpgpo.mongodb.net/systems?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5050);
  })
  .catch((err) => console.log(err));

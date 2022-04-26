require("dotenv").config();
require("./config/database").connect();

const bp = require('body-parser')
const express = require("express")
var cors = require('cors')
const app = express();
const usersRoutes = require("./routes/users")

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors())

app.use("/users", usersRoutes);

//Ping route to check status of server
app.get("/ping", (req, res) => {
    return res.send({
      error: false,
      message: "Server is ok",
    });
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app
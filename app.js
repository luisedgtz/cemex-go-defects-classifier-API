require("dotenv").config();
require("./config/database").connect();
const express = require("express")

const app = express();

//Ping route to check status of server
app.get("/ping", (req, res) => {
    return res.send({
      error: false,
      message: "Server is healthy",
    });
});
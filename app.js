// dependencies
const express = require("express");
const mysql = require("mysql");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "./public/uploads/" });
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

// express server config
const app = express();
const port = 3000;

// setting cookie
app.use(cookieParser("anakkeren"));

// static files
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("/public/home/landing.html", { root: "." });
});

// start at port
app.listen(port, () => {
  console.log(`running on port ${port}`);
});

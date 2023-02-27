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

// landing page
app.get("/", (req, res) => {
  res.sendFile("/public/home/landing.html", { root: "." });
});

// register page
app.get("/register", (req, res) => {
  res.sendFile("/public/home/register.html", { root: "." });
});

// register api
app.post("/register", multer().none(), (req, res) => {
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const username = req.body.username;
  const password = req.body.password;
  const uuid = uuidv4();
  const hash = bcrypt.hashSync(password, 10);

  let q_insert = `insert into user (uuid, username, password, first_name, last_name) `;
  q_insert += `values ('${uuid}', '${username}', '${hash}', '${first_name}', '${last_name}')`;

  let q_check = `select * from user where hapus is null and username='${username}'`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q_check, (err, rows, fields) => {
    if (err) throw err;

    // user ada
    if (rows != "") {
      res.send(`/register/?pesan=${encodeURI("user exist!")}`);
      //    res.redirect("/register/?pesan=" + encodeURI("user exist!"));
    }
    // kalo user belum ada
    else {
      connection.query(q_insert, (errx, rowsx, fieldsx) => {
        if (errx) throw errx;

        res.send(`/register/?pesan=ok`);
        // res.redirect("/register/?pesan=ok");
        connection.end();
      });
    }
  });
});

// start at port
app.listen(port, () => {
  console.log(`running on port ${port}`);
});

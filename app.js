// dependencies
const express = require("express");
const mysql = require("mysql");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "./public" });
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

// express server config
const app = express();
const port = 3000;

// gunakan ejs
app.set("view engine", "ejs");

// setting cookie
app.use(cookieParser("anakkeren"));

// static files
app.use(express.static("public"));

// landing page
app.get("/", (req, res) => {
  res.render("home/landing");
});

// register page
app.get("/register", (req, res) => {
  // kalau ada pesan
  if (req.signedCookies["pesan"]) {
    const pesan = req.signedCookies["pesan"];
    res.clearCookie("pesan", { signed: true, expires: new Date(0) });
    res.render("home/register", {
      pesan: pesan,
    });
  }

  // kalau tidak ada pesan
  else {
    res.render("home/register", {
      pesan: "",
    });
  }
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
      res.cookie("pesan", "user exist!", { signed: true });
      res.redirect("/register");
      connection.end();
    }
    // kalo user belum ada
    else {
      connection.query(q_insert, (errx, rowsx, fieldsx) => {
        if (errx) throw errx;

        res.cookie("pesan", "ok", { signed: true });
        res.redirect("/register");
        connection.end();
      });
    }
  });
});

// login page
app.get("/login", (req, res) => {
  // kalau ada pesan
  if (req.signedCookies["pesan"]) {
    const pesan = req.signedCookies["pesan"];
    res.clearCookie("pesan", { signed: true, expires: new Date(0) });
    res.render("home/login", {
      pesan: pesan,
    });
  }

  // kalau tidak ada pesan
  else {
    res.render("home/login", {
      pesan: "",
    });
  }
});

// login api
app.post("/login", multer().none(), (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

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
      // res.send(`/login/?pesan=${encodeURI("user exist!")}`);

      // check pass
      const result = bcrypt.compareSync(password, rows[0].password);
      if (result) {
        res.cookie("uuid", rows[0].uuid, { signed: true });
        res.redirect("/feed");
        connection.end();
      } else {
        res.cookie("pesan", "wrong password!", { signed: true });
        res.redirect("/login");
        connection.end();
      }
    }
    // kalo user belum ada
    else {
      res.cookie("pesan", "user not exist!", { signed: true });
      res.redirect("/login");
      connection.end();
    }
  });
});

// feed page
app.get("/feed", (req, res) => {
  if (req.signedCookies["uuid"]) {
    const data = [
      {
        user_uuid: "uuid1",
        user_username: "user1",
        user_img: "1.jpg",
        post_uuid: "post_uuid1",
        post_img: "9.jpg",
        post_caption:
          "Sudah siap menyambut bulan Maret dengan event-event keren di Surabaya?",
        post_like: "37",
        post_comment: "2",
        post_ts: "2 DAYS AGO",
      },
      {
        user_uuid: "uuid2",
        user_username: "user2",
        user_img: "2.jpg",
        post_uuid: "post_uuid1",
        post_img: "3.jpg",
        post_caption: "post caption 2",
        post_like: "1",
        post_comment: "0",
        post_ts: "20 HOURS AGO",
      },
    ];
    res.render("feed/feed", {
      data,
    });
  } else {
    res.redirect("/login");
  }
});

// start at port
app.listen(port, () => {
  console.log(`running on port ${port}`);
});

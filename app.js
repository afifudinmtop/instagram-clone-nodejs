// dependencies
const express = require("express");
const mysql = require("mysql");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "./public/uploads" });
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
  // kalo udah login
  if (req.signedCookies["uuid"]) {
    res.redirect("/feed");
  }
  // kalo belum login
  else {
    res.render("home/landing");
  }
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
    user: "admininstagram",
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
    user: "admininstagram",
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
  // kalo uda login
  if (req.signedCookies["uuid"]) {
    let q = `SELECT post.uuid, post.user, post.image, post.caption, post.ts,`;
    q += ` user.username, user.image as user_image, `;

    // kalao ada return 'lovex.png', else return 'love.png'
    q += ` IF(likes.post IS NULL, 'love.png', 'lovex.png') AS likex`;

    q += ` FROM post INNER JOIN user ON post.user=user.uuid`;

    // likes
    q += ` LEFT JOIN likes ON post.uuid = likes.post AND likes.user = '${req.signedCookies["uuid"]}'`;

    q += ` WHERE post.hapus is null order by post.id desc`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;
      let list_post = [];
      rows.forEach((x) => {
        const ts = timeDifference(x.ts);
        let x2 = {
          uuid: x.uuid,
          user: x.user,
          image: x.image,
          caption: x.caption,
          ts,
          username: x.username,
          user_image: x.user_image,
          likex: x.likex,
        };
        list_post.push(x2);
      });

      let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
      connection.query(q_profil, (err_profil, rows_profil, fields_profil) => {
        if (err_profil) throw err_profil;

        const profil = rows_profil;
        res.render("feed/feed", {
          list_post,
          profil,
        });
      });
    });
  }
  // kalo belum login
  else {
    res.redirect("/login");
  }
});

// add page
app.get("/add", (req, res) => {
  // redirect kalo gk ada image
  if (!req.signedCookies["image"]) {
    res.redirect("/feed");
  }

  // set image then clear cookie
  const image = req.signedCookies["image"];
  res.clearCookie("image", { signed: true, expires: new Date(0) });

  // kalau sudah login
  if (req.signedCookies["uuid"]) {
    res.render("feed/add", {
      image,
    });
  }
  // kalau belum login
  else {
    res.redirect("/login");
  }
});

// add api
app.post("/add", multer().none(), (req, res) => {
  const caption = req.body.caption;
  const image = req.body.image;
  const uuid_user = req.signedCookies["uuid"];
  const uuid = uuidv4();

  let q = `insert into post (uuid, user, image, caption) `;
  q += `values ('${uuid}', '${uuid_user}', '${image}', '${caption}')`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;
    res.redirect("/profil");
    connection.end();
  });
});

// profil page
app.get("/profil", (req, res) => {
  // kalau sudah login
  if (req.signedCookies["uuid"]) {
    const uuid = req.signedCookies["uuid"];
    let q = `select * from user where hapus is null and uuid='${uuid}'`;
    let q_list = `select * from post where hapus is null and user='${uuid}' order by id desc`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;

      // cari data user
      const username = rows[0].username;
      const first_name = rows[0].first_name;
      const last_name = rows[0].last_name;
      const image = rows[0].image;
      const bio = rows[0].bio;

      // cari data post user
      connection.query(q_list, (err2, rows2, fields2) => {
        const list_post = rows2;

        res.render("profil/profil", {
          username,
          first_name,
          last_name,
          image,
          posts: "40",
          followers: "300",
          following: "917",
          bio,
          list_post,
        });
      });
    });
  }
  // kalau belum login
  else {
    res.redirect("/login");
  }
});

// edit page
app.get("/edit", (req, res) => {
  // kalau sudah login
  if (req.signedCookies["uuid"]) {
    let q = `select * from post where uuid = '${req.query.uuid}'`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;

      res.render("profil/edit", {
        rows,
      });
    });
  }

  // kalau belum login
  else {
    res.redirect("/login");
  }
});

// edit api
app.post("/edit", multer().none(), (req, res) => {
  const caption = req.body.caption;
  const uuid = req.body.uuid;

  let q = `update post set caption='${caption}' where uuid='${uuid}'`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;
    res.redirect(`/post_detail/?uuid=${uuid}`);
    connection.end();
  });
});

// delete post api
app.get("/delete", (req, res) => {
  const uuid = req.query.uuid;

  let q = `update post set hapus='hapus' where uuid='${uuid}'`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;
    res.redirect(`/profil/`);
    connection.end();
  });
});

// setting page
app.get("/setting", (req, res) => {
  // kalau sudah login
  if (req.signedCookies["uuid"]) {
    const uuid = req.signedCookies["uuid"];
    let q = `select * from user where hapus is null and uuid='${uuid}'`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;

      res.render("profil/setting", {
        username: rows[0].username,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        image: rows[0].image,
        bio: rows[0].bio,
      });
    });
  }
  // kalau belum login
  else {
    res.redirect("/login");
  }
});

// save_setting api
app.post("/save_setting", upload.single("file"), (req, res) => {
  const uuid = uuidv4();
  const uuid_user = req.signedCookies["uuid"];
  const bio = req.body.bio;
  let q;

  // No file was uploaded
  if (!req.file) {
    q = `update user set bio='${bio}' where uuid='${uuid_user}'`;
  }
  // file exist
  else {
    const file_extension = req.file.originalname.split(".")[1];
    const filename = uuid + "." + file_extension;

    // di rename
    fs.renameSync(
      `./public/uploads/${req.file.filename}`,
      `./public/uploads/${filename}`
    );

    q = `update user set image='${filename}', bio='${bio}' `;
    q += `where uuid='${uuid_user}'`;
  }

  // set connection database
  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;

    res.redirect("/profil");
    connection.end();
  });
});

// logout page
app.get("/logout", (req, res) => {
  res.clearCookie("uuid", { signed: true, expires: new Date(0) });
  res.redirect("/");
});

// add_middleware api
app.post("/add_middleware", upload.single("file"), (req, res) => {
  const uuid = uuidv4();
  const file_extension = req.file.originalname.split(".")[1];
  const filename = uuid + "." + file_extension;

  // di rename
  fs.renameSync(
    `./public/uploads/${req.file.filename}`,
    `./public/uploads/${filename}`
  );

  res.cookie("image", filename, { signed: true });
  res.redirect("/add");
});

// post_detail page
app.get("/post_detail", (req, res) => {
  // kalo uda login
  if (req.signedCookies["uuid"]) {
    let q = `select post.uuid, post.user, post.image, post.caption, post.ts,`;
    q += ` user.username, user.image as user_image,`;

    // kalao ada return 'lovex.png', else return 'love.png'
    q += ` IF(likes.post IS NULL, 'love.png', 'lovex.png') AS likex`;

    q += ` FROM post`;
    q += ` INNER JOIN user ON post.user = user.uuid`;
    q += ` LEFT JOIN likes ON post.uuid = likes.post AND likes.user = '${req.signedCookies["uuid"]}'`;
    q += ` WHERE post.uuid = '${req.query.uuid}'`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;

      let data = [];
      rows.forEach((x) => {
        const ts = timeDifference(x.ts);
        let x2 = {
          uuid: x.uuid,
          user: x.user,
          image: x.image,
          caption: x.caption,
          ts,
          username: x.username,
          user_image: x.user_image,
          likex: x.likex,
        };
        data.push(x2);
      });

      let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
      connection.query(q_profil, (err_profil, rows_profil, fields_profil) => {
        if (err_profil) throw err_profil;

        const profil = rows_profil;
        res.render("profil/post", {
          data,
          profil,
        });
      });
    });
  }
  // kalo belum login
  else {
    res.redirect("/login");
  }
});

// likes middleware
app.post("/likes", multer().none(), (req, res) => {
  const uuid_post = req.body.uuid_post;
  const uuid_user = req.signedCookies["uuid"];
  const uuid = uuidv4();

  let q = `insert into likes (uuid, user, post) `;
  q += `values ('${uuid}', '${uuid_user}', '${uuid_post}')`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;

    res.send("ok");
    connection.end();
  });
});

// dislike middleware
app.post("/dislike", multer().none(), (req, res) => {
  const uuid_post = req.body.uuid_post;
  const uuid_user = req.signedCookies["uuid"];

  let q = `delete from likes where user='${uuid_user}' and post='${uuid_post}'`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;

    res.send("ok");
    connection.end();
  });
});

// start at port
app.listen(port, () => {
  console.log(`running on port ${port}`);
});

// to give output like 1 hour ago, 2 days ago, etc
function timeDifference(timestamp) {
  const now = new Date();
  const diff = now - new Date(timestamp);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) {
    return weeks + " week" + (weeks == 1 ? "" : "s") + " ago";
  } else if (days > 0) {
    return days + " day" + (days == 1 ? "" : "s") + " ago";
  } else if (hours > 0) {
    return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
  } else if (minutes > 0) {
    return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
  } else {
    return seconds + " second" + (seconds == 1 ? "" : "s") + " ago";
  }
}

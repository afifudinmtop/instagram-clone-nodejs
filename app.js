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
    let q = `
    SELECT 
    post.uuid, 
    post.user, 
    post.image, 
    post.caption, 
    post.ts, 
    user.username, 
    user.image as user_image, 
    IF(likes.post IS NULL, 'love.png', 'lovex.png') AS likex,
    IF(saved.post IS NULL, 'saved.png', 'unsaved.png') AS saved_status,  
    COALESCE(num_likes.num_likes, 0) AS num_likes,
    COALESCE(num_comments.num_comments, 0) AS num_comments
FROM 
    post 
    INNER JOIN user ON post.user=user.uuid
    LEFT JOIN likes ON post.uuid = likes.post AND likes.user = '${req.signedCookies["uuid"]}'
    LEFT JOIN saved ON post.uuid = saved.post AND saved.user = '${req.signedCookies["uuid"]}'
    INNER JOIN following ON following.following = post.user AND following.user = '${req.signedCookies["uuid"]}'
    LEFT JOIN (
        SELECT 
            post, 
            COUNT(*) AS num_likes 
        FROM 
            likes 
        GROUP BY 
            post
    ) num_likes ON post.uuid = num_likes.post
    LEFT JOIN (
        SELECT 
            post, 
            COUNT(*) AS num_comments 
        FROM 
            comment 
        GROUP BY 
            post
    ) num_comments ON post.uuid = num_comments.post
WHERE 
    post.hapus is null 
ORDER BY 
    post.id desc
    `;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
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
          num_likes: x.num_likes,
          num_comments: x.num_comments,
          saved_status: x.saved_status,
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
    let q_count_post = `select COUNT(*) as jumlah_post from post where hapus is null and user='${uuid}'`;
    let q_count_following = `select COUNT(*) as jumlah_following from following where user='${uuid}'`;
    let q_count_followers = `select COUNT(*) as jumlah_followers from following where following='${uuid}'`;

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
      const uuid_user = rows[0].uuid;
      const username = rows[0].username;
      const first_name = rows[0].first_name;
      const last_name = rows[0].last_name;
      const image = rows[0].image;
      const bio = rows[0].bio;

      // cari data post user
      connection.query(q_list, (err2, rows2, fields2) => {
        const list_post = rows2;

        // jumlah_post
        connection.query(q_count_post, (err3, rows3, fields3) => {
          const jumlah_post = rows3[0].jumlah_post;

          // jumlah_following
          connection.query(q_count_following, (err4, rows4, fields4) => {
            const jumlah_following = rows4[0].jumlah_following;

            // jumlah_followers
            connection.query(q_count_followers, (err5, rows5, fields5) => {
              const jumlah_followers = rows5[0].jumlah_followers;

              res.render("profil/profil", {
                uuid_user,
                username,
                first_name,
                last_name,
                image,
                bio,
                list_post,
                jumlah_post,
                jumlah_following,
                jumlah_followers,
              });
            });
          });
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
    const q = `
    SELECT post.uuid, post.user, post.image, post.caption, post.ts,
      user.username, user.image AS user_image,
      IF(likes.post IS NULL, 'love.png', 'lovex.png') AS likex,
      COUNT(DISTINCT likes.user) AS like_count,
      COUNT(DISTINCT comment.uuid) AS comment_count,
      IF(saved.post IS NULL, 'saved.png', 'unsaved.png') AS saved_status
    FROM post
    INNER JOIN user ON post.user = user.uuid
    LEFT JOIN likes ON post.uuid = likes.post
    LEFT JOIN comment ON post.uuid = comment.post
    LEFT JOIN saved ON post.uuid = saved.post
    WHERE post.uuid = '${req.query.uuid}'
    GROUP BY post.uuid

    `;

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
          like_count: x.like_count,
          comment_count: x.comment_count,
          saved_status: x.saved_status,
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

        // res.send({ data, profil });
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

// post_like page
app.get("/post_like", (req, res) => {
  // kalo uda login
  if (req.signedCookies["uuid"]) {
    let q = `select likes.post, likes.user,`;
    q += ` user.username, user.image, user.first_name, user.last_name`;

    q += ` FROM likes`;
    q += ` INNER JOIN user ON likes.user = user.uuid`;
    q += ` WHERE likes.post = '${req.query.uuid}'`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;

      const list_like = rows;

      let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
      connection.query(q_profil, (err_profil, rows_profil, fields_profil) => {
        if (err_profil) throw err_profil;

        const profil = rows_profil;
        res.render("feed/post_like", {
          list_like,
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

// profil page
app.get("/user", (req, res) => {
  // kalau sudah login
  if (req.signedCookies["uuid"]) {
    const uuid = req.query.uuid;
    if (req.signedCookies["uuid"] == uuid) {
      res.redirect("/profil");
    }
    // kalau bukan profil sendiri
    else {
      let q = `select * from user where hapus is null and uuid='${uuid}'`;
      let q_list = `select * from post where hapus is null and user='${uuid}' order by id desc`;
      let q_count_post = `select COUNT(*) as jumlah_post from post where hapus is null and user='${uuid}'`;
      let q_count_following = `select COUNT(*) as jumlah_following from following where user='${uuid}'`;
      let q_count_followers = `select COUNT(*) as jumlah_followers from following where following='${uuid}'`;

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
        const uuid_user = rows[0].uuid;

        // cari data post user
        connection.query(q_list, (err2, rows2, fields2) => {
          const list_post = rows2;

          let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
          connection.query(
            q_profil,
            (err_profil, rows_profil, fields_profil) => {
              if (err_profil) throw err_profil;

              const profil = rows_profil;

              // cari data follow
              let q_follow = `select COUNT(*) as jumlah from following where user='${req.signedCookies["uuid"]}' and following='${uuid_user}'`;
              connection.query(
                q_follow,
                (err_follow, rows_follow, fields_follow) => {
                  if (err_follow) throw err_follow;
                  const follow = rows_follow;

                  // jumlah_post
                  connection.query(q_count_post, (err3, rows3, fields3) => {
                    const jumlah_post = rows3[0].jumlah_post;

                    // jumlah_following
                    connection.query(
                      q_count_following,
                      (err4, rows4, fields4) => {
                        const jumlah_following = rows4[0].jumlah_following;

                        // jumlah_followers
                        connection.query(
                          q_count_followers,
                          (err5, rows5, fields5) => {
                            const jumlah_followers = rows5[0].jumlah_followers;

                            res.render("user/user", {
                              uuid_user,
                              username,
                              first_name,
                              last_name,
                              image,
                              jumlah_post,
                              jumlah_followers,
                              jumlah_following,
                              bio,
                              list_post,
                              profil,
                              follow,
                            });
                          }
                        );
                      }
                    );
                  });
                }
              );
            }
          );
        });
      });
    }
  }
  // kalau belum login
  else {
    res.redirect("/login");
  }
});

// post_comment page
app.get("/post_comment", (req, res) => {
  const uuid_post = req.query.uuid;
  // kalo uda login
  if (req.signedCookies["uuid"]) {
    let q = `select comment.uuid, comment.user, comment.post, comment.comment, comment.ts,`;
    q += ` user.username, user.image`;

    q += ` FROM comment`;
    q += ` INNER JOIN user ON comment.user = user.uuid`;
    q += ` WHERE comment.post='${uuid_post}' and comment.hapus is null`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;

      // const list_comment = rows;

      let list_comment = [];
      rows.forEach((x) => {
        const ts = timeDifference(x.ts);
        let x2 = {
          uuid: x.uuid,
          user: x.user,
          post: x.post,
          comment: x.comment,
          ts,
          username: x.username,
          image: x.image,
        };
        list_comment.push(x2);
      });

      let q_post = `select post.uuid, post.user, post.image, post.caption, post.ts,`;
      q_post += ` user.username, user.image as user_image`;
      q_post += ` FROM post`;
      q_post += ` INNER JOIN user ON post.user = user.uuid`;
      q_post += ` WHERE post.uuid = '${uuid_post}'`;

      connection.query(q_post, (err_post, rows_post, fields_post) => {
        if (err_post) throw err_post;

        let post = [];
        rows_post.forEach((x) => {
          const ts = timeDifference(x.ts);
          let x2 = {
            uuid: x.uuid,
            user: x.user,
            image: x.image,
            caption: x.caption,
            ts,
            username: x.username,
            user_image: x.user_image,
          };
          post.push(x2);
        });

        let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
        connection.query(q_profil, (err_profil, rows_profil, fields_profil) => {
          if (err_profil) throw err_profil;

          const profil = rows_profil;
          res.render("feed/post_comment", {
            list_comment,
            profil,
            post,
          });
        });
      });
    });
  }
  // kalo belum login
  else {
    res.redirect("/login");
  }
});

// post_comment api
app.post("/post_comment", multer().none(), (req, res) => {
  const comment = req.body.comment;
  const uuid_post = req.body.uuid_post;
  const uuid = uuidv4();
  const uuid_user = req.signedCookies["uuid"];

  let q = `insert into comment (uuid, user, post, comment) `;
  q += `values ('${uuid}', '${uuid_user}', '${uuid_post}', '${comment}')`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;
    res.redirect(`/post_comment/?uuid=${uuid_post}`);
    connection.end();
  });
});

// delete_comment api
app.get("/delete_comment", multer().none(), (req, res) => {
  const uuid = req.query.uuid;
  const uuid_post = req.query.uuid_post;

  let q = `update comment set hapus='hapus' where uuid='${uuid}'`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;
    res.redirect(`/post_comment/?uuid=${uuid_post}`);
    connection.end();
  });
});

// follow api
app.get("/follow", multer().none(), (req, res) => {
  const uuid_target = req.query.uuid;
  const uuid_user = req.signedCookies["uuid"];
  const uuid = uuidv4();

  let q = `insert into following (uuid, user, following) `;
  q += `values ('${uuid}', '${uuid_user}', '${uuid_target}')`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;
    res.redirect(`/user/?uuid=${uuid_target}`);

    connection.end();
  });
});

// unfollow api
app.get("/unfollow", multer().none(), (req, res) => {
  const uuid_target = req.query.uuid;
  const uuid_user = req.signedCookies["uuid"];

  let q = `delete from following where user='${uuid_user}' and following='${uuid_target}'`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;
    res.redirect(`/user/?uuid=${uuid_target}`);

    connection.end();
  });
});

// search page
app.get("/search_feed", (req, res) => {
  // kalo uda login
  if (req.signedCookies["uuid"]) {
    let q = `SELECT * FROM post`;
    q += ` WHERE post.hapus is null order by rand()`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    // data post
    connection.query(q, (err, rows, fields) => {
      if (err) throw err;
      let list_post = rows;

      // data profil
      let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
      connection.query(q_profil, (err_profil, rows_profil, fields_profil) => {
        if (err_profil) throw err_profil;

        const profil = rows_profil;
        res.render("search/feed", {
          list_post,
          profil,
        });

        // res.send({ list_post, profil });
      });
    });
  }
  // kalo belum login
  else {
    res.redirect("/login");
  }
});

// search page
app.get("/search", (req, res) => {
  // kalo uda login
  if (req.signedCookies["uuid"]) {
    let q = `select * from user where hapus is null`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    // data post
    connection.query(q, (err, rows, fields) => {
      if (err) throw err;
      let list_user = rows;

      // data profil
      let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
      connection.query(q_profil, (err_profil, rows_profil, fields_profil) => {
        if (err_profil) throw err_profil;

        const profil = rows_profil;
        res.render("search/search", {
          list_user,
          profil,
        });

        // res.send({ list_user, profil });
      });
    });
  }
  // kalo belum login
  else {
    res.redirect("/login");
  }
});

// search middleware
app.post("/search", multer().none(), (req, res) => {
  const cari_value = req.body.cari_value;

  let q = `select * from user where `;
  q += `username LIKE '%${cari_value}%' OR first_name LIKE '%${cari_value}%' OR last_name LIKE '%${cari_value}%' `;
  q += `and hapus is null`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;

    res.send(rows);
    connection.end();
  });
});

// user_following page
app.get("/user_following", (req, res) => {
  // kalo uda login
  if (req.signedCookies["uuid"]) {
    let q = `select following.following,`;
    q += ` user.username, user.image, user.first_name, user.last_name`;

    q += ` FROM following`;
    q += ` INNER JOIN user ON following.following = user.uuid`;
    q += ` WHERE following.user = '${req.query.uuid}'`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;

      const list_following = rows;

      let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
      connection.query(q_profil, (err_profil, rows_profil, fields_profil) => {
        if (err_profil) throw err_profil;

        const profil = rows_profil;
        // res.send({ list_following, profil });
        res.render("user/user_following", {
          list_following,
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

// user_followers page
app.get("/user_followers", (req, res) => {
  // kalo uda login
  if (req.signedCookies["uuid"]) {
    let q = `select following.user,`;
    q += ` user.username, user.image, user.first_name, user.last_name`;

    q += ` FROM following`;
    q += ` INNER JOIN user ON following.user = user.uuid`;
    q += ` WHERE following.following = '${req.query.uuid}'`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      if (err) throw err;

      const list_followers = rows;

      let q_profil = `select * from user where uuid = '${req.signedCookies["uuid"]}'`;
      connection.query(q_profil, (err_profil, rows_profil, fields_profil) => {
        if (err_profil) throw err_profil;

        const profil = rows_profil;
        res.render("user/user_followers", {
          list_followers,
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

// saved middleware
app.post("/saved", multer().none(), (req, res) => {
  const uuid_post = req.body.uuid_post;
  const uuid_user = req.signedCookies["uuid"];
  const uuid = uuidv4();

  let q = `insert into saved (uuid, user, post) `;
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

// unsaved middleware
app.post("/unsaved", multer().none(), (req, res) => {
  const uuid_post = req.body.uuid_post;
  const uuid_user = req.signedCookies["uuid"];

  let q = `delete from saved where user='${uuid_user}' and post='${uuid_post}'`;

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

// saved page
app.get("/saved", (req, res) => {
  // kalau sudah login
  if (req.signedCookies["uuid"]) {
    const uuid = req.signedCookies["uuid"];
    let q = `select * from user where hapus is null and uuid='${uuid}'`;
    // let q_list = `select * from saved where user='${uuid}' order by id desc`;

    let q_list = `
    SELECT post.image, post.uuid
    FROM post
    INNER JOIN saved ON post.uuid = saved.post
    WHERE saved.user = '${uuid}'
    ORDER BY saved.id DESC;
    `;

    let q_count_post = `select COUNT(*) as jumlah_post from post where hapus is null and user='${uuid}'`;
    let q_count_following = `select COUNT(*) as jumlah_following from following where user='${uuid}'`;
    let q_count_followers = `select COUNT(*) as jumlah_followers from following where following='${uuid}'`;

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
      const uuid_user = rows[0].uuid;
      const username = rows[0].username;
      const first_name = rows[0].first_name;
      const last_name = rows[0].last_name;
      const image = rows[0].image;
      const bio = rows[0].bio;

      // cari data post user
      connection.query(q_list, (err2, rows2, fields2) => {
        const list_post = rows2;

        // jumlah_post
        connection.query(q_count_post, (err3, rows3, fields3) => {
          const jumlah_post = rows3[0].jumlah_post;

          // jumlah_following
          connection.query(q_count_following, (err4, rows4, fields4) => {
            const jumlah_following = rows4[0].jumlah_following;

            // jumlah_followers
            connection.query(q_count_followers, (err5, rows5, fields5) => {
              const jumlah_followers = rows5[0].jumlah_followers;

              res.render("profil/saved", {
                uuid_user,
                username,
                first_name,
                last_name,
                image,
                bio,
                list_post,
                jumlah_post,
                jumlah_following,
                jumlah_followers,
              });
            });
          });
        });
      });
    });
  }
  // kalau belum login
  else {
    res.redirect("/login");
  }
});

// dm page
app.get("/dm", (req, res) => {
  // kalau sudah login
  if (req.signedCookies["uuid"]) {
    const uuid = req.signedCookies["uuid"];
    const uuid_target = req.query.uuid;
    let q = `select * from dm where (target='${uuid_target}' and user='${uuid}') OR (user='${uuid_target}' and target='${uuid}')`;
    let q_target = `select * from user where uuid='${uuid_target}'`;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "admininstagram",
      password: "admininstagram",
      database: "instagram-clone-nodejs",
    });

    connection.connect();

    connection.query(q, (err, rows, fields) => {
      let chat = [];
      rows.forEach((x) => {
        const ts = formatDatetime(x.ts);
        let x2 = {
          id: x.id,
          uuid: x.uuid,
          user: x.user,
          target: x.target,
          chat: x.chat,
          ts,
        };
        chat.push(x2);
      });

      connection.query(q_target, (err2, rows2, fields2) => {
        const target = rows2;

        // res.send({ chat, target });
        res.render("chat/dm", {
          chat,
          target,
        });
      });
    });
  }
  // kalau belum login
  else {
    res.redirect("/login");
  }
});

// send_dm middleware
app.post("/send_dm", multer().none(), (req, res) => {
  const uuid_target = req.body.uuid_target;
  const isi_pesan = req.body.isi_pesan;
  const uuid_user = req.signedCookies["uuid"];
  const uuid = uuidv4();

  let q = `insert into dm (uuid, user, target, chat) `;
  q += `values ('${uuid}', '${uuid_user}', '${uuid_target}', '${isi_pesan}')`;

  const connection = mysql.createConnection({
    host: "localhost",
    user: "admininstagram",
    password: "admininstagram",
    database: "instagram-clone-nodejs",
  });

  connection.connect();

  connection.query(q, (err, rows, fields) => {
    if (err) throw err;

    res.redirect(`/dm/?uuid=${uuid_target}`);
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

// Output: 31/03/2023 07:30
function formatDatetime(datetimeString) {
  const datetime = new Date(datetimeString);

  const formattedDate = datetime.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const formattedTime = datetime.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "numeric",
  });

  const formattedDatetime = `${formattedDate} ${formattedTime}`;

  return formattedDatetime;
}

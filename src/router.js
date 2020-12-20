const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const con = require("./database");
const middleware = require("./middleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  res.send("This boilerplate is working!");
});

// POST for user registration
router.post("/register", middleware.validateUserData, (req, res) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password;

  con.query(
    `SELECT * FROM users WHERE username = ${mysql.escape(username)}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Internal server error checking username validity" });
      } else if (result.length !== 0) {
        return res.status(400).json({ msg: "Username already exists." });
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res
              .status(400)
              .json({ msg: "Internal server error hashing user details" });
          } else {
            con.query(
              `INSERT INTO users (username, password) VALUES (${mysql.escape(
                username
              )}, ${mysql.escape(hash)})`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(400).json({
                    msg: "Internal server error saving user details.",
                  });
                } else {
                  return res.status(201).json({
                    msg: "New user has been successfully registered!",
                  });
                }
              }
            );
          }
        });
      }
    }
  );
});

// POST for login
router.post("/login", middleware.validateUserData, (req, res) => {
  const username = req.body.username.toLowerCase();

  con.query(
    `SELECT * FROM users WHERE username = ${mysql.escape(username)}`,
    (err, result) => {
      if (err || result.length === 0) {
        console.log(err);
        return res.status(400).json({
          msg: "The provided details are incorrect or the user does not exist",
        });
      } else {
        bcrypt.compare(
          req.body.password,
          result[0].password,
          (bcryptErr, bcryptResult) => {
            if (bcryptErr || !bcryptResult) {
              return res
                .status(400)
                .json({ msg: "Provided details are incorrect." });
            } else {
              if (bcryptResult) {
                const token = jwt.sign(
                  { userId: result[0].id, username: result[0].username },
                  process.env.SECRETKEY,
                  { expiresIn: "7d" }
                );
                return res.status(200).json({
                  msg: "You have succesfully logged in.",
                  token,
                  userData: {
                    userId: result[0].id,
                    username: result[0].username,
                  },
                });
              }
            }
          }
        );
      }
    }
  );
});

//POST for adding new movie to collection
router.post("/collection", middleware.isLoggedIn, (req, res) => {
  const data = req.body;

  console.log(data);
  con.query(
    `SELECT * FROM collection WHERE imdb_id = ${mysql.escape(
      data.imdb_id
    )} AND user_id = ${req.userData.userId}`,
    (err, result) => {
      if (err || result.length !== 0) {
        console.log(err);
        return res.status(400).json({
          msg: "You have this movie in your list already. Explore for more!",
        });
      } else {
        if (
          data.imdb_id &&
          data.title &&
          data.description &&
          data.duration &&
          data.genres &&
          data.seen
        ) {
          con.query(
            `INSERT INTO collection (user_id, imdb_id, title, poster, fanart, description, duration, genres, seen) VALUES (${
              req.userData.userId
            }, ${mysql.escape(data.imdb_id)}, ${mysql.escape(
              data.title
            )}, ${mysql.escape(data.poster)}, ${mysql.escape(
              data.fanart
            )}, ${mysql.escape(data.description)}, ${mysql.escape(
              data.duration
            )}, ${mysql.escape(data.genres)},${mysql.escape(data.seen)})`,
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(400).json({
                  msg: "Internal server error gathering movie details",
                });
              } else {
                return res.status(200).json({
                  msg: "Movie has been successfully added to Your collection!",
                });
              }
            }
          );
        } else {
          return res.status(400).json({ msg: "Issue getting movie details." });
        }
      }
    }
  );
});

// POST for adding new movie to watchlist
router.post("/watchlist", middleware.isLoggedIn, (req, res) => {
  const data = req.body;

  console.log(data);
  con.query(
    `SELECT * FROM collection WHERE imdb_id = ${mysql.escape(
      data.imdb_id
    )} AND user_id = ${req.userData.userId}`,
    (err, result) => {
      if (err || result.length !== 0) {
        console.log(err);
        return res.status(400).json({
          msg: "You have this movie in your list already. Explore for more!",
        });
      } else {
        if (
          data.imdb_id &&
          data.title &&
          data.poster &&
          data.description &&
          data.duration &&
          data.genres
        ) {
          con.query(
            `INSERT INTO collection (user_id, imdb_id, title, poster, fanart, description, duration, genres, seen) VALUES (${
              req.userData.userId
            }, ${mysql.escape(data.imdb_id)}, ${mysql.escape(
              data.title
            )}, ${mysql.escape(data.poster)}, ${mysql.escape(
              data.fanart
            )}, ${mysql.escape(data.description)}, ${mysql.escape(
              data.duration
            )}, ${mysql.escape(data.genres)}, ${mysql.escape(data.seen)})`,
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(400).json({
                  msg: "Internal server error gathering movie details",
                });
              } else {
                return res.status(200).json({
                  msg: "Movie has been successfully added to Your watchlist!",
                });
              }
            }
          );
        } else {
          return res.status(400).json({ msg: "Issue getting movie details." });
        }
      }
    }
  );
});

// POST change seen statement from 'false' to 'true'
router.post("/watchlist/:id", middleware.isLoggedIn, (req, res) => {
  con.query(
    `SELECT seen FROM collection WHERE id = ${mysql.escape(req.params.id)}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ msg: "Internal server error gathering movie details" });
      } else {
        con.query(
          `UPDATE collection SET seen = true WHERE id = ${mysql.escape(
            req.params.id
          )}`,
          (err, result) => {
            if (err) {
              console.log(err);
              return res
                .status(400)
                .json({ msg: "Internal server error gathering movie details" });
            } else {
              return res.status(200).json({
                msg: "Movie has been successfully added to collection!",
              });
            }
          }
        );
      }
    }
  );
});

// GET movies from collection where seen = true (collection page)
router.get("/collection", middleware.isLoggedIn, (req, res) => {
  con.query(
    `SELECT * FROM collection WHERE seen = true AND user_id = ${req.userData.userId} ORDER BY id DESC`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ msg: "Internal server error gathering movie details" });
      } else {
        return res.status(200).json(result);
      }
    }
  );
});

// GET movies from collection where seen = false (watchlist page)
router.get("/watchlist", middleware.isLoggedIn, (req, res) => {
  con.query(
    `SELECT * FROM collection WHERE seen = false AND user_id = ${req.userData.userId} ORDER BY id DESC`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ msg: "Internal server error gathering movie details" });
      } else {
        return res.status(200).json(result);
      }
    }
  );
});

// GET movie description by id
router.get("/collection/:id", middleware.isLoggedIn, (req, res) => {
  con.query(
    `SELECT * FROM collection WHERE id = ${mysql.escape(req.params.id)}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ msg: "Internal server error gathering movie details" });
      } else {
        return res.status(200).json(result);
      }
    }
  );
});

// DELETE movies from collection or watchlist
router.delete("/delete/:id", middleware.isLoggedIn, (req, res) => {
  const data = req.params;

  con.query(
    `DELETE FROM collection WHERE id = ${mysql.escape(data.id)}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          msg:
            "We can not delete selected movie at the moment. Please try again later!",
        });
      } else {
        return res
          .status(200)
          .json({ msg: "Movie has been successfully deleted!" });
      }
    }
  );
});

module.exports = router;

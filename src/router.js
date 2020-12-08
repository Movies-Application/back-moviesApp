const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const con = require("./database");
const middleware = require("./middleware");

router.get("/", (req, res) => {
  res.send("This boilerplate is working!");
});

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
        con.query(
          `INSERT INTO users (username, password) VALUES (${mysql.escape(
            username
          )}, ${mysql.escape(password)})`,
          (er, result) => {
            if (err) {
              console.log(err);
              return res
                .status(400)
                .json({ msg: "Internal server error saving user details." });
            } else {
              return res
                .status(201)
                .json({ msg: "New user has been successfully registered!" });
            }
          }
        );
      }
    }
  );
});

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
        return res.status(200).json({ msg: "You have succesfully logged in." });
      }
    }
  );
});

module.exports = router;

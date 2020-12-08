const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config();

const port = process.env.SERVER_PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("This boilerplate is working!");
});

app.listen(port, () => console.log(`Server is running on port ${port}`));

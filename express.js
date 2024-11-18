const express = require("express");

const app = express();

var connection = require("./database");

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/App/home.html");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

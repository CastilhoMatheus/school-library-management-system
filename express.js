const express = require("express");
const path = require("path");

const app = express();
var bodyParser = require("body-parser");
var connection = require("./database");

app.use(express.static(path.join(__dirname, "App")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/App/login.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname + "/App/home.html"));
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Please fill in all fields." });
  }

  // Query to find the user
  const query = "SELECT * FROM Users WHERE email = ?";
  connection.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send({ message: "Database error." });

    if (results.length === 0) {
      return res.status(401).send({ message: "Invalid email or password." });
    }

    const user = results[0];
    const match = password === user.password;

    if (match) {
      res.status(200).send({
        message: "Login successful!",
        user: { id: user.user_id, name: user.name, userType: user.user_type },
      });
    } else {
      res.status(401).send({ message: "Invalid email or password." });
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

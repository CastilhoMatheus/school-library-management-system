require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { connection, setupDatabase, processCSVData } = require("./database");

const csvData = `"John, Doe",30,"johndoe@example.com", "0893216548", "1YR5DD", "librarian", "1234", NULL
"Jane, Smith",19,"janesmith@example.com", "0892856548", "8MH7WE", "student", "password1", "2023335"
"Michael, Johnson","michaeljohnson@example.com", "0898523694", "7RP0RR", "student", "password2", "2021123"
"Tommy, Bean","michaeljohnson@example.com", "0894859612", "EYR5DD", "student", "password3", "2020000"`;

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Middleware
app.use(express.static(path.join(__dirname, "App")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

setupDatabase()
  .then(() => {
    processCSVData(csvData);
  })
  .catch((err) => {
    console.error("Database setup failed:", err);
  });

app.post("/submit", (req, res) => {
  const {
    firstName,
    lastName,
    age,
    email,
    phone,
    eircode,
    studentNumber,
    password,
  } = req.body;
  const role = "student";
  const sql = `INSERT INTO mysql_table (first_name, last_name, age, email, phone_number, eircode, role, password, student_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  connection.query(
    sql,
    [
      firstName,
      lastName,
      age,
      email,
      phone,
      eircode,
      role,
      password,
      studentNumber,
      password,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error inserting data.");
      }
      res.send("User registered successfully!");
    }
  );
});

// Serve HTML Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "App/login.html"));
});

//page for admins
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "App/home.html"));
});

//page for users
app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "App/studentView.html"));
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Please fill in all fields." });
  }

  const query = "SELECT * FROM mysql_table WHERE email = ?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).send({ message: "Database error." });
    }

    if (results.length === 0) {
      return res.status(401).send({ message: "Invalid email or password." });
    }

    const user = results[0];
    const match = password === user.password;

    if (match) {
      res.status(200).send({
        message: "Login successful!",
        user: { id: user.user_id, name: user.first_name, userType: user.role },
      });
    } else {
      res.status(401).send({ message: "Invalid email or password." });
    }
  });
});

// API to fetch books with booking info
app.get("/api/books", (req, res) => {
  const query = `
      SELECT 
        Books.book_id,
        Books.title,
        Books.author,
        Books.is_booked,
        mysql_table.student_number,
        mysql_table.first_name AS student_name,
        Transactions.status AS booking_status
      FROM 
        Books
      LEFT JOIN 
        Transactions ON Books.book_id = Transactions.book_id AND Transactions.status = 'booked'
      LEFT JOIN 
        mysql_table ON Transactions.user_id = mysql_table.user_id;
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching books:", err);
      return res.status(500).send("Error fetching books");
    }
    res.json(results);
  });
});

// API to add a new book
app.post("/api/add", (req, res) => {
  const { title, author } = req.body;

  // Validation: Ensure both title and author are provided
  if (!title || !author) {
    return res.status(400).json({ error: "Title and Author are required" });
  }

  const query = "INSERT INTO Books (title, author, is_booked) VALUES (?, ?, 0)";

  // Execute the SQL query
  connection.query(query, [title, author], (err, results) => {
    if (err) {
      console.error("Error adding book:", err);
      return res.status(500).json({ error: "Error adding book" });
    }
    res
      .status(201)
      .json({ message: "Book added successfully", bookId: results.insertId });
  });
});

//Book a book
app.put("/api/books/:id/book", (req, res) => {
  const { id } = req.params; // Extract book ID from the URL
  const { student_number, action } = req.body; // Extract student_number and action from the body

  if (action === "book") {
    // Step 1: Fetch user_id based on student_number
    const getUserQuery =
      "SELECT user_id FROM mysql_table WHERE student_number = ?";
    connection.query(getUserQuery, [student_number], (err, results) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).send("Error fetching user");
      }

      if (results.length === 0) {
        return res.status(404).send("Student number not found");
      }

      const user_id = results[0].user_id;

      // Step 2: Insert transaction and update book status
      const insertTransactionQuery =
        "INSERT INTO Transactions (book_id, user_id, status) VALUES (?, ?, 'booked')";
      connection.query(insertTransactionQuery, [id, user_id], (err) => {
        if (err) {
          console.error("Error inserting transaction:", err);
          return res.status(500).send("Error inserting transaction");
        }

        const updateBookQuery =
          "UPDATE Books SET is_booked = 1 WHERE book_id = ?";
        connection.query(updateBookQuery, [id], (err) => {
          if (err) {
            console.error("Error updating book status:", err);
            return res.status(500).send("Error updating book status");
          }

          res
            .status(200)
            .json({ book_id: id, message: "Book booked successfully" });
        });
      });
    });
  } else {
    res.status(400).send("Invalid action");
  }
});

//API to return book
app.put("/api/books/:id/return", (req, res) => {
  const { id } = req.params; // Extract book ID from the URL
  const { action } = req.body; // Extract action from the body

  if (action === "return") {
    // Step 1: Fetch user_id of the user currently holding the book
    const getUserQuery = `
        SELECT user_id 
        FROM Transactions 
        WHERE book_id = ? AND status = 'booked' 
        LIMIT 1
      `;
    connection.query(getUserQuery, [id], (err, results) => {
      if (err) {
        console.error("Error fetching user holding the book:", err);
        return res.status(500).send("Error fetching user holding the book");
      }

      if (results.length === 0) {
        return res.status(404).send("No active booking found for this book");
      }

      const user_id = results[0].user_id;

      // Step 2: Update the transaction and book status
      const updateTransactionQuery = `
          UPDATE Transactions 
          SET status = 'returned', returned_at = CURRENT_TIMESTAMP 
          WHERE book_id = ? AND user_id = ? AND status = 'booked'
        `;
      connection.query(updateTransactionQuery, [id, user_id], (err) => {
        if (err) {
          console.error("Error updating transaction:", err);
          return res.status(500).send("Error updating transaction");
        }

        const updateBookQuery =
          "UPDATE Books SET is_booked = 0 WHERE book_id = ?";
        connection.query(updateBookQuery, [id], (err) => {
          if (err) {
            console.error("Error updating book status:", err);
            return res.status(500).send("Error updating book status");
          }

          res
            .status(200)
            .json({ book_id: id, message: "Book returned successfully" });
        });
      });
    });
  } else {
    res.status(400).send("Invalid action");
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;

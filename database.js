require("dotenv").config();
const mysql = require("mysql2");

// Establishes a connection to the MySQL database using environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const setupDatabase = () => {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error("Error connecting to the database:", err);
        return reject(err);
      }
      console.log("Connected to the database.");

      // Create the Users table if it doesn't exist
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS mysql_table (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          age INT,
          email VARCHAR(100) NOT NULL UNIQUE,
          phone_number VARCHAR(15) NOT NULL,
          eircode VARCHAR(20) NOT NULL,
          role ENUM('student', 'librarian') NOT NULL,
          password VARCHAR(255) NOT NULL,
          student_number VARCHAR(20) UNIQUE DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Create the Books table if it doesn't exist
      const createBooksTable = `
        CREATE TABLE IF NOT EXISTS Books (
          book_id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) UNIQUE NOT NULL,
          author VARCHAR(100),
          is_booked BOOLEAN DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Create the Transactions table if it doesn't exist
      const createTransactionsTable = `
        CREATE TABLE IF NOT EXISTS Transactions (
          transaction_id INT AUTO_INCREMENT PRIMARY KEY,
          book_id INT NOT NULL,
          user_id INT NOT NULL,
          status ENUM('booked', 'returned') DEFAULT 'booked',
          returned_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES mysql_table(user_id) ON DELETE CASCADE
        );
      `;

      //Inserting some books to ddb
      const insertBooksQuery = `
        INSERT INTO Books (title, author, is_booked) VALUES
        ('The Great Gatsby', 'F. Scott Fitzgerald', 0),
        ('To Kill a Mockingbird', 'Harper Lee', 0),
        ('1984', 'George Orwell', 0),
        ('Pride and Prejudice', 'Jane Austen', 0),
        ('The Catcher in the Rye', 'J.D. Salinger', 0),
        ('The Hobbit', 'J.R.R. Tolkien', 0),
        ('Fahrenheit 451', 'Ray Bradbury', 0),
        ('The Lord of the Rings', 'J.R.R. Tolkien', 0),
        ('Animal Farm', 'George Orwell', 0),
        ('Brave New World', 'Aldous Huxley', 0),
        ('The Alchemist', 'Paulo Coelho', 0),
        ('The Da Vinci Code', 'Dan Brown', 0),
        ('The Hunger Games', 'Suzanne Collins', 0),
        ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 0),
        ('The Chronicles of Narnia', 'C.S. Lewis', 0),
        ('The Girl with the Dragon Tattoo', 'Stieg Larsson', 0),
        ('The Shining', 'Stephen King', 0),
        ('The Fault in Our Stars', 'John Green', 0),
        ('Gone Girl', 'Gillian Flynn', 0),
        ('The Book Thief', 'Markus Zusak', 0),
        ('The Help', 'Kathryn Stockett', 0);
      `;

      // Ensure all tables are created
      connection.query(createUsersTable, (err) => {
        if (err) {
          console.error("Error creating Users table:", err);
          return reject(err);
        }
        console.log("Users table ensured.");
      });

      connection.query(createBooksTable, (err) => {
        if (err) {
          console.error("Error creating Books table:", err);
          return reject(err);
        }
        console.log("Books table ensured.");
      });

      connection.query(createTransactionsTable, (err) => {
        if (err) {
          console.error("Error creating Transactions table:", err);
          return reject(err);
        }
        console.log("Transactions table ensured.");
      });

      connection.query(insertBooksQuery, (err) => {
        if (err) {
          console.error("Error inserting books:", err);
          return reject(err);
        }
        console.log("Books inserted.");
      });

      resolve();
    });
  });
};

const parseCSVLine = (line) => {
  const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(line)) !== null) {
    matches.push(match[0].replace(/(^"|"$)/g, "").trim());
  }

  return matches;
};

const executeSQLQuery = (query, callback) => {
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return callback(err);
    }
    console.log("Query executed successfully:", results);
    callback(null, results);
  });
};

const processCSVData = (csvData) => {
  const rows = csvData.split("\n");
  const sqlStatements = [];

  rows.forEach((row) => {
    const values = parseCSVLine(row);

    if (values.length !== 8) {
      console.error(`Invalid row: ${row}`);
      return;
    }

    const [name, age, email, phone, eir_code, role, password, student_number] =
      values;
    const [first_name, last_name] = name
      .split(",")
      .map((value) => value.trim());

    const sql = `INSERT INTO mysql_table (first_name, last_name, age, email, phone_number, eircode, role, password, student_number) VALUES ('${first_name}', '${last_name}', ${
      age ? age : "NULL"
    }, '${email}', '${phone}', '${eir_code}', '${role}', '${password}', ${
      student_number === "NULL" ? "NULL" : `'${student_number}'`
    });`;
    sqlStatements.push(sql);
  });

  sqlStatements.forEach((sql) => {
    executeSQLQuery(sql, (err, results) => {
      if (err) {
        console.error("Failed to execute query:", err);
      }
    });
  });
};

module.exports = { connection, setupDatabase, processCSVData };

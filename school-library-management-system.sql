create schema library_system;

use library_system;

-- Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'librarian') NOT NULL,
    student_number VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books Table
CREATE TABLE Books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('booked', 'returned') NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Insert Librarian
INSERT INTO Users (name, email, password, user_type, student_number)
VALUES 
('Alice Librarian', 'alice.librarian@example.com', 'librarian123', 'librarian', NULL);

-- Insert Students
INSERT INTO Users (name, email, password, user_type, student_number)
VALUES 
('John Doe', 'john.doe@example.com', 'student123', 'student', 'STU12345'),
('Jane Smith', 'jane.smith@example.com', 'student456', 'student', 'STU54321');

-- Insert Books
INSERT INTO Books (title, author, is_booked)
VALUES 
('To Kill a Mockingbird', 'Harper Lee', FALSE),
('1984', 'George Orwell', FALSE),
('The Great Gatsby', 'F. Scott Fitzgerald', FALSE),
('Pride and Prejudice', 'Jane Austen', TRUE);  -- Already booked

-- Insert Transactions
INSERT INTO Transactions (book_id, user_id, status, booked_at)
VALUES 
(4, 2, 'booked', NOW());  -- "Pride and Prejudice" booked by John Doe

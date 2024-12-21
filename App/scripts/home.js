function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const userId = getQueryParam("userId");
const userName = getQueryParam("userName");

if (!userId && !userName) {
  window.location.href = "/";
}

const user = document.getElementById("user-name");
const profileBtn = document.getElementById("user-name-btn");

user.innerHTML = "Welcome, " + userName;
profileBtn.innerHTML = userName;

// JavaScript for CRUD operations
const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");

// Fetch books from the API
let books = [];
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:3000/api/books");
    books = await response.json();
    renderBooks();
  } catch (error) {
    console.error("Error fetching books:", error);
  }
});

// Adjust book rendering to add return button if booked
function renderBooks() {
  bookList.innerHTML = "";
  books.forEach((book) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td style="color: ${book.is_booked ? "red" : "green"};">
                      ${book.is_booked ? "Booked" : "Available"}
                    </td>
                    <td>${book.student_number || "-"}</td>
                    <td>
                      ${
                        book.is_booked
                          ? `<button onclick="returnBook(${book.book_id})">Return</button>`
                          : `<button onclick="bookBook(${book.book_id})">Book</button>`
                      }
                     
                    </td>
                `;
    bookList.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const addBookForm = document.getElementById("addBookForm");

  // Event listener for form submission
  addBookForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const title = document.getElementById("bookTitle").value;
    const author = document.getElementById("bookAuthor").value;

    try {
      const response = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author }),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Book added successfully: " + result.message);
        addBookForm.reset(); // Clear the form fields
        window.location.reload();
      } else {
        const errorText = await response.text();
        alert("Failed to add book: " + errorText);
        console.error("Error adding book:", errorText);
      }
    } catch (error) {
      console.error("Error adding book:", error);
      alert("An error occurred while adding the book. Please try again.");
    }
  });
});

// Book a book
async function bookBook(bookId) {
  const studentNumber = prompt("Enter Student Number:");
  if (studentNumber) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/books/${bookId}/book`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "book",
            student_number: studentNumber,
          }),
        }
      );

      if (response.ok) {
        const updatedBook = await response.json();
        books = books.map((book) =>
          book.book_id === bookId ? updatedBook : book
        );
        renderBooks();
        location.reload();
      } else {
        alert("Invalid student number. Please try again.");
        console.error("Error booking book:", await response.text());
      }
    } catch (error) {
      alert("Invalid student number. Please try again.");
      console.error("Error booking book:", error);
    }
  }
}

// Return a book
async function returnBook(bookId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/books/${bookId}/return`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "return", user_id: userId }),
      }
    );

    if (response.ok) {
      const updatedBook = await response.json();
      books = books.map((book) =>
        book.book_id === bookId ? updatedBook : book
      );
      renderBooks();
      location.reload();
    } else {
      console.error("Error returning book:", await response.text());
    }
  } catch (error) {
    console.error("Error returning book:", error);
  }
}

// Simple logout function
function logout() {
  window.location.href = "/";
}

// Toggle dropdown visibility
function toggleDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("show");
}

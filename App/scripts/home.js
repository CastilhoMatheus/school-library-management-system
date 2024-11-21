function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const userId = getQueryParam("userId");
const userName = getQueryParam("userName");

if (!userId && !userName) {
  window.location.href = "/";
}

user = document.getElementById("user-name");
profileBtn = document.getElementById("user-name-btn");

user.innerHTML = "welcome, " + userName;
profileBtn.innerHTML = userName;

// JavaScript for simple CRUD operations
const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");

// Temporary book storage with booking status
let books = [
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isBooked: false,
    studentNumber: null,
  },
];

// Function to render books
function renderBooks() {
  bookList.innerHTML = "";
  books.forEach((book, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.isBooked ? "Booked" : "Available"}</td>
                    <td>${book.studentNumber ? book.studentNumber : "-"}</td>
                    <td>
                        <button onclick="bookBook(${index})" ${
      book.isBooked ? "disabled" : ""
    }>Book</button>
                        <button onclick="editBook(${index})">Edit</button>
                        <button onclick="deleteBook(${index})">Delete</button>
                    </td>
                `;
    bookList.appendChild(row);
  });
}

// Add book
bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("bookTitle").value;
  const author = document.getElementById("bookAuthor").value;
  books.push({ title, author, isBooked: false, studentNumber: null });
  bookForm.reset();
  renderBooks();
});

// Delete book
function deleteBook(index) {
  books.splice(index, 1);
  renderBooks();
}

// Edit book
function editBook(index) {
  const book = books[index];
  document.getElementById("bookTitle").value = book.title;
  document.getElementById("bookAuthor").value = book.author;
  books.splice(index, 1);
  renderBooks();
}

// Book a book
function bookBook(index) {
  const studentNumber = prompt("Enter Student Number:");
  if (studentNumber) {
    books[index].isBooked = true;
    books[index].studentNumber = studentNumber;
    renderBooks();
  }
}

// Simple logout function
function logout() {
  alert("Logging out...");
  // Implement actual logout logic here
}

// Toggle dropdown visibility
function toggleDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("show");
}

// Close dropdown if clicked outside
window.onclick = function (event) {
  if (!event.target.matches(".user-button")) {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown.classList.contains("show")) {
      dropdown.classList.remove("show");
    }
  }
};

// Render initial books
renderBooks();

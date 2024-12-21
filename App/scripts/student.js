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
let books = [];

document.addEventListener("DOMContentLoaded", async function (e) {
  e.preventDefault();
  try {
    const response = await fetch("http://localhost:3000/api/books");
    const data = await response.json();
    books = data;
    renderBooks();
  } catch (error) {
    console.error("Error fetching books:", error);
  }
});

// Function to render books
function renderBooks() {
  bookList.innerHTML = "";
  books.forEach((book, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                      <td>${book.title}</td>
                      <td>${book.author}</td>
                      <td style="color: ${book.is_booked ? "red" : "green"};">
    ${book.is_booked ? "Booked" : "Available"}
  </td>
                    `;
    bookList.appendChild(row);
  });
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

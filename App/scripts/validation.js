document
  .getElementById("userForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const age = document.getElementById("age").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const eircode = document.getElementById("eircode").value;
    const studentNumber = document.getElementById("studentNumber").value;
    const password = document.getElementById("password").value;

    const nameRegex = /^[a-zA-Z0-9]{1,20}$/;
    const phoneRegex = /^\d{10}$/;
    const eircodeRegex = /^[0-9][a-zA-Z0-9]{5}$/;

    if (!nameRegex.test(firstName)) {
      alert("First name must be alphanumeric and up to 20 characters.");
      return;
    }
    if (!nameRegex.test(lastName)) {
      alert("Last name must be alphanumeric and up to 20 characters.");
      return;
    }
    if (age <= 0 || age >= 200) {
      alert("Please enter a valid age between 1 and 199.");
      return;
    }
    if (!email.includes("@")) {
      alert("Email must follow the correct email structure.");
      return;
    }
    if (!phoneRegex.test(phone)) {
      alert("Phone number must be numeric and exactly 10 characters.");
      return;
    }
    if (!eircodeRegex.test(eircode)) {
      alert(
        "Eircode must start with a number, be alphanumeric, and be exactly 6 characters."
      );
      return;
    }
    if (studentNumber.length === 0) {
      alert("Student number is required.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // If all validations pass, submit the form data via fetch
    const formData = {
      firstName,
      lastName,
      age,
      email,
      phone,
      eircode,
      studentNumber,
      password,
    };

    fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.text())
      .then((data) => {
        alert("User registered successfully!");
        window.location.href = "login.html"; // Redirect to login page
      })
      .catch((error) => {
        console.error("Error during registration:", error);
        alert("An error occurred. Please try again.");
      });
  });

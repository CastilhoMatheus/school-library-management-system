document
  .getElementById("registerButton")
  .addEventListener("click", function () {
    window.location.href = "form.html";
  });

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.userType === "librarian") {
          window.location.href = `/home?userId=${
            data.user.id
          }&userName=${encodeURIComponent(data.user.name)}`;
        } else {
          window.location.href = `/student?userId=${
            data.user.id
          }&userName=${encodeURIComponent(data.user.name)}`;
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  });

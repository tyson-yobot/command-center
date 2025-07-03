export function submitForm() {
  const name = document.getElementById("ticket-name")?.value || "Anonymous";
  const email = document.getElementById("ticket-email")?.value;
  const subject = document.getElementById("ticket-subject")?.value || "General Support";
  const message = document.getElementById("ticket-message")?.value;

  if (!email || !message) {
    alert("Email and message are required.");
    return;
  }

  fetch("http://localhost:10000/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, subject, message }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Ticket submitted successfully!");
    })
    .catch((err) => {
      console.error("Error submitting ticket:", err);
      alert("There was an error submitting your ticket.");
    });
}

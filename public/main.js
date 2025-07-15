function showMessage(type, text) {
  const messageBox = document.getElementById("message");
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.classList.remove("hidden");

  setTimeout(() => {
    messageBox.classList.add("hidden");
  }, 3000);
}

document
  .getElementById("exercise-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const userId = formData.get("userId");
    const data = {
      description: formData.get("description"),
      duration: formData.get("duration"),
      date: formData.get("date"),
    };

    const res = await fetch(`/api/users/${userId}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      showMessage("error", error.error || "Failed to add exercise");
      return;
    }

    const result = await res.json();
    showMessage(
      "success",
      `Exercise added for ${result.username} on ${result.date}`
    );
    this.reset();
  });

document
  .getElementById("log-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const userId = formData.get("userId");
    const from = formData.get("from");
    const to = formData.get("to");
    const limit = formData.get("limit");

    let url = `/api/users/${userId}/logs?`;
    if (from) url += `from=${from}&`;
    if (to) url += `to=${to}&`;
    if (limit) url += `limit=${limit}`;

    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      showMessage("error", error.error || "Failed to fetch logs");
      return;
    }

    const result = await res.json();
    showMessage(
      "success",
      `Showing ${result.count} logs for ${result.username}`
    );

    const logContainer = document.getElementById("log-results");
    logContainer.innerHTML = `
      <h3>${result.username}'s Log (${result.count} entries)</h3>
      <ul>
        ${result.log
          .map(
            (item) => `
              <li>
                <strong>${item.description}</strong> - ${item.duration} mins on ${item.date}
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  });
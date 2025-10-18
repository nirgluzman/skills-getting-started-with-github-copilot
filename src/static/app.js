document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear activity select options but keep the placeholder (first option)
      while (activitySelect.options.length > 1) {
        activitySelect.remove(1);
      }

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants section (bulleted list) — show friendly text if none
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsTitle = document.createElement("strong");
        participantsTitle.textContent = "Participants:";
        participantsSection.appendChild(participantsTitle);

        if (details.participants && details.participants.length) {
          const participantsContainer = document.createElement("div");
          participantsContainer.className = "participants-container";
          participantsContainer.style.marginTop = "0.25rem";

          details.participants.forEach((p) => {
            const row = document.createElement("div");
            row.className = "participant-row";
            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.justifyContent = "space-between";
            row.style.padding = "0.15rem 0";

            const emailSpan = document.createElement("span");
            emailSpan.textContent = p;
            emailSpan.className = "participant-email";

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "participant-delete";
            deleteBtn.title = `Unregister ${p}`;
            deleteBtn.textContent = "✖";
            deleteBtn.style.marginLeft = "0.75rem";
            deleteBtn.style.background = "transparent";
            deleteBtn.style.border = "none";
            deleteBtn.style.color = "#c62828";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.style.fontSize = "0.95rem";

            // Attach click handler to unregister
            deleteBtn.addEventListener("click", async () => {
              try {
                const resp = await fetch(
                  `/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );

                const result = await resp.json();
                if (resp.ok) {
                  // Refresh activities list
                  fetchActivities();
                } else {
                  console.error("Failed to unregister:", result);
                  alert(result.detail || "Failed to unregister participant");
                }
              } catch (err) {
                console.error("Error unregistering:", err);
                alert("Error unregistering participant");
              }
            });

            row.appendChild(emailSpan);
            row.appendChild(deleteBtn);
            participantsContainer.appendChild(row);
          });

          participantsSection.appendChild(participantsContainer);
        } else {
          const noPart = document.createElement("div");
          noPart.className = "no-participants";
          noPart.textContent = "No participants yet";
          noPart.style.marginTop = "0.25rem";
          participantsSection.appendChild(noPart);
        }

        activityCard.appendChild(document.createElement("h4")).textContent = name;
        activityCard.appendChild(document.createElement("p")).textContent = details.description;
        const scheduleP = document.createElement("p");
        scheduleP.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;
        activityCard.appendChild(scheduleP);
        const availP = document.createElement("p");
        availP.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;
        activityCard.appendChild(availP);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities so the new participant appears immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

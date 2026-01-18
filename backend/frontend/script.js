const API = "";


/* ================= STUDENT FUNCTIONS ================= */

// Add Student
function addStudent() {
  const name = document.getElementById("studentName").value;
  const roll = document.getElementById("rollNo").value;

  fetch(API + "/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, roll_no: roll })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || "Student added successfully");
    studentName.value = "";
    rollNo.value = "";
  });
}

// Edit Student
function editStudent() {
  fetch(API + "/students/" + editStudentId.value, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: editStudentName.value,
      roll_no: editStudentRoll.value
    })
  })
  .then(res => res.json())
  .then(data => alert(data.message || "Student updated"));
}

// Delete Student
function deleteStudent() {
  fetch(API + "/students/" + deleteStudentId.value, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(data => alert(data.message || "Student deleted"));
}

// Load Events (Student dropdown)
function loadEventsForStudents() {
  fetch(API + "/events")
    .then(res => res.json())
    .then(events => {
      eventSelect.innerHTML = `<option value="">-- Select Event --</option>`;
      events.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.event_id;
        opt.textContent = `${e.title} (${e.event_date})`;
        eventSelect.appendChild(opt);
      });
    });
}

// ✅ REGISTER EVENT (FIXED)
function registerEvent() {
  const rollNo = document.getElementById("studentId").value; // roll number
  const eventId = document.getElementById("eventSelect").value;

  if (!rollNo || !eventId) {
    alert("❌ Enter Roll No and select Event");
    return;
  }

  fetch(API + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roll_no: rollNo,     // ✅ FIX HERE
      event_id: eventId
    })
  })
  .then(res => res.json())
  .then(data => alert(data.message || "Registration successful"));
}

/* ================= ORGANIZER FUNCTIONS ================= */

// Load Events (Organizer)
function loadEventsForOrganizer() {
  fetch(API + "/events")
    .then(res => res.json())
    .then(events => {
      deleteEventSelect.innerHTML =
        `<option value="">-- Select Event to Delete --</option>`;

      events.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.event_id;
        opt.textContent = `${e.title} (${e.event_date})`;
        deleteEventSelect.appendChild(opt);
      });
    });
}

// Add Event
function addEvent() {
  fetch(API + "/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: eventTitle.value,
      description: eventDesc.value,
      event_date: eventDate.value
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || "Event added");
    loadEventsForStudents();
    loadEventsForOrganizer();
    eventTitle.value = "";
    eventDesc.value = "";
    eventDate.value = "";
  });
}

// Delete Event
function deleteEvent() {
  const eventId = deleteEventSelect.value;

  if (!eventId) {
    alert("❌ Please select an event");
    return;
  }

  fetch(API + "/events/" + eventId, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Event deleted");
      loadEventsForStudents();
      loadEventsForOrganizer();
    });
}

// View Registrations
function viewRegistrations() {
  fetch(API + "/registrations")
    .then(res => res.json())
    .then(data => {
      list.innerHTML = "";
      data.forEach(r => {
        list.innerHTML += `<li>${r.name} (${r.roll_no}) → ${r.title}</li>`;
      });
    });
}

function downloadRegistrations() {
  window.location.href = API + "/download-registrations";
}

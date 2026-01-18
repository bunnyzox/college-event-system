const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, "frontend")));


/* ================= STUDENTS ================= */

// Add Student
app.post("/students", (req, res) => {
  const { name, roll_no } = req.body;

  db.query(
    "INSERT INTO students (name, roll_no) VALUES (?, ?)",
    [name, roll_no],
    err => {
      if (err) return res.status(500).json({ message: "Failed to add student" });
      res.json({ message: "Student added successfully" });
    }
  );
});

// Edit Student
app.put("/students/:id", (req, res) => {
  const { name, roll_no } = req.body;

  db.query(
    "UPDATE students SET name=?, roll_no=? WHERE student_id=?",
    [name, roll_no, req.params.id],
    err => {
      if (err) return res.status(500).json({ message: "Failed to update student" });
      res.json({ message: "Student updated successfully" });
    }
  );
});

// Delete Student (with registrations)
app.delete("/students/:id", (req, res) => {
  const studentId = req.params.id;

  db.query(
    "DELETE FROM registrations WHERE student_id=?",
    [studentId],
    err => {
      if (err) return res.status(500).json({ message: "Failed to delete registrations" });

      db.query(
        "DELETE FROM students WHERE student_id=?",
        [studentId],
        err => {
          if (err) return res.status(500).json({ message: "Failed to delete student" });
          res.json({ message: "Student deleted successfully" });
        }
      );
    }
  );
});

/* ================= EVENTS ================= */

// Add Event
app.post("/events", (req, res) => {
  const { title, description, event_date } = req.body;

  db.query(
    "INSERT INTO events (title, description, event_date) VALUES (?, ?, ?)",
    [title, description, event_date],
    err => {
      if (err) return res.status(500).json({ message: "Failed to add event" });
      res.json({ message: "Event added successfully" });
    }
  );
});

// View Events
app.get("/events", (req, res) => {
  db.query("SELECT * FROM events", (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to fetch events" });
    res.json(result);
  });
});

// Delete Event (with registrations)
app.delete("/events/:id", (req, res) => {
  const eventId = req.params.id;

  db.query(
    "DELETE FROM registrations WHERE event_id=?",
    [eventId],
    err => {
      if (err) return res.status(500).json({ message: "Failed to delete registrations" });

      db.query(
        "DELETE FROM events WHERE event_id=?",
        [eventId],
        err => {
          if (err) return res.status(500).json({ message: "Failed to delete event" });
          res.json({ message: "Event deleted successfully" });
        }
      );
    }
  );
});


/* ================= REGISTRATIONS ================= */

// ✅ REGISTER USING ROLL NUMBER (FINAL & SAFE)
app.post("/register", (req, res) => {
  const { roll_no, event_id } = req.body;

  // ✅ Validation
  if (!roll_no || !event_id) {
    return res.status(400).json({
      message: "Roll number and Event are required"
    });
  }

  // ✅ Insert only if student exists
  const sql = `
    INSERT INTO registrations (student_id, event_id)
    SELECT student_id, ?
    FROM students
    WHERE roll_no = ?
      AND NOT EXISTS (
        SELECT 1 FROM registrations
        WHERE registrations.student_id = students.student_id
          AND registrations.event_id = ?
      )
  `;

  db.query(sql, [event_id, roll_no, event_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Registration failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Invalid roll number or already registered"
      });
    }

    res.json({ message: "Registration successful" });
  });
});

// View Registrations
app.get("/registrations", (req, res) => {
  const sql = `
    SELECT students.name, students.roll_no, events.title
    FROM registrations
    JOIN students ON registrations.student_id = students.student_id
    JOIN events ON registrations.event_id = events.event_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to load registrations" });
    res.json(result);
  });
});


/* ================= DOWNLOAD REGISTRATIONS ================= */

app.get("/download-registrations", (req, res) => {
  const sql = `
    SELECT 
      students.name AS Student_Name,
      students.roll_no AS Roll_No,
      events.title AS Event_Title
    FROM registrations
    JOIN students ON registrations.student_id = students.student_id
    JOIN events ON registrations.event_id = events.event_id
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).send("Failed to generate CSV");
    }

    // CSV header
    let csv = "Student Name,Roll No,Event Title\n";

    // CSV rows
    rows.forEach(r => {
      csv += `"${r.Student_Name}","${r.Roll_No}","${r.Event_Title}"\n`;
    });

    // Force download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=event_registrations.csv"
    );

    res.send(csv);
  });
});


const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
// Always serve frontend (Railway safe)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

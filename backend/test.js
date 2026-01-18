fetch("http://localhost:3000/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    student_id: 2,   // ✅ NOT roll_no
    event_id: 2
  })
})
.then(res => res.json())
.then(console.log);

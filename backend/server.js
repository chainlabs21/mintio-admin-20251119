const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------
// MySQL connection
// ------------------------
const db = mysql.createConnection({
  host: "151.106.113.26",
  user: "nftsns02",
  password: "NN9CNXJ3",
  database: "nftsns",
  port: 55681,
});

db.connect((err) => {
  if (err) console.error("DB connection failed:", err);
  else console.log("DB connected successfully!");
});

// ------------------------
// Helpers
// ------------------------
function normalizeDate(val) {
  if (!val || val.trim() === "") return null;
  return val.split("T")[0];
}

function normalizeInt(value, defaultVal = 1) {
  const n = Number(value);
  return Number.isInteger(n) ? n : defaultVal;
}

// ------------------------
// EVENTS ROUTES
// ------------------------

// GET /events → list with pagination
app.get("/events", (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const query = `
    SELECT * FROM event
    ORDER BY event_date ASC, id ASC
    LIMIT ? OFFSET ?
  `;

  db.query(query, [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    res.json(results);
  });
});

// GET /events/:id → single event
app.get("/events/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM event WHERE id = ? LIMIT 1", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    if (results.length === 0) return res.status(404).json({ error: "Event not found" });
    res.json(results[0]);
  });
});

// POST /events → create new event
app.post("/events", (req, res) => {
  const {
    title, description, kind, event_date, status, status_message,
    join_start, join_end,
    exposure_pre_start, exposure_pre_end,
    exposure_main_start, exposure_main_end,
  } = req.body;

  const query = `
    INSERT INTO event
      (title, description, kind, event_date, status, status_message,
       join_start, join_end,
       exposure_pre_start, exposure_pre_end,
       exposure_main_start, exposure_main_end,
       createdat, updatedat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const params = [
    title || null,
    description || null,
    kind || null,
    normalizeDate(event_date),
    normalizeInt(status, 1),
    status_message || "",
    normalizeDate(join_start),
    normalizeDate(join_end),
    normalizeDate(exposure_pre_start),
    normalizeDate(exposure_pre_end),
    normalizeDate(exposure_main_start),
    normalizeDate(exposure_main_end),
  ];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to create event", details: err });
    res.json({ message: "Event created successfully!", id: results.insertId });
  });
});

// PUT /events/:id → update existing event
app.put("/events/:id", (req, res) => {
  const { id } = req.params;
  const {
    title, description, kind, event_date, status, status_message,
    join_start, join_end,
    exposure_pre_start, exposure_pre_end,
    exposure_main_start, exposure_main_end,
  } = req.body;

  const query = `
    UPDATE event SET
      title=?, description=?, kind=?, event_date=?, status=?, status_message=?,
      join_start=?, join_end=?, exposure_pre_start=?, exposure_pre_end=?,
      exposure_main_start=?, exposure_main_end=?, updatedat=NOW()
    WHERE id=?
  `;

  const params = [
    title || null,
    description || null,
    kind || null,
    normalizeDate(event_date),
    normalizeInt(status, 1),
    status_message || "",
    normalizeDate(join_start),
    normalizeDate(join_end),
    normalizeDate(exposure_pre_start),
    normalizeDate(exposure_pre_end),
    normalizeDate(exposure_main_start),
    normalizeDate(exposure_main_end),
    id
  ];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Update failed", details: err });
    if (results.affectedRows === 0) return res.status(404).json({ error: "Event not found or no changes made" });
    res.json({ message: "Event updated successfully!" });
  });
});

// ------------------------
// ITEMS ROUTES (read-only)

// GET /items → list items with pagination
app.get("/items", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const query = `
    SELECT * FROM item
    ORDER BY id ASC
    LIMIT ? OFFSET ?
  `;

  db.query(query, [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    res.json(results);
  });
});

// GET /items/:id → single item
app.get("/items/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM item WHERE id = ? LIMIT 1", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    if (results.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(results[0]);
  });
});

// ------------------------
// USERS ROUTES (read-only)
// GET /users → list users with pagination
app.get("/users", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const query = `
    SELECT * FROM user
    ORDER BY id ASC
    LIMIT ? OFFSET ?
  `;

  db.query(query, [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    res.json(results);
  });
});

// GET /users/:id → single user by ID
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM user WHERE id = ? LIMIT 1", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
});


// ------------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js (plain password version)

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------
// Configuration
// ------------------------
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY_2025";
const JWT_EXPIRES = "8h";

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
// In-memory token blacklist
// ------------------------
const tokenBlacklist = new Set();
function blacklistToken(token) {
  tokenBlacklist.add(token);
}

// ------------------------
// Auth middleware
// ------------------------
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: "Token revoked" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username, level: decoded.level };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", details: err.message });
  }
}

// ------------------------
// ADMIN LOGIN ROUTE (plain password)
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  db.query(
    "SELECT * FROM `user` WHERE username = ? LIMIT 1",
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB query failed", details: err });

      if (results.length === 0) return res.status(404).json({ message: "User not found" });

      const user = results[0];

      if (Number(user.level) !== 2) {
        return res.status(403).json({ message: "Forbidden: not an admin" });
      }

      // ------------------------
      // Plain password check
      if (password !== user.password) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, level: user.level },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          level: user.level
        }
      });
    }
  );
});

// ------------------------
// Verify token
app.post("/api/verify-token", (req, res) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return res.json({ valid: false, message: "Missing token" });

  const token = authHeader.split(" ")[1];

  if (tokenBlacklist.has(token)) return res.json({ valid: false, message: "Token revoked" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, decoded });
  } catch (err) {
    return res.json({ valid: false, message: err.message });
  }
});

// ------------------------
// Logout
app.post("/api/logout", (req, res) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return res.json({ ok: true });

  const token = authHeader.split(" ")[1];
  blacklistToken(token);
  return res.json({ ok: true });
});

// ------------------------
// EVENTS ROUTES
app.get("/events", requireAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  db.query(
    `SELECT * FROM event ORDER BY event_date ASC, id ASC LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database query failed", details: err });
      res.json(results);
    }
  );
});

app.get("/events/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM event WHERE id = ? LIMIT 1", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    if (results.length === 0) return res.status(404).json({ error: "Event not found" });
    res.json(results[0]);
  });
});

app.post("/events", requireAuth, (req, res) => {
  const { title, description, kind, event_date, status, status_message,
    join_start, join_end, exposure_pre_start, exposure_pre_end,
    exposure_main_start, exposure_main_end } = req.body;

  const query = `
    INSERT INTO event
      (title, description, kind, event_date, status, status_message,
       join_start, join_end, exposure_pre_start, exposure_pre_end,
       exposure_main_start, exposure_main_end, createdat, updatedat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const params = [
    title || null, description || null, kind || null,
    normalizeDate(event_date), normalizeInt(status, 1), status_message || "",
    normalizeDate(join_start), normalizeDate(join_end),
    normalizeDate(exposure_pre_start), normalizeDate(exposure_pre_end),
    normalizeDate(exposure_main_start), normalizeDate(exposure_main_end)
  ];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to create event", details: err });
    res.json({ message: "Event created successfully!", id: results.insertId });
  });
});

app.put("/events/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, description, kind, event_date, status, status_message,
    join_start, join_end, exposure_pre_start, exposure_pre_end,
    exposure_main_start, exposure_main_end } = req.body;

  const query = `
    UPDATE event SET
      title=?, description=?, kind=?, event_date=?, status=?, status_message=?,
      join_start=?, join_end=?, exposure_pre_start=?, exposure_pre_end=?,
      exposure_main_start=?, exposure_main_end=?, updatedat=NOW()
    WHERE id=?
  `;

  const params = [
    title || null, description || null, kind || null,
    normalizeDate(event_date), normalizeInt(status, 1), status_message || "",
    normalizeDate(join_start), normalizeDate(join_end),
    normalizeDate(exposure_pre_start), normalizeDate(exposure_pre_end),
    normalizeDate(exposure_main_start), normalizeDate(exposure_main_end),
    id
  ];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Update failed", details: err });
    if (results.affectedRows === 0) return res.status(404).json({ error: "Event not found or no changes made" });
    res.json({ message: "Event updated successfully!" });
  });
});

// ------------------------
// ITEMS ROUTES
app.get("/items", requireAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  db.query(`SELECT * FROM item ORDER BY id ASC LIMIT ? OFFSET ?`, [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    res.json(results);
  });
});

app.get("/items/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM item WHERE id = ? LIMIT 1", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    if (results.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(results[0]);
  });
});

// ------------------------
// USERS ROUTES
app.get("/users", requireAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  db.query(`SELECT * FROM user ORDER BY id ASC LIMIT ? OFFSET ?`, [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    res.json(results);
  });
});

app.get("/users/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM user WHERE id = ? LIMIT 1", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed", details: err });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
});

// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

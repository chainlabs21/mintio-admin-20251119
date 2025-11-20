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
// ADMIN LOGIN ROUTE 
// ------------------------
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  db.query(
    "SELECT * FROM `user` WHERE username = ? LIMIT 1",
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "DB query failed", details: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];

      // DYNAMIC USERNAME CHECK
      if (username !== user.username) {
        return res.status(401).json({ message: "Invalid username" });
      }

      // DYNAMIC PASSWORD CHECK
      if (password !== user.pw) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // SUPERADMIN CHECK
      const isSuperAdmin = Number(user.level) === 90; 
      if (!isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: superadmin only" });
      }

      // ------------------------
      // Generate JWT token
      // ------------------------
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
          level: user.level,
        },
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
  const search = req.query.search || ""; // search by title
  const sortBy = req.query.sortBy === "date" ? "event_date" : "id"; // default sort by id
  const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC"; // default asc

  const sql = `
    SELECT * FROM event
    WHERE title LIKE ?
    ORDER BY ${sortBy} ${sortOrder}, id ASC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [`%${search}%`, limit, offset], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Database query failed", details: err });
    res.json(results);
  });
});

app.get("/events/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM event WHERE id = ? LIMIT 1", [id], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Database query failed", details: err });
    if (results.length === 0)
      return res.status(404).json({ error: "Event not found" });
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
    if (err)
      return res.status(500).json({ error: "Failed to create event", details: err });
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
    if (err)
      return res.status(500).json({ error: "Update failed", details: err });
    if (results.affectedRows === 0)
      return res.status(404).json({ error: "Event not found or no changes made" });
    res.json({ message: "Event updated successfully!" });
  });
});


// ------------------------
// ITEMS ROUTES
app.get("/items", requireAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const search = req.query.search || "";
  let sortBy = req.query.sortBy || "id";
  const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";

  // Validate sortBy to prevent SQL injection
  const allowedSort = ["id", "name", "status"];
  if (!allowedSort.includes(sortBy)) sortBy = "id";

  const sql = `
    SELECT * FROM item
    WHERE name LIKE ?
    ORDER BY ${sortBy} ${sortOrder}, id ASC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [`%${search}%`, limit, offset], (err, results) => {
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

// -----------------------------------------------------
// UPDATE ITEM STATUS (Ban / Unban / Deactivate / Activate)
// -----------------------------------------------------

app.put("/items/:id/status", requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status === undefined) {
    return res.status(400).json({ error: "Missing status value" });
  }

  // Auto-generate status_message based on status
  let statusMessage;
  if (status == 1) statusMessage = "Approved";
  else if (status == 2) statusMessage = "Banned / Archived / Hidden";
  else if (status == 0) statusMessage = "Deactivated / Hidden";
  else statusMessage = "Unknown";

  const sql = `
    UPDATE item
    SET status = ?, status_message = ?, updatedat = NOW()
    WHERE id = ?
  `;

  db.query(sql, [status, statusMessage, id], (err, result) => {
    if (err) {
      console.error("Item status update failed:", err);
      return res.status(500).json({ error: "Database update failed", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json({
      success: true,
      message: "Item status updated successfully",
      itemId: id,
      newStatus: status,
      newStatusMessage: statusMessage,
    });
  });
});

// ------------------------
// USERS ROUTES
// ------------------------
app.get("/users", requireAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const search = req.query.search ? `%${req.query.search}%` : null;
  const sortBy = req.query.sortBy || "id"; // id, username, status
  const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";

  // Validate sortBy field
  const validSortFields = ["id", "username", "status"];
  const orderField = validSortFields.includes(sortBy) ? sortBy : "id";

  let sql = "SELECT * FROM user";
  let params = [];

  if (search) {
    sql += " WHERE username LIKE ?";
    params.push(search);
  }

  sql += ` ORDER BY ${orderField} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.query(sql, params, (err, results) => {
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

// -----------------------------------------------------
// UPDATE USER STATUS (Ban / Unban / Deactivate / Activate)
// -----------------------------------------------------
app.put("/users/:id/status", requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status === undefined) {
    return res.status(400).json({ error: "Missing status value" });
  }

  let statusMessage = null;
  if (status == 1) statusMessage = "Active";
  else if (status == 2) statusMessage = "Suspended / Banned";
  else if (status == 0) statusMessage = "Deactivated";
  else statusMessage = "Unknown";

  const sql = `
    UPDATE user 
    SET status = ?, status_message = ?, updatedat = NOW() 
    WHERE id = ?
  `;

  db.query(sql, [status, statusMessage, id], (err, result) => {
    if (err) {
      console.error("User status update failed:", err);
      return res.status(500).json({ error: "Database update failed", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "User status updated successfully",
      userId: id,
      newStatus: status,
      newStatusMessage: statusMessage,
    });
  });
});


// ------------------------
// API KEYS ROUTE (sns_key) WITH SEARCH & SORT
// ------------------------
app.get(
  "/admin/list/custom/sns_key/:search/:sortBy/:sortOrder/:offset/:limit",
  requireAuth,
  (req, res) => {
    const { search, sortBy, sortOrder } = req.params;
    const offset = parseInt(req.params.offset) || 0;
    const limit = parseInt(req.params.limit) || 50;

    const searchTerm = search === "_" ? "" : `%${search}%`; // "_" means no search
    const orderField = ["id", "sns_id", "status", "createdat"].includes(sortBy) ? sortBy : "id";
    const orderDir = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Count total keys (filtered)
    const countQuery = searchTerm
      ? `SELECT COUNT(*) AS total FROM sns_key WHERE sns_id LIKE ? OR api_key LIKE ?`
      : `SELECT COUNT(*) AS total FROM sns_key`;

    const countParams = searchTerm ? [searchTerm, searchTerm] : [];

    db.query(countQuery, countParams, (err, countResults) => {
      if (err) return res.status(500).json({ error: "Count query failed", details: err });

      const total = countResults[0]?.total || 0;

      // Fetch paginated keys with optional search
      const selectQuery = searchTerm
        ? `SELECT id, sns_id, api_key, api_secret, access_token, action, status, status_message, createdat, updatedat
           FROM sns_key
           WHERE sns_id LIKE ? OR api_key LIKE ?
           ORDER BY ${orderField} ${orderDir}
           LIMIT ? OFFSET ?`
        : `SELECT id, sns_id, api_key, api_secret, access_token, action, status, status_message, createdat, updatedat
           FROM sns_key
           ORDER BY ${orderField} ${orderDir}
           LIMIT ? OFFSET ?`;

      const selectParams = searchTerm ? [searchTerm, searchTerm, limit, offset] : [limit, offset];

      db.query(selectQuery, selectParams, (err, results) => {
        if (err) return res.status(500).json({ error: "Query failed", details: err });

        res.json({
          list: results,
          total,
        });
      });
    });
  }
);

// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { isAdmin } = require("../middleware/auth");

const router = express.Router();

// GET all users (admin only)
router.get("/", isAdmin, (req, res) => {
  const { search, role, status, page = 1, limit = 10 } = req.query;
  let users = db.users.map(({ password, ...u }) => u);

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }
  if (role) users = users.filter((u) => u.role === role);
  if (status) users = users.filter((u) => u.status === status);

  const total = users.length;
  const start = (page - 1) * limit;
  const paginated = users.slice(start, start + Number(limit));

  res.json({ users: paginated, total, page: Number(page), totalPages: Math.ceil(total / limit) });
});

// GET stats
router.get("/stats", isAdmin, (req, res) => {
  const total = db.users.length;
  const active = db.users.filter((u) => u.status === "active").length;
  const inactive = db.users.filter((u) => u.status === "inactive").length;
  const banned = db.users.filter((u) => u.status === "banned").length;
  const admins = db.users.filter((u) => u.role === "admin").length;
  res.json({ total, active, inactive, banned, admins });
});

// GET single user
router.get("/:id", isAdmin, (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// CREATE user
router.post("/", isAdmin, async (req, res) => {
  const { name, email, password, role = "user", status = "active" } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });

  if (db.users.find((u) => u.email === email))
    return res.status(409).json({ error: "Email already exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name, email, password: hash, role, status, createdAt: new Date().toISOString() };
  db.users.push(user);
  const { password: _, ...safeUser } = user;
  res.status(201).json(safeUser);
});

// UPDATE user
router.put("/:id", isAdmin, async (req, res) => {
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const { name, email, role, status, password } = req.body;
  const user = { ...db.users[idx] };

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;
  if (password) user.password = await bcrypt.hash(password, 10);

  db.users[idx] = user;
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// DELETE user
router.delete("/:id", isAdmin, (req, res) => {
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  if (db.users[idx].role === "admin" && db.users.filter((u) => u.role === "admin").length === 1)
    return res.status(400).json({ error: "Cannot delete the last admin" });

  db.users.splice(idx, 1);
  res.json({ message: "User deleted" });
});

module.exports = router;

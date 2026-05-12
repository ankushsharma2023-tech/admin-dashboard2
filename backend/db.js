const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// In-memory store (replace with a real DB like MongoDB/PostgreSQL in production)
const db = {
  users: [],
};

const seed = async () => {
  const hash = await bcrypt.hash("admin123", 10);
  db.users = [
    {
      id: uuidv4(),
      name: "Admin User",
      email: "admin@example.com",
      password: hash,
      role: "admin",
      status: "active",
      createdAt: new Date("2024-01-01").toISOString(),
    },
    {
      id: uuidv4(),
      name: "Priya Sharma",
      email: "priya@example.com",
      password: await bcrypt.hash("user123", 10),
      role: "user",
      status: "active",
      createdAt: new Date("2024-02-15").toISOString(),
    },
    {
      id: uuidv4(),
      name: "Rahul Verma",
      email: "rahul@example.com",
      password: await bcrypt.hash("user123", 10),
      role: "user",
      status: "inactive",
      createdAt: new Date("2024-03-10").toISOString(),
    },
    {
      id: uuidv4(),
      name: "Anita Singh",
      email: "anita@example.com",
      password: await bcrypt.hash("user123", 10),
      role: "moderator",
      status: "active",
      createdAt: new Date("2024-04-05").toISOString(),
    },
    {
      id: uuidv4(),
      name: "Vikram Patel",
      email: "vikram@example.com",
      password: await bcrypt.hash("user123", 10),
      role: "user",
      status: "banned",
      createdAt: new Date("2024-05-20").toISOString(),
    },
  ];
};

seed();

module.exports = db;

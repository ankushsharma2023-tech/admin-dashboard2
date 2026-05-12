import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import styles from "./Dashboard.module.css";

const StatCard = ({ label, value, color, icon }) => (
  <div className={styles.statCard} style={{ "--accent-color": color }}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statValue}>{value ?? <span className="spinner" />}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/users/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className={styles.page + " fade-in"}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className={styles.sub}>Here's what's happening with your users today.</p>
        </div>
        <div className={styles.badge}>{new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
      </div>

      <div className={styles.grid}>
        <StatCard label="Total Users" value={stats?.total} color="var(--accent)" icon="◈" />
        <StatCard label="Active" value={stats?.active} color="var(--success)" icon="●" />
        <StatCard label="Inactive" value={stats?.inactive} color="var(--warn)" icon="○" />
        <StatCard label="Banned" value={stats?.banned} color="var(--danger)" icon="✕" />
        <StatCard label="Admins" value={stats?.admins} color="var(--accent2)" icon="★" />
      </div>

      <div className={styles.info}>
        <div className={styles.infoCard}>
          <h3>Quick Start</h3>
          <ul>
            <li>Go to <strong>Users</strong> to manage all users</li>
            <li>Create, edit, update roles, or ban users</li>
            <li>Search and filter by role or status</li>
            <li>Default admin: admin@example.com</li>
          </ul>
        </div>
        <div className={styles.infoCard}>
          <h3>Your Account</h3>
          <div className={styles.accountRows}>
            <div><span>Name</span><strong>{user?.name}</strong></div>
            <div><span>Email</span><strong>{user?.email}</strong></div>
            <div><span>Role</span><strong style={{ textTransform: "capitalize" }}>{user?.role}</strong></div>
            <div><span>Status</span><strong className={styles.statusActive}>{user?.status}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

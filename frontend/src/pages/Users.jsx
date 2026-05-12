import { useEffect, useState } from "react";
import api from "../api/axios";
import styles from "./Users.module.css";

const ROLES = ["user", "moderator", "admin"];
const STATUSES = ["active", "inactive", "banned"];

const statusColor = { active: "var(--success)", inactive: "var(--warn)", banned: "var(--danger)" };
const roleColor = { admin: "var(--accent2)", moderator: "var(--accent3)", user: "var(--muted)" };

function Modal({ title, onClose, children }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const emptyForm = { name: "", email: "", password: "", role: "user", status: "active" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "create" | "edit" | "delete"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8, ...(search && { search }), ...(filterRole && { role: filterRole }), ...(filterStatus && { status: filterStatus }) };
      const res = await api.get("/users", { params });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [search, filterRole, filterStatus]);
  useEffect(() => { load(); }, [page, search, filterRole, filterStatus]);

  const openCreate = () => { setForm(emptyForm); setError(""); setModal("create"); };
  const openEdit = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, password: "", role: u.role, status: u.status }); setError(""); setModal("edit"); };
  const openDelete = (u) => { setSelected(u); setModal("delete"); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (modal === "create") await api.post("/users", form);
      else await api.put(`/users/${selected.id}`, form);
      setModal(null); load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally { setSaving(false); }
  };

  const deleteUser = async () => {
    setSaving(true);
    try {
      await api.delete(`/users/${selected.id}`);
      setModal(null); load();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    } finally { setSaving(false); }
  };

  return (
    <div className={styles.page + " fade-in"}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.sub}>{total} total users</p>
        </div>
        <button className={styles.addBtn} onClick={openCreate}>+ New User</button>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.search} placeholder="🔍  Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={styles.select} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className={styles.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}><span className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>No users found</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.name[0]}</div>
                      <div>
                        <div className={styles.userName}>{u.name}</div>
                        <div className={styles.userEmail}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.badge} style={{ color: roleColor[u.role], background: roleColor[u.role] + "22" }}>{u.role}</span></td>
                  <td><span className={styles.badge} style={{ color: statusColor[u.status], background: statusColor[u.status] + "22" }}>{u.status}</span></td>
                  <td className={styles.date}>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(u)}>Edit</button>
                      <button className={styles.delBtn} onClick={() => openDelete(u)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={styles.pageBtn}>← Prev</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={styles.pageBtn}>Next →</button>
        </div>
      )}

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Create User" : "Edit User"} onClose={() => setModal(null)}>
          {error && <div className={styles.modalError}>{error}</div>}
          <form onSubmit={save} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required />
              </div>
              <div className={styles.field}>
                <label>{modal === "edit" ? "New Password (leave blank to keep)" : "Password"}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required={modal === "create"} />
              </div>
              <div className={styles.field}>
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" onClick={() => setModal(null)} className={styles.cancelBtn}>Cancel</button>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? <span className="spinner" /> : modal === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "delete" && (
        <Modal title="Delete User" onClose={() => setModal(null)}>
          <p className={styles.deleteMsg}>Are you sure you want to delete <strong>{selected?.name}</strong>? This cannot be undone.</p>
          <div className={styles.formActions}>
            <button onClick={() => setModal(null)} className={styles.cancelBtn}>Cancel</button>
            <button onClick={deleteUser} className={styles.delConfirmBtn} disabled={saving}>
              {saving ? <span className="spinner" /> : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";

const initialUsers = [
  { id: 1, name: "Ravi Kumar", email: "ravi@example.com", password: "ravi123", role: "user" },
  { id: 2, name: "Priya Singh", email: "priya@example.com", password: "priya123", role: "user" },
  { id: 3, name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin" },
];

const initialComplaints = [
  { id: 1, title: "Water supply issue", description: "No water supply since 2 days in Block A.", category: "Infrastructure", priority: "High", status: "Pending", createdAt: "2026-05-10", userId: 1 },
  { id: 2, title: "Broken street light", description: "Street light near gate 3 is not working.", category: "Electrical", priority: "Medium", status: "In Progress", createdAt: "2026-05-11", userId: 1 },
  { id: 3, title: "Garbage not collected", description: "Garbage has not been collected for 3 days.", category: "Sanitation", priority: "High", status: "Resolved", createdAt: "2026-05-08", userId: 2 },
  { id: 4, title: "WiFi connectivity problem", description: "Internet is dropping every 10 minutes.", category: "IT", priority: "Low", status: "Pending", createdAt: "2026-05-12", userId: 2 },
  { id: 5, title: "Parking area blocked", description: "Unauthorized vehicle blocking the parking bay.", category: "Security", priority: "Medium", status: "Pending", createdAt: "2026-05-13", userId: 1 },
];

const CATEGORIES = ["Infrastructure", "Electrical", "Sanitation", "IT", "Security", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Pending", "In Progress", "Resolved"];

const statusColor = (s) => s === "Resolved" ? "#15803d" : s === "In Progress" ? "#b45309" : "#1d4ed8";
const statusBg = (s) => s === "Resolved" ? "#dcfce7" : s === "In Progress" ? "#fef3c7" : "#dbeafe";
const priorityColor = (p) => p === "High" ? "#dc2626" : p === "Medium" ? "#d97706" : "#16a34a";
const priorityBg = (p) => p === "High" ? "#fee2e2" : p === "Medium" ? "#fef3c7" : "#dcfce7";

export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("login");
  const [authMode, setAuthMode] = useState("login");
  const [notification, setNotification] = useState(null);

  // Auth form state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", confirm: "" });

  // Complaint form
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [complaintForm, setComplaintForm] = useState({ title: "", description: "", category: "Infrastructure", priority: "Medium" });

  // Admin filter
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) return notify("Please fill all fields", "error");
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (!user) return notify("Invalid credentials", "error");
    setCurrentUser(user);
    setPage(user.role === "admin" ? "admin" : "dashboard");
    notify(`Welcome back, ${user.name}!`);
  };

  const handleRegister = () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirm)
      return notify("Please fill all fields", "error");
    if (registerForm.password !== registerForm.confirm)
      return notify("Passwords do not match", "error");
    if (users.find(u => u.email === registerForm.email))
      return notify("Email already registered", "error");
    const newUser = { id: users.length + 1, name: registerForm.name, email: registerForm.email, password: registerForm.password, role: "user" };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setPage("dashboard");
    notify(`Account created! Welcome, ${newUser.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("login");
    setLoginForm({ email: "", password: "" });
    notify("Logged out successfully");
  };

  const myComplaints = complaints.filter(c => c.userId === currentUser?.id);

  const handleAddComplaint = () => {
    if (!complaintForm.title || !complaintForm.description) return notify("Title and description required", "error");
    if (editingComplaint) {
      setComplaints(complaints.map(c => c.id === editingComplaint.id ? { ...c, ...complaintForm } : c));
      notify("Complaint updated!");
    } else {
      const newC = {
        id: complaints.length + 1,
        ...complaintForm,
        status: "Pending",
        createdAt: new Date().toISOString().split("T")[0],
        userId: currentUser.id,
      };
      setComplaints([...complaints, newC]);
      notify("Complaint submitted!");
    }
    setComplaintForm({ title: "", description: "", category: "Infrastructure", priority: "Medium" });
    setShowComplaintForm(false);
    setEditingComplaint(null);
  };

  const handleDeleteComplaint = (id) => {
    setComplaints(complaints.filter(c => c.id !== id));
    notify("Complaint deleted");
  };

  const handleEditComplaint = (c) => {
    setEditingComplaint(c);
    setComplaintForm({ title: c.title, description: c.description, category: c.category, priority: c.priority });
    setShowComplaintForm(true);
  };

  const handleAdminStatusUpdate = (id, status) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status } : c));
    notify("Status updated");
  };

  const handleAdminPriorityUpdate = (id, priority) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, priority } : c));
    notify("Priority updated");
  };

  const filteredAdmin = complaints.filter(c => {
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchCat = filterCategory === "All" || c.category === filterCategory;
    const matchSearch = !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  const s = {
    app: { fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "var(--color-background-tertiary)", color: "var(--color-text-primary)" },
    // Navbar
    nav: { background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 },
    navBrand: { display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 18 },
    navActions: { display: "flex", alignItems: "center", gap: 12 },
    navBtn: { padding: "6px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--color-text-primary)" },
    navBtnActive: { padding: "6px 14px", borderRadius: 8, border: "none", background: "#1d4ed8", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 500 },
    // Layout
    main: { maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" },
    // Auth
    authWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background-tertiary)" },
    authCard: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 420 },
    authHeader: { marginBottom: "1.5rem", textAlign: "center" },
    authTitle: { fontSize: 24, fontWeight: 600, margin: 0 },
    authSub: { fontSize: 14, color: "var(--color-text-secondary)", marginTop: 6 },
    tabRow: { display: "flex", background: "var(--color-background-secondary)", borderRadius: 10, padding: 4, marginBottom: "1.5rem" },
    tab: { flex: 1, padding: "8px 0", border: "none", background: "transparent", cursor: "pointer", borderRadius: 8, fontSize: 14, color: "var(--color-text-secondary)" },
    tabActive: { flex: 1, padding: "8px 0", border: "none", background: "var(--color-background-primary)", cursor: "pointer", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
    // Form elements
    label: { display: "block", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 },
    input: { width: "100%", padding: "9px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, boxSizing: "border-box", marginBottom: 14 },
    select: { width: "100%", padding: "9px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, boxSizing: "border-box", marginBottom: 14 },
    textarea: { width: "100%", padding: "9px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, boxSizing: "border-box", marginBottom: 14, resize: "vertical", minHeight: 80 },
    btnPrimary: { width: "100%", padding: "10px 0", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer" },
    btnSecondary: { padding: "8px 16px", background: "transparent", color: "var(--color-text-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, cursor: "pointer" },
    btnDanger: { padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" },
    btnSuccess: { padding: "6px 12px", background: "#dcfce7", color: "#15803d", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" },
    btnEdit: { padding: "6px 12px", background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" },
    // Cards
    card: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1.25rem" },
    statCard: { background: "var(--color-background-secondary)", borderRadius: 10, padding: "1rem 1.25rem", textAlign: "center" },
    statNum: { fontSize: 28, fontWeight: 600, margin: 0 },
    statLabel: { fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" },
    // Table
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { padding: "10px 12px", textAlign: "left", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" },
    td: { padding: "10px 12px", borderBottom: "0.5px solid var(--color-border-tertiary)", verticalAlign: "middle" },
    // Badge
    badge: (bg, color) => ({ background: bg, color: color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, display: "inline-block" }),
    // Notification
    notif: (type) => ({ position: "fixed", top: 20, right: 20, padding: "12px 20px", borderRadius: 10, background: type === "error" ? "#fee2e2" : "#dcfce7", color: type === "error" ? "#dc2626" : "#15803d", fontSize: 14, fontWeight: 500, zIndex: 9999, border: `0.5px solid ${type === "error" ? "#fca5a5" : "#86efac"}` }),
    // Section header
    sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" },
    sectionTitle: { fontSize: 18, fontWeight: 600, margin: 0 },
    // Filter bar
    filterBar: { display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" },
    filterInput: { flex: 1, minWidth: 160, padding: "8px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 13 },
    filterSelect: { padding: "8px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 13 },
  };

  // ---- AUTH PAGE ----
  if (!currentUser) {
    return (
      <div style={s.authWrap}>
        {notification && <div style={s.notif(notification.type)}>{notification.msg}</div>}
        <div style={s.authCard}>
          <div style={s.authHeader}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
            <h1 style={s.authTitle}>Smart CMS</h1>
            <p style={s.authSub}>Complaint Management System</p>
          </div>
          <div style={s.tabRow}>
            <button style={authMode === "login" ? s.tabActive : s.tab} onClick={() => setAuthMode("login")}>Login</button>
            <button style={authMode === "register" ? s.tabActive : s.tab} onClick={() => setAuthMode("register")}>Register</button>
          </div>
          {authMode === "login" ? (
            <>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="you@example.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" placeholder="Enter password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
              <button style={s.btnPrimary} onClick={handleLogin}>Login</button>
              <div style={{ marginTop: 16, background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--color-text-secondary)" }}>
                <strong style={{ color: "var(--color-text-primary)" }}>Demo accounts:</strong><br />
                User: ravi@example.com / ravi123<br />
                Admin: admin@example.com / admin123
              </div>
            </>
          ) : (
            <>
              <label style={s.label}>Full Name</label>
              <input style={s.input} placeholder="Your full name" value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} />
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="you@example.com" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" placeholder="Create password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
              <label style={s.label}>Confirm Password</label>
              <input style={s.input} type="password" placeholder="Confirm password" value={registerForm.confirm} onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })} />
              <button style={s.btnPrimary} onClick={handleRegister}>Create Account</button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- NAVBAR ----
  const Navbar = () => (
    <nav style={s.nav}>
      <div style={s.navBrand}>
        <span>🛡️</span>
        <span>Smart CMS</span>
        {currentUser.role === "admin" && (
          <span style={{ ...s.badge("#fef3c7", "#b45309"), fontSize: 10 }}>Admin</span>
        )}
      </div>
      <div style={s.navActions}>
        {currentUser.role === "user" && (
          <>
            <button style={page === "dashboard" ? s.navBtnActive : s.navBtn} onClick={() => setPage("dashboard")}>My Complaints</button>
            <button style={page === "track" ? s.navBtnActive : s.navBtn} onClick={() => setPage("track")}>Track Status</button>
          </>
        )}
        {currentUser.role === "admin" && (
          <>
            <button style={page === "admin" ? s.navBtnActive : s.navBtn} onClick={() => setPage("admin")}>All Complaints</button>
            <button style={page === "reports" ? s.navBtnActive : s.navBtn} onClick={() => setPage("reports")}>Reports</button>
          </>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>
            {currentUser.name.charAt(0)}
          </div>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{currentUser.name.split(" ")[0]}</span>
          <button style={s.navBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );

  // ---- COMPLAINT FORM MODAL ----
  const ComplaintForm = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 500, border: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{editingComplaint ? "Edit Complaint" : "New Complaint"}</h2>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-secondary)" }} onClick={() => { setShowComplaintForm(false); setEditingComplaint(null); }}>×</button>
        </div>
        <label style={s.label}>Title</label>
        <input style={s.input} placeholder="Brief title of your complaint" value={complaintForm.title} onChange={e => setComplaintForm({ ...complaintForm, title: e.target.value })} />
        <label style={s.label}>Description</label>
        <textarea style={s.textarea} placeholder="Describe your complaint in detail..." value={complaintForm.description} onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={s.label}>Category</label>
            <select style={s.select} value={complaintForm.category} onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Priority</label>
            <select style={s.select} value={complaintForm.priority} onChange={e => setComplaintForm({ ...complaintForm, priority: e.target.value })}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => { setShowComplaintForm(false); setEditingComplaint(null); }}>Cancel</button>
          <button style={{ ...s.btnPrimary, flex: 2 }} onClick={handleAddComplaint}>{editingComplaint ? "Update" : "Submit Complaint"}</button>
        </div>
      </div>
    </div>
  );

  // ---- USER DASHBOARD ----
  const UserDashboard = () => (
    <div style={s.main}>
      <div style={s.statsGrid}>
        {[
          { label: "Total Submitted", value: myComplaints.length, color: "#1d4ed8" },
          { label: "Pending", value: myComplaints.filter(c => c.status === "Pending").length, color: "#d97706" },
          { label: "In Progress", value: myComplaints.filter(c => c.status === "In Progress").length, color: "#7c3aed" },
          { label: "Resolved", value: myComplaints.filter(c => c.status === "Resolved").length, color: "#15803d" },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <p style={{ ...s.statNum, color: stat.color }}>{stat.value}</p>
            <p style={s.statLabel}>{stat.label}</p>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>My Complaints</h2>
          <button style={s.navBtnActive} onClick={() => { setComplaintForm({ title: "", description: "", category: "Infrastructure", priority: "Medium" }); setShowComplaintForm(true); }}>
            + New Complaint
          </button>
        </div>
        {myComplaints.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p>No complaints submitted yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["ID", "Title", "Category", "Priority", "Status", "Date", "Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myComplaints.map(c => (
                  <tr key={c.id}>
                    <td style={s.td}><span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>#{c.id}</span></td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{c.description.substring(0, 50)}...</div>
                    </td>
                    <td style={s.td}><span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{c.category}</span></td>
                    <td style={s.td}><span style={s.badge(priorityBg(c.priority), priorityColor(c.priority))}>{c.priority}</span></td>
                    <td style={s.td}><span style={s.badge(statusBg(c.status), statusColor(c.status))}>{c.status}</span></td>
                    <td style={s.td}><span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{c.createdAt}</span></td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {c.status === "Pending" && (
                          <button style={s.btnEdit} onClick={() => handleEditComplaint(c)}>Edit</button>
                        )}
                        <button style={s.btnDanger} onClick={() => handleDeleteComplaint(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // ---- TRACKING PAGE ----
  const TrackingPage = () => (
    <div style={s.main}>
      <h2 style={{ ...s.sectionTitle, marginBottom: "1.5rem" }}>Track Complaint Status</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {myComplaints.map(c => (
          <div key={c.id} style={{ ...s.card, borderLeft: `4px solid ${statusColor(c.status)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>#{c.id}</span>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{c.title}</h3>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-secondary)" }}>{c.description}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={s.badge(priorityBg(c.priority), priorityColor(c.priority))}>{c.priority}</span>
                  <span style={{ ...s.badge("#f3f4f6", "#6b7280"), background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }}>{c.category}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={s.badge(statusBg(c.status), statusColor(c.status))}>{c.status}</span>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 8 }}>{c.createdAt}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 0, marginTop: 16, borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 14 }}>
              {STATUSES.map((st, i) => (
                <div key={st} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, background: STATUSES.indexOf(c.status) >= i ? statusBg(c.status) : "var(--color-background-secondary)", color: STATUSES.indexOf(c.status) >= i ? statusColor(c.status) : "var(--color-text-secondary)", border: STATUSES.indexOf(c.status) >= i ? `1.5px solid ${statusColor(c.status)}` : "1.5px solid var(--color-border-secondary)" }}>
                      {STATUSES.indexOf(c.status) >= i ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 10, color: STATUSES.indexOf(c.status) >= i ? statusColor(c.status) : "var(--color-text-secondary)", fontWeight: STATUSES.indexOf(c.status) >= i ? 500 : 400 }}>{st}</div>
                  </div>
                  {i < 2 && <div style={{ height: 2, flex: 1, background: STATUSES.indexOf(c.status) > i ? statusColor(c.status) : "var(--color-border-tertiary)", margin: "0 4px", marginBottom: 20 }} />}
                </div>
              ))}
            </div>
          </div>
        ))}
        {myComplaints.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-secondary)" }}>
            <div style={{ fontSize: 40 }}>📭</div>
            <p>No complaints to track.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ---- ADMIN PAGE ----
  const AdminPage = () => (
    <div style={s.main}>
      <div style={s.statsGrid}>
        {[
          { label: "Total", value: stats.total, color: "#1d4ed8" },
          { label: "Pending", value: stats.pending, color: "#d97706" },
          { label: "In Progress", value: stats.inProgress, color: "#7c3aed" },
          { label: "Resolved", value: stats.resolved, color: "#15803d" },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <p style={{ ...s.statNum, color: st.color }}>{st.value}</p>
            <p style={s.statLabel}>{st.label}</p>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>All Complaints</h2>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{filteredAdmin.length} shown</span>
        </div>
        <div style={s.filterBar}>
          <input style={s.filterInput} placeholder="Search by title or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <select style={s.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option>All</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={s.filterSelect} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option>All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                {["ID", "Title & Description", "Category", "Priority", "Status", "User", "Date", "Actions"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAdmin.map(c => {
                const user = users.find(u => u.id === c.userId);
                return (
                  <tr key={c.id}>
                    <td style={s.td}><span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>#{c.id}</span></td>
                    <td style={{ ...s.td, maxWidth: 220 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{c.description.substring(0, 60)}...</div>
                    </td>
                    <td style={s.td}><span style={{ fontSize: 12 }}>{c.category}</span></td>
                    <td style={s.td}>
                      <select value={c.priority} onChange={e => handleAdminPriorityUpdate(c.id, e.target.value)} style={{ padding: "4px 8px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, fontSize: 12, background: priorityBg(c.priority), color: priorityColor(c.priority), fontWeight: 500, cursor: "pointer" }}>
                        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </td>
                    <td style={s.td}>
                      <select value={c.status} onChange={e => handleAdminStatusUpdate(c.id, e.target.value)} style={{ padding: "4px 8px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, fontSize: 12, background: statusBg(c.status), color: statusColor(c.status), fontWeight: 500, cursor: "pointer" }}>
                        {STATUSES.map(st => <option key={st}>{st}</option>)}
                      </select>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#1d4ed8" }}>
                          {user?.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: 12 }}>{user?.name.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td style={s.td}><span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{c.createdAt}</span></td>
                    <td style={s.td}>
                      <button style={s.btnDanger} onClick={() => handleDeleteComplaint(c.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAdmin.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)", fontSize: 14 }}>
            No complaints match the current filters.
          </div>
        )}
      </div>
    </div>
  );

  // ---- REPORTS PAGE ----
  const ReportsPage = () => {
    const byCat = CATEGORIES.map(cat => ({ cat, count: complaints.filter(c => c.category === cat).length })).filter(x => x.count > 0);
    const maxCat = Math.max(...byCat.map(x => x.count));
    const byStatus = STATUSES.map(st => ({ st, count: complaints.filter(c => c.status === st).length }));
    const resolvedPct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    return (
      <div style={s.main}>
        <h2 style={{ ...s.sectionTitle, marginBottom: "1.5rem" }}>Reports & Analytics</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={s.card}>
            <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 600 }}>Complaints by Category</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {byCat.sort((a, b) => b.count - a.count).map(({ cat, count }) => (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>{cat}</span>
                    <span style={{ fontWeight: 500 }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "var(--color-background-secondary)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(count / maxCat) * 100}%`, background: "#1d4ed8", borderRadius: 4, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 600 }}>Status Distribution</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {byStatus.map(({ st, count }) => (
                <div key={st} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor(st), flexShrink: 0 }} />
                  <span style={{ fontSize: 13, flex: 1 }}>{st}</span>
                  <span style={s.badge(statusBg(st), statusColor(st))}>{count}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", width: 40, textAlign: "right" }}>
                    {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Resolution rate</span>
                <span style={{ fontWeight: 600, color: "#15803d" }}>{resolvedPct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: "var(--color-background-secondary)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${resolvedPct}%`, background: "#15803d", borderRadius: 5, transition: "width 0.5s ease" }} />
              </div>
            </div>
          </div>
        </div>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 600 }}>Priority Breakdown</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {PRIORITIES.map(p => {
              const count = complaints.filter(c => c.priority === p).length;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={p} style={{ ...s.statCard, borderLeft: `3px solid ${priorityColor(p)}` }}>
                  <p style={{ ...s.statNum, fontSize: 22, color: priorityColor(p) }}>{count}</p>
                  <p style={s.statLabel}>{p} Priority</p>
                  <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "4px 0 0" }}>{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={s.app}>
      {notification && <div style={s.notif(notification.type)}>{notification.msg}</div>}
      <Navbar />
      {showComplaintForm && <ComplaintForm />}
      {page === "dashboard" && <UserDashboard />}
      {page === "track" && <TrackingPage />}
      {page === "admin" && <AdminPage />}
      {page === "reports" && <ReportsPage />}
    </div>
  );
}

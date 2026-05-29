import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../Layout";
const API = import.meta.env.VITE_API_URL;
const U_API = `${API}/Utilisateur/utilisateur.php`;
const D_API = `${API}/Demande/demande_admin.php`;
const C_API = `${API}/Competitions/Competitions.php`;

function Sidebar() {
  const loc = useLocation();
  const is = (p) => loc.pathname === p ? "sidebar-link active" : "sidebar-link";
  return (
    <aside className="admin-sidebar">
      <span className="sidebar-sep">Super Admin</span>
      <Link to="/superadmin"              className={is("/superadmin")}>             <span>📊</span> Vue d'ensemble</Link>
      <Link to="/superadmin/demandes"     className={is("/superadmin/demandes")}>    <span>📩</span> Demandes</Link>
      <Link to="/superadmin/utilisateurs" className={is("/superadmin/utilisateurs")}><span>👤</span> Utilisateurs</Link>
      <Link to="/superadmin/competitions" className={is("/superadmin/competitions")}><span>🏆</span> Compétitions</Link>
    </aside>
  );
}

function Utilisateurs() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${U_API}?action=get_users`, { credentials: "include" })
      .then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch(`${U_API}?action=delete`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_utilisateur: id }) });
    setUsers(u => u.filter(x => x.id_utilisateur !== id));
  };

  if (loading) return <div className="loading"><div className="spinner" /> Chargement…</div>;

  return (
    <div className="section-block">
      <div className="section-block-header">
        <h2 className="section-title">Utilisateurs</h2>
        <span className="badge badge-neutral">{users.length}</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Pseudo</th><th>Email</th><th>Rôle</th><th>Statut</th><th></th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id_utilisateur}>
                <td style={{ fontWeight: 600 }}>{u.pseudo}</td>
                <td style={{ color: "var(--t2)" }}>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role === "super_admin" ? "accent" : u.role === "admin_equipe" ? "green" : "neutral"}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${u.statut === "actif" ? "green" : u.statut === "banni" ? "red" : "amber"}`}>
                    {u.statut}
                  </span>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(u.id_utilisateur)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Demandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState(null);

  const load = () => {
    fetch(`${D_API}?action=get_all`, { credentials: "include" })
      .then(r => r.json()).then(d => setDemandes(d.demandes || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const accept = async (dem) => {
    const res = await fetch(`${D_API}?action=accept`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_demande: dem.id_demande, id_utilisateur: dem.id_utilisateur }) });
    const d = await res.json();
    setMsg({ type: d.success ? "success" : "error", text: d.message });
    if (d.success) load();
  };

  const refuse = async (dem) => {
    const raison = prompt("Raison du refus :");
    if (raison === null) return;
    const res = await fetch(`${D_API}?action=refuse`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_demande: dem.id_demande, raisons_refus: [raison] }) });
    const d = await res.json();
    setMsg({ type: d.success ? "success" : "error", text: d.message });
    if (d.success) load();
  };

  if (loading) return <div className="loading"><div className="spinner" /> Chargement…</div>;

  const pending = demandes.filter(d => d.statut === "en_attente");

  return (
    <div className="section-block">
      <div className="section-block-header">
        <h2 className="section-title">Demandes admin d'équipe</h2>
        {pending.length > 0 && <span className="badge badge-amber">{pending.length} en attente</span>}
      </div>
      {msg && <p className={`msg msg-${msg.type}`} style={{ marginBottom: 14 }}>{msg.text}</p>}
      {demandes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-text">Aucune demande</p>
        </div>
      ) : (
        demandes.map(dem => (
          <div key={dem.id_demande} className="row-item">
            <div className="row-info">
              <p className="row-name">{dem.pseudo} <span style={{ color: "var(--t2)", fontWeight: 400 }}>→ {dem.nom_equipe}</span></p>
              <p className="row-sub">{dem.description?.slice(0, 80)}{dem.description?.length > 80 ? "…" : ""}</p>
            </div>
            <div className="row-actions">
              <span className={`badge badge-${dem.statut === "en_attente" ? "amber" : dem.statut === "accepte" ? "green" : "red"}`}>
                {dem.statut}
              </span>
              {dem.statut === "en_attente" && (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => accept(dem)}>Accepter</button>
                  <button className="btn btn-danger btn-sm"  onClick={() => refuse(dem)}>Refuser</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Competitions() {
  const [compets, setCompets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({});
  const [msg, setMsg]           = useState(null);

  const load = () => {
    fetch(`${C_API}?action=get_all`)
      .then(r => r.json()).then(d => setCompets(d.competitions || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const openAdd  = () => { setEditing(null); setForm({}); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setShowForm(true); };
  const close    = () => { setShowForm(false); setEditing(null); setForm({}); };

  const save = async () => {
    const action = editing ? "update" : "create";
    const body   = editing ? { ...form, id: editing.id } : form;
    const res = await fetch(`${C_API}?action=${action}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json();
    setMsg({ type: d.success ? "success" : "error", text: d.message });
    if (d.success) { close(); load(); }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer cette compétition ?")) return;
    const res = await fetch(`${C_API}?action=delete`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const d = await res.json();
    if (d.success) load();
  };

  if (loading) return <div className="loading"><div className="spinner" /> Chargement…</div>;

  const fields = [
    ["nom",         "Nom de la compétition", "text"],
    ["date",        "Date",                  "date"],
    ["jeu",         "Jeu",                   "text"],
    ["lieu",        "Lieu",                  "text"],
    ["format",      "Format",                "text"],
    ["prize",       "Prize pool",            "text"],
    ["description", "Description",           "textarea"],
  ];

  return (
    <div className="section-block">
      <div className="section-block-header">
        <h2 className="section-title">Compétitions</h2>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Ajouter</button>
      </div>
      {msg && <p className={`msg msg-${msg.type}`} style={{ marginBottom: 14 }}>{msg.text}</p>}
      {compets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p className="empty-text">Aucune compétition</p>
        </div>
      ) : (
        compets.map(c => (
          <div key={c.id} className="row-item">
            <div className="row-info">
              <p className="row-name">{c.nom}</p>
              <p className="row-sub">{c.date}{c.jeu ? ` · ${c.jeu}` : ""}{c.lieu ? ` · ${c.lieu}` : ""}</p>
            </div>
            <div className="row-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Modifier</button>
              <button className="btn btn-danger btn-sm"    onClick={() => remove(c.id)}>Supprimer</button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <p className="modal-title">{editing ? "Modifier" : "Ajouter"} une compétition</p>
              <button className="modal-close" onClick={close}>×</button>
            </div>
            <div className="input-group">
              {fields.map(([k, lbl, type]) => (
                <div key={k} className="field">
                  <label>{lbl}</label>
                  {type === "textarea" ? (
                    <textarea className="input" value={form[k] || ""} onChange={set(k)} />
                  ) : (
                    <input className="input" type={type} value={form[k] || ""} onChange={set(k)} />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={close}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={save}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Overview() {
  return (
    <div>
      <h2 className="section-title" style={{ marginBottom: 20 }}>Vue d'ensemble</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14 }}>
        {[
          { label: "Gérer les demandes",     icon: "📩", to: "/superadmin/demandes" },
          { label: "Gérer les utilisateurs", icon: "👤", to: "/superadmin/utilisateurs" },
          { label: "Gérer les compétitions", icon: "🏆", to: "/superadmin/competitions" },
        ].map(item => (
          <Link key={item.to} to={item.to} className="hub-card">
            <div className="hub-card-icon">{item.icon}</div>
            <p className="hub-card-title">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdmin({ user, onLogout }) {
  const navigate = useNavigate();
  useEffect(() => { if (user && user.role !== "super_admin") navigate("/salon"); }, [user]);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-content">
          <Routes>
            <Route path="/"             element={<Overview />} />
            <Route path="/demandes"     element={<Demandes />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/competitions" element={<Competitions />} />
          </Routes>
        </div>
      </div>
    </Layout>
  );
}
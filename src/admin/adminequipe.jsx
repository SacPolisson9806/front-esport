import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../Layout";

const API = import.meta.env.VITE_API_URL;

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar() {
  const loc = useLocation();
  const is = (p) => loc.pathname === p ? "sidebar-link active" : "sidebar-link";
  return (
    <aside className="admin-sidebar">
      <span className="sidebar-sep">Mon équipe</span>
      <Link to="/admin/equipe"          className={is("/admin/equipe")}>         <span>ℹ️</span> Informations</Link>
      <Link to="/admin/equipe/joueurs"  className={is("/admin/equipe/joueurs")}> <span>👥</span> Joueurs</Link>
      <Link to="/admin/equipe/staff"    className={is("/admin/equipe/staff")}>   <span>🎯</span> Staff & Managers</Link>
      <Link to="/admin/equipe/jeux"     className={is("/admin/equipe/jeux")}>    <span>🎮</span> Jeux</Link>
      <Link to="/admin/equipe/palmares" className={is("/admin/equipe/palmares")}><span>🏅</span> Palmarès</Link>
      <Link to="/admin/equipe/sponsors" className={is("/admin/equipe/sponsors")}><span>🤝</span> Sponsors</Link>
    </aside>
  );
}

// ─── Champs réutilisables ─────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
  </div>
);

// ─── AdminInfos — tous les champs de la table `equipe` ───────────────────────
function AdminInfos({ equipe, onSave }) {
  const [form,   setForm]   = useState(equipe || {});
  const [msg,    setMsg]    = useState(null);
  const [saving, setSaving] = useState(false);

  // Sync si equipe change (rechargement)
  useEffect(() => { setForm(equipe || {}); }, [equipe]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true); setMsg(null);
    const ok = await onSave(form);
    setMsg({ type: ok ? "success" : "error", text: ok ? "Enregistré !" : "Erreur lors de la sauvegarde" });
    setSaving(false);
  };

  // Sections du formulaire — reflète exactement la table `equipe`
  const sections = [
    {
      title: "🏷️ Identité",
      fields: [
        { key: "nom",                label: "Nom de l'équipe",    type: "text" },
        { key: "tag",                label: "Tag / Acronyme",      type: "text" },
        { key: "date_creation",      label: "Date de création",    type: "date" },
        { key: "description_courte", label: "Description courte",  type: "text" },
        { key: "description_longue", label: "Description longue",  type: "textarea" },
        { key: "pays",               label: "Pays",                type: "text" },
        { key: "ville",              label: "Ville",               type: "text" },
      ]
    },
    {
      title: "📬 Contact",
      fields: [
        { key: "site_web",           label: "Site web",            type: "text" },
        { key: "email_general",      label: "Email général",       type: "email" },
        { key: "email_recrutement",  label: "Email recrutement",   type: "email" },
        { key: "telephone",          label: "Téléphone",           type: "text" },
      ]
    },
    {
      title: "🖼️ Médias",
      fields: [
        { key: "logo",               label: "Logo (URL)",          type: "text" },
        { key: "design_card",        label: "Design card (URL)",   type: "text" },
      ]
    },
    {
      title: "🔗 Réseaux sociaux",
      fields: [
        { key: "twitter",   label: "Twitter / X",  type: "text" },
        { key: "instagram", label: "Instagram",     type: "text" },
        { key: "twitch",    label: "Twitch",        type: "text" },
        { key: "youtube",   label: "YouTube",       type: "text" },
        { key: "tiktok",    label: "TikTok",        type: "text" },
        { key: "facebook",  label: "Facebook",      type: "text" },
      ]
    },
  ];

  return (
    <div className="section-block">
      <div className="section-block-header">
        <h2 className="section-title">Informations de l'équipe</h2>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {msg && <p className={`msg msg-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</p>}

      {/* Aperçu logo */}
      {form.logo && (
        <div style={{ marginBottom: 16 }}>
          <img src={form.logo} alt="logo"
            style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: "2px solid #e5e7eb" }}
            onError={e => e.target.style.display = "none"}
          />
        </div>
      )}

      {sections.map(section => (
        <div key={section.title}>
          {/* Séparateur de section */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "1.25rem 0 0.75rem" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6366f1", textTransform: "uppercase", margin: 0, whiteSpace: "nowrap" }}>
              {section.title}
            </p>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          <div className="input-group">
            {section.fields.map(({ key, label, type }) => (
              <Field key={key} label={label}>
                {type === "textarea" ? (
                  <textarea className="input" value={form[key] || ""} onChange={set(key)} rows={3} />
                ) : (
                  <input className="input" type={type} value={form[key] || ""} onChange={set(key)} />
                )}
              </Field>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : "✅ Enregistrer"}
        </button>
      </div>
    </div>
  );
}

// ─── CrudSection — générique pour joueurs, staff, jeux, palmarès, sponsors ───
function CrudSection({ title, items, fields, onAdd, onEdit, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({});
  const [msg,      setMsg]      = useState(null);

  const openAdd  = () => { setEditing(null); setForm({}); setShowForm(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setShowForm(true); };
  const close    = () => { setShowForm(false); setEditing(null); setForm({}); };

  const submit = async () => {
    const ok = editing ? await onEdit(editing.id, form) : await onAdd(form);
    if (ok) { setMsg({ type: "success", text: editing ? "Modifié !" : "Ajouté !" }); close(); }
    else      setMsg({ type: "error",   text: "Une erreur s'est produite" });
  };

  return (
    <div className="section-block">
      <div className="section-block-header">
        <h2 className="section-title">{title}</h2>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Ajouter</button>
      </div>

      {msg && <p className={`msg msg-${msg.type}`} style={{ marginBottom: 14 }}>{msg.text}</p>}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-text">Aucun élément</p>
        </div>
      ) : (
        items.map(item => (
          <div key={item.id} className="row-item">
            <div className="row-info">
              <p className="row-name">{item.nom || item.pseudo || item.tournoi || "—"}</p>
              <p className="row-sub">{item.role || item.rang || item.resultat || item.type || ""}</p>
            </div>
            <div className="row-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>Modifier</button>
              <button className="btn btn-danger btn-sm"    onClick={() => onDelete(item.id)}>Supprimer</button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <p className="modal-title">{editing ? "Modifier" : "Ajouter"} — {title}</p>
              <button className="modal-close" onClick={close}>×</button>
            </div>
            <div className="input-group">
              {fields.map(f => (
                <div key={f.name} className="field">
                  <label>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea className="input" placeholder={f.placeholder || ""}
                      value={form[f.name] || ""}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
                  ) : (
                    <input className="input" type={f.type || "text"} placeholder={f.placeholder || ""}
                      value={form[f.name] || ""}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={close}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Définitions des champs par type — alignés sur les tables SQL ─────────────
const FIELDS_JOUEUR = [
  { name: "pseudo",          label: "Pseudo" },
  { name: "nom",             label: "Nom réel" },
  { name: "age",             label: "Âge",             type: "number" },
  { name: "nationalite",     label: "Nationalité" },
  { name: "jeu",             label: "Jeu principal" },
  { name: "role",            label: "Rôle en jeu" },
  { name: "experience",      label: "Expérience",       type: "textarea" },
  { name: "contrat",         label: "Contrat" },
  { name: "duree_contrat",   label: "Durée du contrat" },
  { name: "date_arrivee",    label: "Date d'arrivée",   type: "date" },
  { name: "anciennes_equipes", label: "Anciennes équipes" },
  { name: "photo",           label: "Photo (URL)" },
  { name: "twitter",         label: "Twitter / X" },
  { name: "instagram",       label: "Instagram" },
  { name: "twitch",          label: "Twitch" },
  { name: "youtube",         label: "YouTube" },
  { name: "tiktok",          label: "TikTok" },
  { name: "facebook",        label: "Facebook" },
];

const FIELDS_MANAGER = [
  { name: "nom",        label: "Nom" },
  { name: "role",       label: "Rôle" },
  { name: "age",        label: "Âge",         type: "number" },
  { name: "jeux_geres", label: "Jeux gérés" },
  { name: "photo",      label: "Photo (URL)" },
  { name: "twitter",    label: "Twitter / X" },
  { name: "instagram",  label: "Instagram" },
  { name: "twitch",     label: "Twitch" },
  { name: "youtube",    label: "YouTube" },
  { name: "tiktok",     label: "TikTok" },
  { name: "facebook",   label: "Facebook" },
];

const FIELDS_STAFF = [
  { name: "nom",        label: "Nom" },
  { name: "role",       label: "Rôle" },
  { name: "jeux_geres", label: "Jeux gérés" },
  { name: "photo",      label: "Photo (URL)" },
  { name: "twitter",    label: "Twitter / X" },
  { name: "instagram",  label: "Instagram" },
  { name: "twitch",     label: "Twitch" },
  { name: "youtube",    label: "YouTube" },
  { name: "tiktok",     label: "TikTok" },
  { name: "facebook",   label: "Facebook" },
];

const FIELDS_JEU = [
  { name: "nom",       label: "Nom du jeu" },
  { name: "rang",      label: "Rang moyen" },
  { name: "division",  label: "Division" },
  { name: "objectifs", label: "Objectifs", type: "textarea" },
];

const FIELDS_PALMARES = [
  { name: "tournoi",    label: "Tournoi" },
  { name: "date",       label: "Date",       type: "date" },
  { name: "resultat",   label: "Résultat" },
  { name: "recompense", label: "Récompense" },
];

const FIELDS_SPONSOR = [
  { name: "nom",       label: "Nom" },
  { name: "type",      label: "Type de partenariat" },
  { name: "duree",     label: "Durée" },
  { name: "lien",      label: "Site web" },
  { name: "logo",      label: "Logo (URL)" },
  { name: "twitter",   label: "Twitter / X" },
  { name: "instagram", label: "Instagram" },
  { name: "youtube",   label: "YouTube" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminEquipe({ user, onLogout }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    fetch(`${API}/Equipeadmin/adminequipe.php?action=get_my_team`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) navigate("/salon");
        else if (!d.equipe) navigate("/admin/equipe/creer");
        else setData(d);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <div className="loading"><div className="spinner" /> Chargement…</div>;
  if (!data)   return null;

  const id = data.equipe?.id_equipe;

  // Helpers CRUD génériques
  const crud = (type) => ({
    onAdd: (body) =>
      fetch(`${API}/Equipeadmin/adminequipe.php?action=element_add&type=${type}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, id_equipe: id }),
      }).then(r => r.json()).then(d => { if (d.success) load(); return d.success; }),

    onEdit: (eid, body) =>
      fetch(`${API}/Equipeadmin/adminequipe.php?action=element_update&type=${type}&id=${eid}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json()).then(d => { if (d.success) load(); return d.success; }),

    onDelete: (eid) =>
      fetch(`${API}/Equipeadmin/adminequipe.php?action=element_delete&type=${type}&id=${eid}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json()).then(d => { if (d.success) load(); return d.success; }),
  });

  const saveInfos = (form) =>
    fetch(`${API}/Equipeadmin/adminequipe.php?action=update_infos`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id_equipe: id }),
    }).then(r => r.json()).then(d => d.success);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-content">
          <Routes>
            <Route path="/"
              element={<AdminInfos equipe={data.equipe} onSave={saveInfos} />}
            />
            <Route path="/joueurs"
              element={
                <CrudSection
                  title="Joueurs"
                  items={data.joueurs || []}
                  fields={FIELDS_JOUEUR}
                  {...crud("joueur")}
                />
              }
            />
            <Route path="/staff"
              element={
                <>
                  <CrudSection
                    title="Managers"
                    items={data.managers || []}
                    fields={FIELDS_MANAGER}
                    {...crud("manager")}
                  />
                  <CrudSection
                    title="Staff"
                    items={data.staff || []}
                    fields={FIELDS_STAFF}
                    {...crud("staff")}
                  />
                </>
              }
            />
            <Route path="/jeux"
              element={
                <CrudSection
                  title="Jeux"
                  items={data.jeux || []}
                  fields={FIELDS_JEU}
                  {...crud("jeu")}
                />
              }
            />
            <Route path="/palmares"
              element={
                <CrudSection
                  title="Palmarès"
                  items={data.palmares || []}
                  fields={FIELDS_PALMARES}
                  {...crud("palmares")}
                />
              }
            />
            <Route path="/sponsors"
              element={
                <CrudSection
                  title="Sponsors"
                  items={data.sponsors || []}
                  fields={FIELDS_SPONSOR}
                  {...crud("sponsor")}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Layout>
  );
}
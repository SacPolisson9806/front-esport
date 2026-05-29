import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
const API = import.meta.env.VITE_API_URL;

// action=create_team correspond au switch PHP
const API_BASE = `${API}/Equipeadmin/adminequipe.php?action=create_team`;

// ─── helpers ────────────────────────────────────────────────────────────────
const emptyJeu      = () => ({ nom: "", rang: "", division: "", objectifs: "" });
const emptyJoueur   = () => ({ nom: "", pseudo: "", age: "", nationalite: "", jeu: "", role: "", experience: "", contrat: "", duree_contrat: "", date_arrivee: "", anciennes_equipes: "", photo: "", twitter: "", instagram: "", twitch: "", youtube: "", tiktok: "", facebook: "" });
const emptyManager  = () => ({ nom: "", role: "", jeux_geres: "", photo: "", age: "", twitter: "", instagram: "", twitch: "", youtube: "", tiktok: "", facebook: "" });
const emptyStaff    = () => ({ nom: "", role: "", jeux_geres: "", photo: "", twitter: "", instagram: "", twitch: "", youtube: "", tiktok: "", facebook: "" });
const emptyPalmares = () => ({ tournoi: "", date: "", resultat: "", recompense: "" });
const emptySponsor  = () => ({ nom: "", type: "", duree: "", lien: "", logo: "", twitter: "", instagram: "", youtube: "" });

const STEPS = [
  { id: "identite",  label: "Identité",  icon: "🏷️" },
  { id: "contact",   label: "Contact",   icon: "📬" },
  { id: "socials",   label: "Réseaux",   icon: "🔗" },
  { id: "jeux",      label: "Jeux",      icon: "🎮" },
  { id: "joueurs",   label: "Joueurs",   icon: "👾" },
  { id: "managers",  label: "Managers",  icon: "🧠" },
  { id: "staff",     label: "Staff",     icon: "🛠️" },
  { id: "palmares",  label: "Palmarès",  icon: "🏆" },
  { id: "sponsors",  label: "Sponsors",  icon: "🤝" },
];

// ─── reusable field components ───────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
      {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb",
  borderRadius: 10, fontSize: 14, color: "#111827", background: "#fff",
  outline: "none", boxSizing: "border-box", transition: "border-color .15s",
};

const Input = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={inputStyle}
    onFocus={e => { e.target.style.borderColor = "#6366f1"; }}
    onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
    onFocus={e => e.target.style.borderColor = "#6366f1"}
    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
  />
);

const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "1.25rem 0 0.75rem" }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6366f1", textTransform: "uppercase", margin: 0, whiteSpace: "nowrap" }}>
      {children}
    </p>
    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
  </div>
);

const SocialsFields = ({ data, onChange }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
    {[
      { key: "twitter",   label: "𝕏 Twitter / X" },
      { key: "instagram", label: "📸 Instagram" },
      { key: "twitch",    label: "🟣 Twitch" },
      { key: "youtube",   label: "▶️ YouTube" },
      { key: "tiktok",    label: "🎵 TikTok" },
      { key: "facebook",  label: "f Facebook" },
    ].filter(s => data[s.key] !== undefined).map(s => (
      <Field key={s.key} label={s.label}>
        <Input value={data[s.key] || ""} onChange={e => onChange(s.key, e.target.value)} placeholder="https://..." />
      </Field>
    ))}
  </div>
);

const ItemCard = ({ title, onRemove, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, marginBottom: "1rem", overflow: "hidden" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "#f9fafb", cursor: "pointer",
          borderBottom: open ? "1px solid #e5e7eb" : "none",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>{title}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 18, color: "#9ca3af" }}>{open ? "▲" : "▼"}</span>
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{ background: "#fee2e2", border: "none", borderRadius: 6, padding: "2px 8px", cursor: "pointer", color: "#dc2626", fontSize: 13, fontWeight: 700 }}
          >✕</button>
        </div>
      </div>
      {open && <div style={{ padding: "14px" }}>{children}</div>}
    </div>
  );
};

const AddBtn = ({ label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", padding: "10px", border: "2px dashed #c7d2fe",
      borderRadius: 10, background: "#eef2ff", color: "#6366f1",
      fontWeight: 700, fontSize: 14, cursor: "pointer",
    }}
  >+ {label}</button>
);

// ─── Steps ───────────────────────────────────────────────────────────────────

const StepIdentite = ({ data, set, logoFile, setLogoFile, designCardFile, setDesignCardFile }) => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
      <Field label="Nom de l'équipe" required>
        <Input value={data.nom} onChange={e => set("nom", e.target.value)} placeholder="Team Phoenix" />
      </Field>
      <Field label="Tag / Abréviation">
        <Input value={data.tag} onChange={e => set("tag", e.target.value)} placeholder="PHX" />
      </Field>
    </div>
    <Field label="Description courte">
      <Input value={data.description_courte} onChange={e => set("description_courte", e.target.value)} placeholder="Une phrase qui résume l'équipe" />
    </Field>
    <Field label="Description longue">
      <Textarea value={data.description_longue} onChange={e => set("description_longue", e.target.value)} placeholder="Présentation complète de l'équipe…" rows={4} />
    </Field>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 1rem" }}>
      <Field label="Date de création">
        <Input type="date" value={data.date_creation} onChange={e => set("date_creation", e.target.value)} />
      </Field>
      <Field label="Pays">
        <Input value={data.pays} onChange={e => set("pays", e.target.value)} placeholder="France" />
      </Field>
      <Field label="Ville">
        <Input value={data.ville} onChange={e => set("ville", e.target.value)} placeholder="Paris" />
      </Field>
    </div>
    <Field label="Logo de l'équipe">
      <input
        type="file" accept="image/jpeg,image/png,image/webp"
        onChange={e => setLogoFile(e.target.files[0] || null)}
        style={{ fontSize: 13, color: "#374151" }}
      />
      {logoFile && (
        <img src={URL.createObjectURL(logoFile)} alt="aperçu logo"
          style={{ marginTop: 8, width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: "2px solid #e5e7eb" }} />
      )}
    </Field>
    <Field label="Image design card (optionnel)">
      <input
        type="file" accept="image/jpeg,image/png,image/webp"
        onChange={e => setDesignCardFile(e.target.files[0] || null)}
        style={{ fontSize: 13, color: "#374151" }}
      />
      {designCardFile && (
        <img src={URL.createObjectURL(designCardFile)} alt="aperçu design card"
          style={{ marginTop: 8, width: 120, height: 60, borderRadius: 8, objectFit: "cover", border: "2px solid #e5e7eb" }} />
      )}
    </Field>
  </div>
);

const StepContact = ({ data, set }) => (
  <div>
    <Field label="Site web">
      <Input value={data.site_web} onChange={e => set("site_web", e.target.value)} placeholder="https://..." />
    </Field>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
      <Field label="Email général">
        <Input type="email" value={data.email_general} onChange={e => set("email_general", e.target.value)} placeholder="contact@equipe.com" />
      </Field>
      <Field label="Email recrutement">
        <Input type="email" value={data.email_recrutement} onChange={e => set("email_recrutement", e.target.value)} placeholder="recrutement@equipe.com" />
      </Field>
    </div>
    <Field label="Téléphone">
      <Input value={data.telephone} onChange={e => set("telephone", e.target.value)} placeholder="+33 6 12 34 56 78" />
    </Field>
  </div>
);

const StepSocials = ({ data, set }) => <SocialsFields data={data} onChange={set} />;

const StepJeux = ({ jeux, setJeux }) => (
  <div>
    {jeux.map((j, i) => (
      <ItemCard key={i} title={j.nom || `Jeu ${i + 1}`} onRemove={() => setJeux(jeux.filter((_, x) => x !== i))}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <Field label="Nom du jeu" required>
            <Input value={j.nom} onChange={e => setJeux(jeux.map((x, xi) => xi === i ? { ...x, nom: e.target.value } : x))} placeholder="Valorant" />
          </Field>
          <Field label="Rang">
            <Input value={j.rang} onChange={e => setJeux(jeux.map((x, xi) => xi === i ? { ...x, rang: e.target.value } : x))} placeholder="Radiant" />
          </Field>
          <Field label="Division">
            <Input value={j.division} onChange={e => setJeux(jeux.map((x, xi) => xi === i ? { ...x, division: e.target.value } : x))} placeholder="Pro League" />
          </Field>
        </div>
        <Field label="Objectifs">
          <Textarea value={j.objectifs} onChange={e => setJeux(jeux.map((x, xi) => xi === i ? { ...x, objectifs: e.target.value } : x))} placeholder="Objectifs de la saison…" rows={2} />
        </Field>
      </ItemCard>
    ))}
    <AddBtn label="Ajouter un jeu" onClick={() => setJeux([...jeux, emptyJeu()])} />
  </div>
);

const StepJoueurs = ({ joueurs, setJoueurs }) => (
  <div>
    {joueurs.map((j, i) => {
      const upd = (k, v) => setJoueurs(joueurs.map((x, xi) => xi === i ? { ...x, [k]: v } : x));
      return (
        <ItemCard key={i} title={j.pseudo || j.nom || `Joueur ${i + 1}`} onRemove={() => setJoueurs(joueurs.filter((_, x) => x !== i))}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <Field label="Pseudo" required><Input value={j.pseudo} onChange={e => upd("pseudo", e.target.value)} placeholder="xXSniperXx" /></Field>
            <Field label="Nom réel"><Input value={j.nom} onChange={e => upd("nom", e.target.value)} placeholder="Jean Dupont" /></Field>
            <Field label="Jeu"><Input value={j.jeu} onChange={e => upd("jeu", e.target.value)} placeholder="Valorant" /></Field>
            <Field label="Rôle"><Input value={j.role} onChange={e => upd("role", e.target.value)} placeholder="Duelist" /></Field>
            <Field label="Âge"><Input type="number" value={j.age} onChange={e => upd("age", e.target.value)} placeholder="20" /></Field>
            <Field label="Nationalité"><Input value={j.nationalite} onChange={e => upd("nationalite", e.target.value)} placeholder="Français" /></Field>
            <Field label="Contrat"><Input value={j.contrat} onChange={e => upd("contrat", e.target.value)} placeholder="Pro" /></Field>
            <Field label="Durée contrat"><Input value={j.duree_contrat} onChange={e => upd("duree_contrat", e.target.value)} placeholder="1 an" /></Field>
          </div>
          <Field label="Date d'arrivée"><Input type="date" value={j.date_arrivee} onChange={e => upd("date_arrivee", e.target.value)} /></Field>
          <Field label="Anciennes équipes"><Input value={j.anciennes_equipes} onChange={e => upd("anciennes_equipes", e.target.value)} placeholder="Team A, Team B" /></Field>
          <Field label="Expérience"><Textarea value={j.experience} onChange={e => upd("experience", e.target.value)} placeholder="Parcours du joueur…" rows={2} /></Field>
          <Field label="Photo (URL)"><Input value={j.photo} onChange={e => upd("photo", e.target.value)} placeholder="https://..." /></Field>
          <SectionTitle>Réseaux sociaux</SectionTitle>
          <SocialsFields data={j} onChange={upd} />
        </ItemCard>
      );
    })}
    <AddBtn label="Ajouter un joueur" onClick={() => setJoueurs([...joueurs, emptyJoueur()])} />
  </div>
);

const StepManagers = ({ managers, setManagers }) => (
  <div>
    {managers.map((m, i) => {
      const upd = (k, v) => setManagers(managers.map((x, xi) => xi === i ? { ...x, [k]: v } : x));
      return (
        <ItemCard key={i} title={m.nom || `Manager ${i + 1}`} onRemove={() => setManagers(managers.filter((_, x) => x !== i))}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <Field label="Nom" required><Input value={m.nom} onChange={e => upd("nom", e.target.value)} placeholder="Marc Martin" /></Field>
            <Field label="Rôle"><Input value={m.role} onChange={e => upd("role", e.target.value)} placeholder="Head Coach" /></Field>
            <Field label="Âge"><Input type="number" value={m.age} onChange={e => upd("age", e.target.value)} placeholder="30" /></Field>
            <Field label="Jeux gérés"><Input value={m.jeux_geres} onChange={e => upd("jeux_geres", e.target.value)} placeholder="Valorant, LoL" /></Field>
          </div>
          <Field label="Photo (URL)"><Input value={m.photo} onChange={e => upd("photo", e.target.value)} placeholder="https://..." /></Field>
          <SectionTitle>Réseaux sociaux</SectionTitle>
          <SocialsFields data={m} onChange={upd} />
        </ItemCard>
      );
    })}
    <AddBtn label="Ajouter un manager" onClick={() => setManagers([...managers, emptyManager()])} />
  </div>
);

const StepStaff = ({ staff, setStaff }) => (
  <div>
    {staff.map((s, i) => {
      const upd = (k, v) => setStaff(staff.map((x, xi) => xi === i ? { ...x, [k]: v } : x));
      return (
        <ItemCard key={i} title={s.nom || `Staff ${i + 1}`} onRemove={() => setStaff(staff.filter((_, x) => x !== i))}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <Field label="Nom" required><Input value={s.nom} onChange={e => upd("nom", e.target.value)} placeholder="Sophie Leroy" /></Field>
            <Field label="Rôle"><Input value={s.role} onChange={e => upd("role", e.target.value)} placeholder="Analyst" /></Field>
            <Field label="Jeux gérés"><Input value={s.jeux_geres} onChange={e => upd("jeux_geres", e.target.value)} placeholder="Valorant" /></Field>
          </div>
          <Field label="Photo (URL)"><Input value={s.photo} onChange={e => upd("photo", e.target.value)} placeholder="https://..." /></Field>
          <SectionTitle>Réseaux sociaux</SectionTitle>
          <SocialsFields data={s} onChange={upd} />
        </ItemCard>
      );
    })}
    <AddBtn label="Ajouter un membre staff" onClick={() => setStaff([...staff, emptyStaff()])} />
  </div>
);

const StepPalmares = ({ palmares, setPalmares }) => (
  <div>
    {palmares.map((p, i) => {
      const upd = (k, v) => setPalmares(palmares.map((x, xi) => xi === i ? { ...x, [k]: v } : x));
      return (
        <ItemCard key={i} title={p.tournoi || `Tournoi ${i + 1}`} onRemove={() => setPalmares(palmares.filter((_, x) => x !== i))}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <Field label="Tournoi" required><Input value={p.tournoi} onChange={e => upd("tournoi", e.target.value)} placeholder="VCT Masters" /></Field>
            <Field label="Résultat"><Input value={p.resultat} onChange={e => upd("resultat", e.target.value)} placeholder="1ère place" /></Field>
            <Field label="Date"><Input type="date" value={p.date} onChange={e => upd("date", e.target.value)} /></Field>
            <Field label="Récompense"><Input value={p.recompense} onChange={e => upd("recompense", e.target.value)} placeholder="10 000 €" /></Field>
          </div>
        </ItemCard>
      );
    })}
    <AddBtn label="Ajouter un palmarès" onClick={() => setPalmares([...palmares, emptyPalmares()])} />
  </div>
);

const StepSponsors = ({ sponsors, setSponsors }) => (
  <div>
    {sponsors.map((s, i) => {
      const upd = (k, v) => setSponsors(sponsors.map((x, xi) => xi === i ? { ...x, [k]: v } : x));
      return (
        <ItemCard key={i} title={s.nom || `Sponsor ${i + 1}`} onRemove={() => setSponsors(sponsors.filter((_, x) => x !== i))}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <Field label="Nom" required><Input value={s.nom} onChange={e => upd("nom", e.target.value)} placeholder="Corsair" /></Field>
            <Field label="Type"><Input value={s.type} onChange={e => upd("type", e.target.value)} placeholder="Équipementier" /></Field>
            <Field label="Durée"><Input value={s.duree} onChange={e => upd("duree", e.target.value)} placeholder="1 an" /></Field>
            <Field label="Lien"><Input value={s.lien} onChange={e => upd("lien", e.target.value)} placeholder="https://..." /></Field>
          </div>
          <Field label="Logo (URL)"><Input value={s.logo} onChange={e => upd("logo", e.target.value)} placeholder="https://..." /></Field>
          <SectionTitle>Réseaux sociaux</SectionTitle>
          <SocialsFields data={s} onChange={upd} />
        </ItemCard>
      );
    })}
    <AddBtn label="Ajouter un sponsor" onClick={() => setSponsors([...sponsors, emptySponsor()])} />
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
export default function CreerEquipe({ user, onLogout }) {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  // Fichiers uploadés (PHP: $_FILES)
  const [logoFile,       setLogoFile]       = useState(null);
  const [designCardFile, setDesignCardFile] = useState(null);

  // Champs scalaires → $_POST
  const [equipe, setEquipe] = useState({
    nom: "", tag: "", date_creation: "", description_courte: "", description_longue: "",
    pays: "", ville: "", site_web: "", email_general: "", email_recrutement: "",
    telephone: "", twitter: "", instagram: "", twitch: "", youtube: "", tiktok: "", facebook: "",
  });

  // Données relationnelles → $_POST[key] = JSON.stringify([...])
  const [jeux,     setJeux]     = useState([]);
  const [joueurs,  setJoueurs]  = useState([]);
  const [managers, setManagers] = useState([]);
  const [staff,    setStaff]    = useState([]);
  const [palmares, setPalmares] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  const setEq = (k, v) => setEquipe(e => ({ ...e, [k]: v }));

  // ── Soumission ──
  // PHP attend multipart/form-data avec :
  //   $_POST  : champs scalaires + tableaux sérialisés en JSON
  //   $_FILES : logo, design_card
  const handleSubmit = async () => {
    if (!equipe.nom.trim()) {
      setError("Le nom de l'équipe est obligatoire.");
      setStep(0);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();

      // Champs scalaires
      Object.entries(equipe).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
      });

      // Tableaux → JSON (php: json_decode($data[$key], true))
      fd.append("jeux",     JSON.stringify(jeux));
      fd.append("joueurs",  JSON.stringify(joueurs));
      fd.append("managers", JSON.stringify(managers));
      fd.append("staff",    JSON.stringify(staff));
      fd.append("palmares", JSON.stringify(palmares));
      fd.append("sponsors", JSON.stringify(sponsors));

      // Fichiers → $_FILES
      if (logoFile)       fd.append("logo",        logoFile);
      if (designCardFile) fd.append("design_card",  designCardFile);

      // Pas de Content-Type manuel : le navigateur gère le boundary multipart
      const res = await fetch(API_BASE, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/admin/equipe"), 1800);
      } else {
        setError(data.message || "Erreur lors de la création.");
      }
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setSaving(false);
    }
  };

  if (success) return (
    <Layout user={user} onLogout={onLogout}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <div style={{ fontSize: 64 }}>🎉</div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>Équipe créée avec succès !</h2>
        <p style={{ color: "#6b7280", margin: 0 }}>Redirection en cours…</p>
      </div>
    </Layout>
  );

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container" style={{ maxWidth: 740, margin: "0 auto", paddingBottom: "3rem" }}>

        {/* Header */}
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div className="page-header-left">
            <h1 className="page-title">Créer une <span>équipe</span></h1>
            <p className="page-subtitle">Renseignez les informations de votre équipe esport</p>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", overflowX: "auto", gap: 4, marginBottom: "1.75rem", paddingBottom: 4 }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 4, padding: "8px 12px", borderRadius: 10, border: "none",
                cursor: "pointer", minWidth: 72, flexShrink: 0,
                background: i === step ? "#6366f1" : i < step ? "#ede9fe" : "#f3f4f6",
                color: i === step ? "#fff" : i < step ? "#6366f1" : "#9ca3af",
                fontWeight: i === step ? 700 : 500,
                fontSize: 12, transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: "1.75rem" }}>
          <h2 style={{ margin: "0 0 1.25rem", fontSize: 18, fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
            <span>{STEPS[step].icon}</span> {STEPS[step].label}
          </h2>

          {step === 0 && <StepIdentite  data={equipe} set={setEq} logoFile={logoFile} setLogoFile={setLogoFile} designCardFile={designCardFile} setDesignCardFile={setDesignCardFile} />}
          {step === 1 && <StepContact   data={equipe} set={setEq} />}
          {step === 2 && <StepSocials   data={equipe} set={setEq} />}
          {step === 3 && <StepJeux      jeux={jeux}         setJeux={setJeux} />}
          {step === 4 && <StepJoueurs   joueurs={joueurs}   setJoueurs={setJoueurs} />}
          {step === 5 && <StepManagers  managers={managers} setManagers={setManagers} />}
          {step === 6 && <StepStaff     staff={staff}       setStaff={setStaff} />}
          {step === 7 && <StepPalmares  palmares={palmares} setPalmares={setPalmares} />}
          {step === 8 && <StepSponsors  sponsors={sponsors} setSponsors={setSponsors} />}

          {error && (
            <div style={{ marginTop: "1rem", padding: "10px 14px", background: "#fee2e2", borderRadius: 10, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", gap: 12 }}>
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                background: "#fff", color: step === 0 ? "#d1d5db" : "#374151",
                fontWeight: 700, cursor: step === 0 ? "default" : "pointer", fontSize: 14,
              }}
            >← Précédent</button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: "#6366f1", color: "#fff",
                  fontWeight: 700, cursor: "pointer", fontSize: 14,
                }}
              >Suivant →</button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  padding: "10px 28px", borderRadius: 10, border: "none",
                  background: saving ? "#a5b4fc" : "#6366f1",
                  color: "#fff", fontWeight: 700, cursor: saving ? "default" : "pointer", fontSize: 14,
                }}
              >{saving ? "Enregistrement…" : "✅ Créer l'équipe"}</button>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <div style={{ marginTop: "1rem", height: 4, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99, background: "#6366f1",
            width: `${((step + 1) / STEPS.length) * 100}%`,
            transition: "width .3s ease",
          }} />
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
          Étape {step + 1} / {STEPS.length}
        </p>
      </div>
    </Layout>
  );
}
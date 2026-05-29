import { useState, useEffect } from "react";
import Layout from "../Layout";

const API = import.meta.env.VITE_API_URL;

export default function Equipes({ user, onLogout }) {
  const [equipes, setEquipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/equipepublic/get_equipes.php`).then(r => r.json()).then(d => {
      if (d.success) setEquipes(d.equipes || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  const filtered = equipes.filter(e =>
    e.nom?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Équipes <span>esport</span></h1>
            <p className="page-subtitle">{equipes.length} équipe{equipes.length !== 1 ? "s" : ""} enregistrée{equipes.length !== 1 ? "s" : ""}</p>
          </div>
          <input
            className="input"
            placeholder="🔍  Rechercher une équipe…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <p className="empty-text">Aucune équipe trouvée</p>
          </div>
        ) : (
          <div className="equipes-grid">
            {filtered.map(eq => (
              <EquipeCard key={eq.id_equipe} eq={eq} onClick={() => setSelected(eq)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <EquipeModal eq={selected} onClose={() => setSelected(null)} />
      )}
    </Layout>
  );
}

function EquipeCard({ eq, onClick }) {
  return (
    <div className="equipe-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="equipe-header">
        {eq.logo
          ? <img src={eq.logo} alt={eq.nom} className="equipe-logo" />
          : <div className="equipe-logo-ph">🎮</div>
        }
        <div className="equipe-meta">
          <p className="equipe-name">{eq.nom}</p>
          {eq.description_courte && <p className="equipe-short">{eq.description_courte}</p>}
        </div>
        {eq.jeux?.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginRight: 8 }}>
            {eq.jeux.slice(0, 2).map((j, i) => (
              <span key={i} className="badge badge-neutral">{j.nom}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Avatar = ({ photo, nom, size = 40 }) => (
  photo
    ? <img src={photo} alt={nom} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    : <div style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 700, fontSize: size * 0.36,
      }}>
        {nom?.[0]?.toUpperCase() || "?"}
      </div>
);

const Socials = ({ item }) => {
  const links = [
    { key: "twitter",   icon: "𝕏",  color: "#000" },
    { key: "instagram", icon: "📸", color: "#e1306c" },
    { key: "twitch",    icon: "🟣", color: "#9147ff" },
    { key: "youtube",   icon: "▶️", color: "#ff0000" },
    { key: "tiktok",    icon: "🎵", color: "#000" },
    { key: "facebook",  icon: "f",  color: "#1877f2" },
  ].filter(l => item[l.key]);

  if (!links.length) return null;
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
      {links.map(l => (
        <a key={l.key} href={item[l.key]} target="_blank" rel="noreferrer"
          style={{
            width: 26, height: 26, borderRadius: 6, border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, textDecoration: "none", color: l.color, background: "#fff",
          }}>
          {l.icon}
        </a>
      ))}
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "1.25rem 0 0.75rem" }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6366f1", textTransform: "uppercase", margin: 0 }}>
      {children}
    </p>
    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
  </div>
);

function EquipeModal({ eq, onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "1rem",
        // Le scroll est sur l'overlay, pas sur le panel
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20,
          width: 620, maxWidth: "100%",
          // Pas de maxHeight ici — le contenu s'étend librement, l'overlay scrolle
          margin: "auto",
          position: "relative",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Bandeau header */}
        <div style={{
          background: "linear-gradient(135deg,#1e1b4b,#4338ca)",
          borderRadius: "20px 20px 0 0",
          padding: "1.5rem 1.5rem 3rem",
          position: "relative",
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(255,255,255,0.15)", border: "none",
            cursor: "pointer", color: "#fff", width: 32, height: 32,
            borderRadius: 8, fontSize: 18, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Contenu */}
        <div style={{ padding: "0 1.5rem 1.5rem", marginTop: -40 }}>

          {/* Identité */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: "0.75rem" }}>
            {eq.logo
              ? <img src={eq.logo} alt={eq.nom} style={{
                  width: 72, height: 72, borderRadius: 16, objectFit: "cover",
                  border: "3px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }} />
              : <div style={{
                  width: 72, height: 72, borderRadius: 16,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, border: "3px solid #fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}>🎮</div>
            }
            <div style={{ paddingBottom: 4 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#111827" }}>{eq.nom}</h2>
              {eq.description_courte && <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{eq.description_courte}</p>}
            </div>
          </div>

          {eq.description_long && (
            <p style={{
              fontSize: 13, color: "#374151", lineHeight: 1.6,
              background: "#f9fafb", borderRadius: 10, padding: "10px 14px",
              margin: "0 0 0.5rem", border: "1px solid #f3f4f6",
            }}>{eq.description_long}</p>
          )}

          {/* Jeux */}
          {eq.jeux?.length > 0 && (
            <>
              <SectionTitle>🎮 Jeux</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {eq.jeux.map((j, i) => (
                  <div key={i} style={{
                    background: "#f9fafb", border: "1px solid #e5e7eb",
                    borderRadius: 10, padding: "10px 14px",
                    display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
                  }}>
                    <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{j.nom}</span>
                    {j.rang && <span style={{ fontSize: 12, background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: 99 }}>Rang : {j.rang}</span>}
                    {j.division && <span style={{ fontSize: 12, background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 99 }}>Division : {j.division}</span>}
                    {j.objectifs && <p style={{ width: "100%", margin: 0, fontSize: 12, color: "#6b7280" }}>🎯 {j.objectifs}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Joueurs */}
          {eq.joueurs?.length > 0 && (
            <>
              <SectionTitle>👾 Joueurs</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {eq.joueurs.map((j, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#f9fafb", border: "1px solid #e5e7eb",
                    borderRadius: 12, padding: "10px 14px",
                  }}>
                    <Avatar photo={j.photo} nom={j.pseudo || j.nom} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{j.pseudo}</span>
                        {j.nom && <span style={{ fontSize: 12, color: "#9ca3af" }}>{j.nom}</span>}
                        {j.role && <span style={{ fontSize: 11, background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: 99 }}>{j.role}</span>}
                        {j.jeu && <span style={{ fontSize: 11, background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 99 }}>{j.jeu}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                        {j.age && <span style={{ fontSize: 12, color: "#6b7280" }}>🎂 {j.age} ans</span>}
                        {j.nationalite && <span style={{ fontSize: 12, color: "#6b7280" }}>🌍 {j.nationalite}</span>}
                        {j.contrat && <span style={{ fontSize: 12, color: "#6b7280" }}>📄 {j.contrat}{j.duree_contrat ? ` · ${j.duree_contrat}` : ""}</span>}
                        {j.date_arrivee && <span style={{ fontSize: 12, color: "#6b7280" }}>📅 {j.date_arrivee}</span>}
                      </div>
                      {j.anciennes_equipes && (
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>Anciennes équipes : {j.anciennes_equipes}</p>
                      )}
                      <Socials item={j} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Managers */}
          {eq.managers?.length > 0 && (
            <>
              <SectionTitle>🧠 Managers</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {eq.managers.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#f9fafb", border: "1px solid #e5e7eb",
                    borderRadius: 12, padding: "10px 14px",
                  }}>
                    <Avatar photo={m.photo} nom={m.nom} size={44} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{m.nom}</span>
                        {m.role && <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 99 }}>{m.role}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                        {m.age && <span style={{ fontSize: 12, color: "#6b7280" }}>🎂 {m.age} ans</span>}
                        {m.jeux_geres && <span style={{ fontSize: 12, color: "#6b7280" }}>🎮 {m.jeux_geres}</span>}
                      </div>
                      <Socials item={m} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Staff */}
          {eq.staff?.length > 0 && (
            <>
              <SectionTitle>🛠 Staff</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {eq.staff.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#f9fafb", border: "1px solid #e5e7eb",
                    borderRadius: 12, padding: "10px 14px",
                  }}>
                    <Avatar photo={s.photo} nom={s.nom} size={44} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{s.nom}</span>
                        {s.role && <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: 99 }}>{s.role}</span>}
                      </div>
                      {s.jeux_geres && <span style={{ fontSize: 12, color: "#6b7280" }}>🎮 {s.jeux_geres}</span>}
                      <Socials item={s} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Palmarès */}
          {eq.palmares?.length > 0 && (
            <>
              <SectionTitle>🏆 Palmarès</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {eq.palmares.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: 10, padding: "10px 14px",
                  }}>
                    <span style={{ fontSize: 24 }}>🏅</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{p.tournoi}</span>
                      <div style={{ display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                        {p.resultat && <span style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>{p.resultat}</span>}
                        {p.recompense && <span style={{ fontSize: 12, color: "#6b7280" }}>💰 {p.recompense}</span>}
                        {p.date && <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>{p.date}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Sponsors */}
          {eq.sponsors?.length > 0 && (
            <>
              <SectionTitle>🤝 Sponsors</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {eq.sponsors.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 10, padding: "10px 14px",
                  }}>
                    {s.logo
                      ? <img src={s.logo} alt={s.nom} style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤝</div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{s.nom}</span>
                        {s.type && <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: 99 }}>{s.type}</span>}
                        {s.duree && <span style={{ fontSize: 12, color: "#6b7280" }}>⏱ {s.duree}</span>}
                      </div>
                      {s.lien && (
                        <a href={s.lien} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#6366f1" }}>🔗 {s.lien}</a>
                      )}
                      <Socials item={s} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!eq.joueurs?.length && !eq.managers?.length && !eq.staff?.length && !eq.palmares?.length && !eq.sponsors?.length && !eq.jeux?.length && (
            <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "1.5rem 0" }}>
              Aucune information supplémentaire disponible.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
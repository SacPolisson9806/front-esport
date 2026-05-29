import { useState, useEffect } from "react";
import Layout from "../Layout";

const API = import.meta.env.VITE_API_URL;

export default function Competitions({ user, onLogout }) {
  const [compets, setCompets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/Competitions/Competitions.php?action=get_all`)
      .then(r => r.json())
      .then(d => { if (d.success) setCompets(d.competitions || []); })
      .finally(() => setLoading(false));
  }, []);

  const now      = new Date();
  const upcoming = compets.filter(c => new Date(c.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past     = compets.filter(c => new Date(c.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Compé<span>titions</span></h1>
            <p className="page-subtitle">Tournois et événements esport</p>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Chargement…</div>
        ) : compets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p className="empty-text">Aucune compétition pour le moment</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {upcoming.length > 0 && (
              <section>
                <p className="section-title" style={{ marginBottom: 16 }}>À venir</p>
                <div className="compets-list">
                  {upcoming.map(c => <CompetCard key={c.id} c={c} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <p className="section-title" style={{ marginBottom: 16, color: "var(--t2)" }}>Passées</p>
                <div className="compets-list">
                  {past.map(c => <CompetCard key={c.id} c={c} past />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function CompetCard({ c, past }) {
  const d   = new Date(c.date);
  const day = d.getDate();
  const mon = d.toLocaleString("fr-FR", { month: "short" });

  return (
    <div className="compet-card" style={past ? { opacity: .65 } : {}}>
      <div className="compet-date">
        <p className="compet-day">{day}</p>
        <p className="compet-mon">{mon}</p>
      </div>
      <div className="compet-info">
        <p className="compet-name">{c.nom}</p>
        <div className="compet-meta">
          {c.jeu    && <span>🎮 {c.jeu}</span>}
          {c.lieu   && <span>📍 {c.lieu}</span>}
          {c.format && <span>🏆 {c.format}</span>}
          {c.prize  && <span style={{ color: "var(--amber)" }}>💰 {c.prize}</span>}
        </div>
        {c.description && <p className="compet-desc">{c.description}</p>}
      </div>
      {past
        ? <span className="badge badge-neutral">Terminé</span>
        : <span className="badge badge-green">À venir</span>
      }
    </div>
  );
}
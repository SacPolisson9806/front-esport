import { Link } from "react-router-dom";
import Layout from "../Layout";

const API = import.meta.env.VITE_API_URL;

export default function Salon({ user, onLogout }) {
  if (!user) return null;

  return (
    <Layout user={user} onLogout={onLogout}>
      <div style={{ width: "100%", padding: "40px 40px 80px" }}>
        <div className="hub-grid">

          <Link to="/equipes" className="hub-card">
            <div className="hub-card-icon">🏆</div>
            <p className="hub-card-title">Équipes</p>
            <p className="hub-card-desc">Consulte toutes les équipes et leurs joueurs.</p>
          </Link>

          <Link to="/competitions" className="hub-card">
            <div className="hub-card-icon">📅</div>
            <p className="hub-card-title">Compétitions</p>
            <p className="hub-card-desc">Prochains tournois et événements esport.</p>
          </Link>

          {user.role === "visiteur" && (
            <Link to="/demande-admin" className="hub-card">
              <div className="hub-card-icon">📩</div>
              <p className="hub-card-title">Gérer une équipe</p>
              <p className="hub-card-desc">Fais une demande pour devenir admin d'équipe.</p>
            </Link>
          )}

          {user.role === "admin_equipe" && user.admin_valide === 1 && (
            <Link to="/admin/equipe" className="hub-card">
              <div className="hub-card-icon">⚙️</div>
              <p className="hub-card-title">Mon équipe</p>
              <p className="hub-card-desc">Gère les infos, joueurs et staff de ton équipe.</p>
            </Link>
          )}

          {user.role === "super_admin" && (
            <Link to="/superadmin" className="hub-card">
              <div className="hub-card-icon">🛡️</div>
              <p className="hub-card-title">Administration</p>
              <p className="hub-card-desc">Gestion des utilisateurs, équipes et compétitions.</p>
            </Link>
          )}
        </div>

        {user.role === "admin_equipe" && user.admin_valide === 0 && (
          <div className="pending-banner" style={{ marginTop: 20 }}>
            <span style={{ fontSize: 22 }}>⏳</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Compte en attente de validation</p>
              <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>
                Le super admin doit valider ton compte avant que tu puisses gérer ton équipe.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
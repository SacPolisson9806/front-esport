import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const loc = useLocation();
  const is = (path) => loc.pathname === path ? "nav-link active" : "nav-link";
  const isSalon = loc.pathname === "/salon";

  const roleLabel = {
    visiteur:     "Visiteur",
    admin_equipe: "Admin d'équipe",
    super_admin:  "Super Administrateur",
  }[user?.role] || user?.role;

  const badgeClass = {
    super_admin:  "badge-accent",
    admin_equipe: "badge-green",
    visiteur:     "badge-neutral",
  }[user?.role] || "badge-neutral";

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Gauche : logo */}
        <Link to="/" className="navbar-logo">
          ESport<span>Hub</span>
        </Link>

        {/* Centre : liens de navigation */}
        <div className="nav-links">
          <Link to="/equipes"      className={is("/equipes")}>Équipes</Link>
          <Link to="/competitions" className={is("/competitions")}>Compétitions</Link>
          {user?.role === "admin_equipe" && user?.admin_valide === 1 && (
            <Link to="/admin/equipe" className={loc.pathname.startsWith("/admin/equipe") ? "nav-link active" : "nav-link"}>
              Mon équipe
            </Link>
          )}
          {user?.role === "super_admin" && (
            <Link to="/superadmin" className={loc.pathname.startsWith("/superadmin") ? "nav-link active" : "nav-link"}>
              Admin
            </Link>
          )}
        </div>

        {/* Droite : infos user + déconnexion */}
        <div className="nav-actions">
          {user ? (
            <>
              <div className="nav-user-info">
                {isSalon && <span className="nav-greeting">Bienvenue,</span>}
                <span className="nav-pseudo">{user.pseudo}</span>
                <span className={`badge ${badgeClass}`}>{roleLabel}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Inscription</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
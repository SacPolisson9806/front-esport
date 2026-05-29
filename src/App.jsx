import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Login        from "./auth/Login";
import Register     from "./auth/Register";
import Salon        from "./Pages/Salon";
import Equipes      from "./Pages/Equipes";
import Competitions from "./Pages/Competitions";
import DemandeAdmin from "./Pages/DemandeAdmin";
import AdminEquipe  from "./admin/AdminEquipe";
import CreerEquipe  from "./Pages/CreerEquipe";
import SuperAdmin   from "./admin/SuperAdmin";
const API = import.meta.env.VITE_API_URL;

const ME_API = `${API}/Utilisateur/utilisateur.php?action=me`;

export default function App() {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/login" || path === "/register") {
      setReady(true);
      return;
    }

    fetch(ME_API, { credentials: "include" })
      .then(r => { if (!r.ok) return null; return r.json(); })
      .then(d => { if (d?.success) setUser(d.user); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const logout = async () => {
    await fetch(`${API}/logout.php`, { credentials: "include" });
    setUser(null);
  };

  if (!ready) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div className="spinner" />
    </div>
  );

  const shared = { user, onLogout: logout };

  // Raccourci : admin équipe validé
  const isAdminEquipe = user?.role === "admin_equipe" && user?.admin_valide === 1;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login"    element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        {/* Public */}
        <Route path="/equipes"      element={<Equipes      {...shared} />} />
        <Route path="/competitions" element={<Competitions {...shared} />} />

        {/* Connecté */}
        <Route path="/salon"         element={user ? <Salon        {...shared} /> : <Navigate to="/login" />} />
        <Route path="/demande-admin" element={user ? <DemandeAdmin {...shared} /> : <Navigate to="/login" />} />

        {/* ─── Admin équipe ─────────────────────────────────────────────────────
            /admin/equipe/creer  → formulaire de création (sans sidebar)
            /admin/equipe/*      → dashboard (avec sidebar) — AdminEquipe
            L'ordre compte : React Router teste les routes dans l'ordre,
            donc /creer doit être AVANT le wildcard /* pour matcher en premier.
        ──────────────────────────────────────────────────────────────────────── */}
        <Route
          path="/admin/equipe/creer"
          element={isAdminEquipe ? <CreerEquipe {...shared} /> : <Navigate to="/salon" />}
        />
        <Route
          path="/admin/equipe/*"
          element={isAdminEquipe ? <AdminEquipe {...shared} /> : <Navigate to="/salon" />}
        />

        {/* Super admin */}
        <Route
          path="/superadmin/*"
          element={user?.role === "super_admin" ? <SuperAdmin {...shared} /> : <Navigate to="/salon" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
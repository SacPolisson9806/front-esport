/**
 * ============================================================
 * AdminCreateUser.jsx
 * ------------------------------------------------------------
 * Page permettant au Super Admin de créer un nouvel utilisateur.
 *
 * Champs :
 *  - pseudo
 *  - email
 *  - mot de passe
 *  - rôle (visiteur / admin équipe / super admin)
 *  - permissions (optionnel)
 *
 * Le composant envoie les données au backend via create_user.php.
 * ============================================================
 */

import React, { useState } from "react";

function AdminCreateUser() {
  // États des champs du formulaire
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState("visiteur");

  // Permissions optionnelles (si tu veux les utiliser plus tard)
  const [permissions, setPermissions] = useState({});

  // Message de retour du backend
  const [message, setMessage] = useState("");
const API = import.meta.env.VITE_API_URL;

  /**
   * ------------------------------------------------------------
   * handleCreate()
   * ------------------------------------------------------------
   * Envoie les données au backend pour créer un utilisateur.
   */
  const handleCreate = async () => {
    const res = await fetch(
      `${API}/Utilisateur/create_user.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pseudo,
          email,
          mot_de_passe: motDePasse,
          role,
          permissions
        })
      }
    );

    const data = await res.json();
    setMessage(data.message);
  };

  /**
   * ------------------------------------------------------------
   * Rendu principal
   * ------------------------------------------------------------
   */
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h2 style={{ marginBottom: "20px", color: "#1976d2" }}>
        ➕ Créer un nouveau compte
      </h2>

      {/* Champ pseudo */}
      <input
        type="text"
        placeholder="Pseudo"
        onChange={(e) => setPseudo(e.target.value)}
        style={inputStyle}
      />

      {/* Champ email */}
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      {/* Champ mot de passe */}
      <input
        type="password"
        placeholder="Mot de passe"
        onChange={(e) => setMotDePasse(e.target.value)}
        style={inputStyle}
      />

      {/* Sélecteur de rôle */}
      <select
        onChange={(e) => setRole(e.target.value)}
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        <option value="visiteur">Visiteur</option>
        <option value="admin_equipe">Admin Équipe</option>
        <option value="super_admin">Super Admin</option>
      </select>

      {/* Bouton de création */}
      <button
        onClick={handleCreate}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "10px",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Créer le compte
      </button>

      {/* Message de retour */}
      {message && (
        <p style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
}

/**
 * Style réutilisable pour les inputs
 */
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

export default AdminCreateUser;

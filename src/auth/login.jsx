import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Login({ setUser }) {
  const [pseudo, setPseudo]       = useState("");
  const [mdp, setMdp]             = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/Utilisateur/utilisateur.php?action=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pseudo, mot_de_passe: mdp }),
      });
      const data = await res.json();
      if (data.success) { setUser(data.user); navigate("/salon"); }
      else setError(data.message || "Identifiants incorrects");
    } catch { setError("Erreur de connexion au serveur"); }
    finally  { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">ESport<span>Hub</span></div>

        <div>
          <p className="auth-title">Connexion</p>
        </div>

        {error && <p className="msg msg-error">{error}</p>}

        <form className="input-group" onSubmit={handleSubmit}>
          <div className="field">
            <label>Pseudo</label>
            <input className="input" placeholder="Ton pseudo" value={pseudo}
              onChange={e => setPseudo(e.target.value)} required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••" value={mdp}
              onChange={e => setMdp(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
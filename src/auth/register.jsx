import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Register() {
  const [form, setForm]       = useState({ pseudo: "", email: "", mot_de_passe: "" });
  const [msg, setMsg]         = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null); setLoading(true);
    try {
      const res  = await fetch(`${API}/Utilisateur/utilisateur.php?action=register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setMsg({ type: "success", text: "Compte créé ! Redirection…" }); setTimeout(() => navigate("/login"), 1200); }
      else setMsg({ type: "error", text: data.message });
    } catch { setMsg({ type: "error", text: "Erreur serveur" }); }
    finally  { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">ESport<span>Hub</span></div>

        <div>
          <p className="auth-title">Créer un compte</p>
          <p className="auth-subtitle">Rejoins la plateforme</p>
        </div>

        {msg && <p className={`msg msg-${msg.type}`}>{msg.text}</p>}

        <form className="input-group" onSubmit={handleSubmit}>
          <div className="field">
            <label>Pseudo</label>
            <input className="input" placeholder="Ton pseudo" value={form.pseudo}
              onChange={set("pseudo")} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" placeholder="ton@email.com" value={form.email}
              onChange={set("email")} required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••" value={form.mot_de_passe}
              onChange={set("mot_de_passe")} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? "Création…" : "Créer le compte"}
          </button>
        </form>

        <p className="auth-footer">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
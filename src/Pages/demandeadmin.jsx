import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";

const API = import.meta.env.VITE_API_URL;

export default function DemandeAdmin({ user, onLogout }) {
  const [demande, setDemande]       = useState(null);
  const [form, setForm]             = useState({ nom_equipe: "", description: "" });
  const [msg, setMsg]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refusModal, setRefusModal] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    fetch(`${API}/Demande/demande_admin.php?action=get_mine`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setDemande(d.demande);
          if (d.show_refus_modal) setRefusModal(d.demande?.raison_refus);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    fetch(`${API}/Demande/demande_admin.php?action=create`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(r => r.json())
      .then(d => {
        setMsg({ type: d.success ? "success" : "error", text: d.message });
        if (d.success) load();
      })
      .catch(() => setMsg({ type: "error", text: "Erreur serveur" }))
      .finally(() => setSubmitting(false));
  };

  const closeRefus = () => {
    fetch(`${API}/Demande/demande_admin.php?action=mark_viewed`, { method: "POST", credentials: "include" });
    setRefusModal(null);
    setDemande(null);
  };

  if (loading) return <div className="loading"><div className="spinner" /> Chargement…</div>;

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container" style={{ maxWidth: 600, paddingTop: 40 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="page-title">Gérer une <span>équipe</span></h1>
          <p className="page-subtitle" style={{ marginTop: 6 }}>
            Envoie une demande pour devenir administrateur d'une équipe.
          </p>
        </div>

        {demande?.statut === "en_attente" && (
          <div className="msg msg-warn">
            ⏳ Ta demande pour <strong>{demande.nom_equipe}</strong> est en attente de validation.
          </div>
        )}

        {(!demande || demande.statut === "refuse") && (
          <div className="card">
            {msg && <p className={`msg msg-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</p>}
            <form className="input-group" onSubmit={submit}>
              <div className="field">
                <label>Nom de l'équipe</label>
                <input className="input" placeholder="Ex: Team Phoenix"
                  value={form.nom_equipe}
                  onChange={e => setForm(f => ({ ...f, nom_equipe: e.target.value }))}
                  required />
              </div>
              <div className="field">
                <label>Description & projet</label>
                <textarea className="input"
                  placeholder="Parle de ton équipe, tes objectifs, ta compétition…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required />
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
                {submitting ? "Envoi…" : "Envoyer la demande"}
              </button>
            </form>
          </div>
        )}
      </div>

      {refusModal !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <p className="modal-title">Demande refusée</p>
            </div>
            <p className="msg msg-error">
              <strong>Raison :</strong> {refusModal || "Aucune raison précisée"}
            </p>
            <p style={{ fontSize: 14, color: "var(--t2)" }}>
              Tu peux soumettre une nouvelle demande.
            </p>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={closeRefus}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
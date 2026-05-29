import Navbar from "./Navbar";

/**
 * Layout — wrapper commun à toutes les pages.
 * Chaque page l'utilise : plus besoin d'importer Navbar individuellement.
 *
 * Usage :
 *   <Layout user={user} onLogout={logout}>
 *     <div>contenu de la page</div>
 *   </Layout>
 */
export default function Layout({ user, onLogout, children }) {
  return (
    <div className="page">
      <Navbar user={user} onLogout={onLogout} />
      <main>{children}</main>
    </div>
  );
}
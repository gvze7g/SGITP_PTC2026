import { Link } from "react-router-dom";

function NotFoundPage({ privateArea = false }) {
  const targetPath = privateArea ? "/dashboard" : "/";
  const actionLabel = privateArea ? "Volver al panel" : "Volver al inicio";

  return (
    <main className="not-found-page">
      <section className="not-found-panel">
        <span className="not-found-code">404</span>
        <h1>Pagina no encontrada</h1>
        <p>
          La ruta solicitada no existe o no esta disponible para tu sesion.
        </p>
        <Link className="admin-primary-btn not-found-link" to={targetPath}>
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;

import { Link } from "react-router-dom";

// variant "not-found": la ruta no existe (404).
// variant "protected": la ruta existe pero el usuario no tiene sesion o rol
// para verla (ProtectedRoute la usa en vez de redirigir en silencio, asi el
// usuario ve por que no puede entrar en lugar de solo desaparecer a "/").
function NotFoundPage({ privateArea = false, variant = "not-found" }) {
  const isProtected = variant === "protected";

  const code = isProtected ? "403" : "404";
  const title = isProtected ? "Pagina protegida" : "Pagina no encontrada";
  const description = isProtected
    ? "Necesitas iniciar sesion con una cuenta autorizada para ver esta pagina."
    : "La ruta solicitada no existe o no esta disponible para tu sesion.";
  const targetPath = isProtected ? "/" : privateArea ? "/dashboard" : "/";
  const actionLabel = isProtected
    ? "Iniciar sesion"
    : privateArea
    ? "Volver al panel"
    : "Volver al inicio";

  return (
    <main className="not-found-page">
      <section className="not-found-panel">
        <span className="not-found-code">{code}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="admin-primary-btn not-found-link" to={targetPath}>
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;

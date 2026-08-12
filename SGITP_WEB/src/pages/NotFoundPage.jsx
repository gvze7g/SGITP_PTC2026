import { Link } from 'react-router-dom';
import PublicNavbar from '../components/home/PublicNavbar';
import PublicFooter from '../components/home/PublicFooter';

function NotFoundPage() {
  return (
    <div className="not-found-public-page">
      <PublicNavbar />

      <main className="not-found-public-main">
        <span>404</span>
        <h1>Página no encontrada</h1>
        <p>La ruta que intentaste abrir no existe o ya no está disponible.</p>
        <Link to="/home">Volver al inicio</Link>
      </main>

      <PublicFooter />
    </div>
  );
}

export default NotFoundPage;

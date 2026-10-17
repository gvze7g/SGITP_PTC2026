import { useNavigate } from 'react-router-dom';

const FOOTER_LINKS = [
  { label: 'Colecciones', path: '/categories' },
  { label: 'Tiendas', path: '/stores' },
  { label: 'Nosotros', path: '/about' },
  { label: 'Contacto', path: '/concierge' },
  { label: 'Envíos y devoluciones', path: '/returns' },
  { label: 'Privacidad', path: '/privacy' },
  { label: 'Términos', path: '/terms' },
];

function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="store-footer">
      <button type="button" className="store-footer-logo" onClick={() => navigate('/home')}>
        PEQUES
      </button>

      <nav className="store-footer-links" aria-label="Enlaces del sitio">
        {FOOTER_LINKS.map((link) => (
          <button key={link.path} type="button" onClick={() => navigate(link.path)}>
            {link.label}
          </button>
        ))}
      </nav>

      <p>© {new Date().getFullYear()} Peques · El Salvador</p>
    </footer>
  );
}

export default PublicFooter;

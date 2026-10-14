import { useNavigate } from 'react-router-dom';

function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="public-footer" id="nosotros">
      <div>
        <h2>PEQUES</h2>
        <p>Artesania y diseño atemporal para el hogar moderno.</p>
      </div>

      <div>
        <h3>El estudio</h3>
        <button type="button" onClick={() => navigate('/about')}>
          Nuestra historia
        </button>
        <button type="button" onClick={() => navigate('/collections')}>
          Colecciones
        </button>
        <button type="button" onClick={() => navigate('/stores')}>
          Tiendas
        </button>
      </div>

      <div>
        <h3>Soporte</h3>
        <button type="button" onClick={() => navigate('/returns')}>
          Envios y devoluciones
        </button>
        <button type="button" onClick={() => navigate('/concierge')}>
          Contacto
        </button>
        <button type="button" onClick={() => navigate('/privacy')}>
          Privacidad
        </button>
        <button type="button" onClick={() => navigate('/terms')}>
          Terminos
        </button>
      </div>

      <div>
        <h3>Tu cuenta</h3>
        <button type="button" onClick={() => navigate('/profile')}>
          Mi perfil
        </button>
        <button type="button" onClick={() => navigate('/cart')}>
          Carrito
        </button>
      </div>
    </footer>
  );
}

export default PublicFooter;

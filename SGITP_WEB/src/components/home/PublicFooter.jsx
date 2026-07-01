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
        <button type="button">Nuestra filosofia</button>
        <button type="button">Proceso artesanal</button>
        <button type="button">Sostenibilidad</button>
      </div>

      <div>
        <h3>Soporte</h3>
        <button type="button" onClick={() => navigate('/returns')}>
          Envios y devoluciones
        </button>
        <button type="button">Guia de tallas</button>
        <button type="button">Contacto</button>
      </div>

      <div>
        <h3>Revista</h3>
        <label>
          <span>Correo electronico</span>
          <input type="email" aria-label="Correo electronico" />
          <button type="button" aria-label="Enviar correo">→</button>
        </label>
      </div>
    </footer>
  );
}

export default PublicFooter;

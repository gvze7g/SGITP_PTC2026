import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// "Únete a la familia Peques": sin sesión lleva al registro con el correo ya
// escrito; con sesión saluda y lleva al perfil.
function JoinSection() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanEmail = email.trim();

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      toast.error('Ingresa un correo electrónico válido.');
      return;
    }

    navigate('/register', { state: { email: cleanEmail } });
  };

  const firstName = String(user?.full_name || '').split(' ')[0];

  return (
    <section className="home-join">
      <div>
        <h2>
          {isAuthenticated ? (
            <>
              Hola, <em>{firstName || 'bienvenido'}</em>
            </>
          ) : (
            <>
              Únete a la familia <em>Peques</em>
            </>
          )}
        </h2>
        <p>
          {isAuthenticated
            ? 'Revisa tus pedidos, favoritos y direcciones desde tu perfil.'
            : 'Crea tu cuenta para guardar favoritos, seguir tus pedidos y comprar más rápido.'}
        </p>
      </div>

      {isAuthenticated ? (
        <button type="button" className="shop-btn shop-btn-dark" onClick={() => navigate('/profile')}>
          Ver mi perfil
        </button>
      ) : (
        <form className="home-join-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            aria-label="Tu correo electrónico"
            value={email}
            maxLength={100}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="shop-btn shop-btn-dark">
            Crear cuenta
          </button>
        </form>
      )}
    </section>
  );
}

export default JoinSection;

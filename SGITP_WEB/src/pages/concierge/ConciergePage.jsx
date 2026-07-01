import { Mail, MapPin } from 'lucide-react';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';

const SERVICES = [
  {
    title: 'Citas Privadas',
    text: 'Reserve un encuentro exclusivo en nuestro showroom o en la comodidad de su residencia privada para una atencion sin distracciones, centrada en sus necesidades.',
    image: 'https://images.unsplash.com/photo-1597404294360-feeeda04612e?auto=format&fit=crop&w=760&q=90',
  },
  {
    title: 'Asesoria de Estilo',
    text: 'Nuestros expertos seleccionaran las piezas que mejor se adapten a la personalidad y necesidades de sus hijos, creando una capsula de vestuario atemporal y coherente.',
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=760&q=90',
  },
  {
    title: 'Gestion de Regalos',
    text: 'Permitanos encargarnos de la seleccion, el empaquetado artesanal y el envio de sus presentes, garantizando una presentacion impecable y una experiencia memorable.',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=760&q=90',
  },
];

function ConciergePage() {
  return (
    <div className="concierge-page">
      <PublicNavbar />

      <main>
        <section className="concierge-hero">
          <h1>
            Servicio de <em>Conserjeria</em>
          </h1>
          <p>
            Atencion a medida para su vestidor infantil. Un acompanamiento personal disenado para la
            excelencia.
          </p>
        </section>

        <section className="concierge-services">
          {SERVICES.map((service, index) => (
            <article key={service.title} className={index === 1 ? 'concierge-card concierge-card-lower' : 'concierge-card'}>
              <img src={service.image} alt={service.title} />
              <div>
                <h2>{service.title}</h2>
                <p>{service.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="concierge-phone">
          <span>Comunicacion directa</span>
          <h2>Atencion inmediata para clientes preferentes</h2>
          <p>+503 6767 2525</p>
          <small>Disponible de lunes a viernes · 09:00 - 18:00 CET</small>
        </section>

        <section className="concierge-request">
          <div className="concierge-request-copy">
            <h2>Solicitud de Asistencia Personalizada</h2>
            <p>
              Complete el siguiente formulario y uno de nuestros consejeros de estilo se pondra en
              contacto con usted en un plazo maximo de 24 horas.
            </p>

            <div className="concierge-contact-lines">
              <p>
                <MapPin size={14} strokeWidth={1.6} />
                <span>
                  <strong>Showroom Madrid</strong>
                  Calle de Serrano, 45, 28001
                </span>
              </p>
              <p>
                <Mail size={14} strokeWidth={1.6} />
                <span>
                  <strong>Email</strong>
                  conserjeria@atelierebano.com
                </span>
              </p>
            </div>
          </div>

          <form className="concierge-form">
            <label>
              <span>Nombre completo</span>
              <input type="text" placeholder="Juan Perez" />
            </label>
            <label>
              <span>Telefono</span>
              <input type="tel" placeholder="+34 000 000 000" />
            </label>
            <label>
              <span>Servicio de interes</span>
              <select defaultValue="">
                <option value="" disabled>
                  Seleccione un servicio
                </option>
                <option>Citas privadas</option>
                <option>Asesoria de estilo</option>
                <option>Gestion de regalos</option>
              </select>
            </label>
            <label>
              <span>Mensaje o preferencias</span>
              <textarea placeholder="Cuentenos sobre sus necesidades..." />
            </label>

            <button type="button">Enviar solicitud →</button>
          </form>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default ConciergePage;

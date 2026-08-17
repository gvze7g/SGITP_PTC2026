import { ArrowLeft, Mail, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import { getCurrentCustomer } from '../../services/customerAuthService';
import { digitsOnly, lettersOnly } from '../../utils/inputFilters';

const SERVICES = [
  {
    title: 'Citas privadas',
    text: 'Reserve un encuentro exclusivo en nuestra tienda o en la comodidad de su residencia para una atencion centrada en sus necesidades.',
    image: 'https://images.unsplash.com/photo-1597404294360-feeeda04612e?auto=format&fit=crop&w=760&q=90',
  },
  {
    title: 'Asesoria de estilo',
    text: 'Nuestros expertos seleccionaran las piezas que mejor se adapten a la personalidad y necesidades de sus hijos.',
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=760&q=90',
  },
  {
    title: 'Gestion de regalos',
    text: 'Permitanos encargarnos de la seleccion, el empaquetado artesanal y el envio de sus presentes.',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=760&q=90',
  },
];

function ConciergePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    service: '',
    message: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    getCurrentCustomer()
      .then((user) => {
        if (!isMounted || !user) return;

        setFormData((prev) => ({
          ...prev,
          fullName: user.full_name || user.name || '',
          phone: user.main_phone || user.phone_numbers?.find((phone) => phone.isPrimary)?.number || '',
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === 'fullName' ? lettersOnly(value) : name === 'phone' ? digitsOnly(value) : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccessMessage('');

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.service) {
      toast.error('Completa nombre, telefono y servicio de interes.');
      return;
    }

    setSuccessMessage(
      'Solicitud enviada correctamente. Un asesor se pondra en contacto contigo en un plazo maximo de 24 horas.'
    );
    toast.success('Solicitud enviada correctamente.');
    setFormData((prev) => ({
      ...prev,
      service: '',
      message: '',
    }));
  };

  return (
    <div className="concierge-page">
      <PublicNavbar />

      <main>
        <button type="button" className="commerce-back-btn concierge-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} strokeWidth={1.6} />
          Atras
        </button>

        <section className="concierge-hero">
          <h1>
            Servicio de <em>Consejeria</em>
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
          <small>Disponible de lunes a viernes · 09:00 - 18:00</small>
        </section>

        <section className="concierge-request">
          <div className="concierge-request-copy">
            <h2>Solicitud de Asistencia Personalizada</h2>
            <p>
              Complete el siguiente formulario y uno de nuestros asesores se pondra en contacto con
              usted en un plazo maximo de 24 horas.
            </p>

            <div className="concierge-contact-lines">
              <p>
                <MapPin size={14} strokeWidth={1.6} />
                <span>
                  <strong>Showroom Peques</strong>
                  San Salvador, El Salvador
                </span>
              </p>
              <p>
                <Mail size={14} strokeWidth={1.6} />
                <span>
                  <strong>Email</strong>
                  consejeria@peques.com
                </span>
              </p>
            </div>
          </div>

          <form className="concierge-form" onSubmit={handleSubmit}>
            <label>
              <span>Nombre completo</span>
              <input
                type="text"
                name="fullName"
                placeholder="Juan Perez"
                value={formData.fullName}
                onChange={handleChange}
                maxLength={50}
              />
            </label>
            <label>
              <span>Telefono</span>
              <input
                type="tel"
                name="phone"
                inputMode="numeric"
                placeholder="00000000"
                value={formData.phone}
                onChange={handleChange}
                maxLength={12}
              />
            </label>
            <label>
              <span>Servicio de interes</span>
              <select name="service" value={formData.service} onChange={handleChange}>
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
              <textarea
                name="message"
                placeholder="Cuentenos sobre sus necesidades..."
                value={formData.message}
                onChange={handleChange}
                maxLength={500}
              />
            </label>

            <button type="submit">Enviar solicitud →</button>
            {successMessage ? <p className="concierge-success-text">{successMessage}</p> : null}
          </form>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default ConciergePage;

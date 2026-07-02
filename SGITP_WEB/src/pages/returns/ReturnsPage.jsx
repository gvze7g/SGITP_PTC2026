import { ClipboardList, PackageCheck, Truck } from 'lucide-react';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';

const STEPS = [
  {
    label: 'Paso 01',
    title: 'Solicitud Digital',
    text: 'Complete nuestro formulario de solicitud con su numero de pedido y los detalles de la pieza a devolver.',
    icon: ClipboardList,
  },
  {
    label: 'Paso 02',
    title: 'Empaque Original',
    text: 'Embale la pieza cuidadosamente en su caja original de Atelier Ebano, asegurando su proteccion durante el transito.',
    icon: PackageCheck,
  },
  {
    label: 'Paso 03',
    title: 'Recogida y Reembolso',
    text: 'Coordinaremos la recogida en su domicilio. Una vez recibida e inspeccionada la pieza, procesaremos su reembolso.',
    icon: Truck,
  },
];

const FAQS = [
  {
    question: 'Cuanto tiempo tarda el reembolso?',
    answer:
      'Tras recibir e inspeccionar la prenda en nuestro atelier, el reembolso se procesara en un plazo de 5 a 10 dias habiles a traves del metodo de pago original.',
  },
  {
    question: 'Puedo realizar un cambio por otra talla?',
    answer:
      'Si, el proceso de cambio es identico al de devolucion. Al solicitar su tramite, seleccione la opcion de cambio para reservar la nueva pieza de inmediato.',
  },
  {
    question: 'El servicio de recogida tiene costo?',
    answer:
      'Como parte de nuestro compromiso de excelencia, la primera recogida por devolucion o cambio en pedidos superiores a $150 es cortesia de la casa.',
  },
];

function ReturnsPage() {
  return (
    <div className="returns-page">
      <PublicNavbar />

      <main>
        <section className="returns-hero">
          <span>Atencion al cliente</span>
          <h1>Devoluciones y Cambios</h1>
          <p>Compromiso de excelencia en cada pieza.</p>
        </section>

        <section className="returns-philosophy">
          <div className="returns-philosophy-copy">
            <h2>Nuestra Filosofia de Satisfaccion</h2>
            <p>
              En Atelier Ebano, entendemos que la adquisicion de una pieza para sus seres mas
              queridos es un acto de confianza. Si por alguna razon la prenda no cumple con sus
              expectativas, nuestra politica permite devoluciones dentro de los <strong>30 dias naturales</strong> a
              partir de la recepcion.
            </p>
            <p>
              Para preservar la integridad de nuestras colecciones, solicitamos que la pieza se
              encuentre sin usar, en su estado original y dentro del empaque artesanal en el que fue
              entregada.
            </p>
            <button type="button">Escribenos</button>
          </div>

          <img
            src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1100&q=90"
            alt="Prenda artesanal sobre mesa de madera"
          />
        </section>

        <section className="returns-steps">
          <h2>El Proceso, Paso a Paso</h2>

          <div className="returns-step-grid">
            {STEPS.map(({ icon: Icon, ...step }) => (
              <article key={step.label}>
                <div>
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <span>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="returns-contact">
          <img
            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1500&q=90"
            alt="Atelier con prendas en tonos neutros"
          />
          <div className="returns-contact-card">
            <h2>Alguna consulta adicional?</h2>
            <p>
              Nuestro equipo de conserjeria esta a su disposicion para asistirle en cualquier etapa
              del proceso de devolucion.
            </p>
            <div>
              <button type="button">Correo electronico</button>
              <button type="button">Chat en vivo</button>
            </div>
          </div>
        </section>

        <section className="returns-faq">
          <h2>Preguntas Frecuentes</h2>

          <div className="returns-faq-list">
            {FAQS.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default ReturnsPage;

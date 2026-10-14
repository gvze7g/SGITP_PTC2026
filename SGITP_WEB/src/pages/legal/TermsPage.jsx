import LegalLayout from '../../components/legal/LegalLayout';

const SECTIONS = [
  {
    title: 'Aceptación',
    paragraphs: [
      'Al crear una cuenta o realizar un pedido en el sitio web o la aplicación móvil de Peques, aceptas estos términos. Si no estás de acuerdo con ellos, te pedimos no usar nuestros servicios.',
    ],
  },
  {
    title: 'Tu cuenta',
    paragraphs: [
      'Debes proporcionar datos reales y mantenerlos actualizados. Eres responsable de cuidar tu contraseña y de la actividad que ocurra en tu cuenta.',
      'Puedes registrarte con tu correo electrónico o continuar con tu cuenta de Google.',
      'Podemos suspender cuentas que se usen de forma fraudulenta o que incumplan estos términos.',
    ],
  },
  {
    title: 'Productos y precios',
    paragraphs: [
      'Los precios se muestran en dólares estadounidenses (USD) e incluyen los descuentos vigentes. Las fotografías son referenciales: el tono de una prenda puede variar ligeramente según la pantalla.',
      'La disponibilidad de cada talla depende del inventario al momento de confirmar el pedido.',
    ],
  },
  {
    title: 'Pedidos y pagos',
    paragraphs: [
      'Al finalizar la compra se genera un pedido con estado pendiente. Actualmente la tienda en línea no realiza cobros automáticos: nuestro equipo confirma el pago antes de preparar el envío.',
      'Por tu seguridad, el código CVV de tu tarjeta se solicita en cada compra y nunca se guarda.',
      'Los cupones de descuento son válidos solo dentro de sus fechas de vigencia y no son acumulables.',
    ],
  },
  {
    title: 'Envíos',
    paragraphs: [
      'Realizamos envíos dentro de El Salvador. El costo y el plazo estimado de cada método de envío se muestran antes de finalizar la compra, y pueden variar por causas ajenas a nosotros.',
    ],
  },
  {
    title: 'Cambios y devoluciones',
    paragraphs: [
      'Aceptamos cambios y devoluciones dentro de los 30 días naturales posteriores a la entrega, siempre que la prenda esté sin usar y en su empaque original. El proceso completo está detallado en nuestra página de Envíos y Devoluciones.',
    ],
  },
  {
    title: 'Uso permitido',
    paragraphs: [
      'No está permitido usar el sitio o la aplicación para actividades ilegales, intentar acceder a cuentas ajenas, interferir con el funcionamiento del servicio ni copiar su contenido con fines comerciales.',
    ],
  },
  {
    title: 'Cambios a estos términos',
    paragraphs: [
      'Podemos actualizar estos términos cuando sea necesario. Publicaremos la nueva versión en esta página con su fecha de actualización.',
    ],
  },
  {
    title: 'Contacto',
    paragraphs: ['Para cualquier consulta sobre estos términos, escríbenos a consejeria@peques.com.'],
  },
];

function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Información legal"
      title="Términos y Condiciones"
      updatedAt="octubre de 2026"
      sections={SECTIONS}
    />
  );
}

export default TermsPage;

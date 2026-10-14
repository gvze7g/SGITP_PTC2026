import LegalLayout from '../../components/legal/LegalLayout';

const SECTIONS = [
  {
    title: 'Quiénes somos',
    paragraphs: [
      'Peques es una tienda de ropa infantil con sitio web y aplicación móvil. Esta política explica qué datos personales recopilamos, para qué los usamos y cómo puedes controlarlos.',
    ],
  },
  {
    title: 'Datos que recopilamos',
    paragraphs: [
      'Datos de cuenta: nombre completo, correo electrónico, teléfono y contraseña (guardada cifrada, nunca en texto plano).',
      'Direcciones de envío que decides guardar: etiqueta, dirección, ciudad y punto de referencia.',
      'Tarjetas guardadas: solo la marca, los últimos 4 dígitos, la fecha de vencimiento y el nombre del titular. Nunca guardamos el número completo de la tarjeta ni el código de seguridad (CVV).',
      'Actividad en la tienda: carrito de compras, favoritos y pedidos realizados.',
    ],
  },
  {
    title: 'Inicio de sesión con Google',
    paragraphs: [
      'Si eliges continuar con Google, Google nos comparte únicamente tu nombre, tu correo electrónico y tu foto de perfil. No tenemos acceso a tu contraseña de Google, a tu Gmail, a tus archivos ni a ningún otro dato de tu cuenta.',
      'Usamos esos datos solo para crear tu cuenta en Peques o iniciar sesión en ella.',
    ],
  },
  {
    title: 'Para qué usamos tus datos',
    paragraphs: [
      'Para mantener tu sesión iniciada, procesar y entregar tus pedidos, contactarte sobre el estado de una entrega, enviarte códigos de verificación o de recuperación de contraseña y atender tus consultas.',
      'No vendemos, alquilamos ni compartimos tus datos personales con terceros para fines publicitarios.',
    ],
  },
  {
    title: 'Cookies',
    paragraphs: [
      'Usamos una cookie de sesión necesaria para mantenerte conectado de forma segura. No usamos cookies de publicidad ni de rastreo de terceros.',
    ],
  },
  {
    title: 'Servicios de terceros',
    paragraphs: [
      'Para operar la tienda nos apoyamos en proveedores que procesan datos en nuestro nombre: Google (inicio de sesión), Mailjet (envío de correos de verificación) y Cloudinary (almacenamiento de imágenes de productos).',
    ],
  },
  {
    title: 'Tus derechos',
    paragraphs: [
      'Puedes consultar y editar tu nombre, teléfono, direcciones y tarjetas guardadas en cualquier momento desde tu perfil.',
      'Si quieres eliminar tu cuenta y todos tus datos, escríbenos a consejeria@peques.com desde el correo de tu cuenta y lo haremos en un plazo máximo de 30 días.',
    ],
  },
  {
    title: 'Seguridad',
    paragraphs: [
      'Las contraseñas se guardan cifradas y la comunicación con nuestros servidores viaja por conexiones seguras (HTTPS). Aun así, ningún sistema es infalible, por lo que te recomendamos usar una contraseña única para tu cuenta.',
    ],
  },
  {
    title: 'Contacto',
    paragraphs: [
      'Si tienes dudas sobre esta política o sobre tus datos, escríbenos a consejeria@peques.com.',
    ],
  },
];

function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Información legal"
      title="Política de Privacidad"
      updatedAt="octubre de 2026"
      sections={SECTIONS}
    />
  );
}

export default PrivacyPage;

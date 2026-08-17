// Marca de PEQUES (la abeja del logo) dibujada en SVG, sin fondo, para usarse
// como icono pequeño (encabezado de la tarjeta de Login/Register en movil).
function PequesBeeIcon({ size = 44, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <ellipse cx="19" cy="15" rx="7.5" ry="4.2" transform="rotate(-24 19 15)" />
      <ellipse cx="29" cy="14" rx="8" ry="4.6" transform="rotate(18 29 14)" />
      <ellipse cx="26" cy="26" rx="12.5" ry="7.5" />
      <line x1="19" y1="18.2" x2="19" y2="33.8" />
      <line x1="26" y1="18.5" x2="26" y2="33.5" />
      <line x1="33" y1="19.5" x2="33" y2="32.5" />
      <circle cx="11.5" cy="26" r="4.3" />
      <path d="M9 22.3 C 7.5 19, 8.7 16, 8.7 16" />
      <path d="M13.5 22.3 C 14.6 19, 13.6 16, 13.6 16" />
      <line x1="38.5" y1="26" x2="43" y2="26" />
      <path d="M8.5 12 L9.7 8.6 L11.5 11.2 L13.3 8.6 L14.5 12" />
    </svg>
  );
}

export default PequesBeeIcon;

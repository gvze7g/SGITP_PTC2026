import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';

const CRAFT_ITEMS = [
  {
    number: '01. Material',
    text: 'Abastecimiento de lino organico certificado GOTS y cachemira de molinos tradicionales que respetan la tierra.',
    image: 'https://images.unsplash.com/photo-1634665810235-011d663754e7?auto=format&fit=crop&w=900&q=90',
  },
  {
    number: '02. Precision',
    text: 'Cada costura es una decision arquitectonica. Utilizamos costuras francesas y puntadas reforzadas para garantizar durabilidad.',
    image: 'https://wc1.prod3.arlocdn.net/p/81fd41a474ea4c08b097e6e81d400d3d/d/RKTcnODTOQzgNn3oLbgeonGQf7QpxUWkQ78m0SzKnyYdHHen/j-williams-ehePIW7RA2g-unsplash.jpg',
  },
  {
    number: '03. Etica',
    text: 'Producido en pequenos lotes en nuestro taller europeo para garantizar salarios justos y cero desperdicio textil.',
    image: 'https://images.unsplash.com/photo-1613144744918-3d38db15a7e7?auto=format&fit=crop&w=900&q=90',
  },
];

function AboutPage() {
  return (
    <div className="about-page">
      <PublicNavbar activeItem="about" />

      <main className="about-content">
        <section className="about-hero">
          <h1>
            Acerca de
            <span>nosotros</span>
          </h1>

          <h2>Simplicidad arquitectonica para el guardarropa del bebe.</h2>

          <div className="about-copy-grid">
            <p>
              Peques nacio del deseo de romper con el lenguaje visual tradicional de la infancia.
              Creemos que el entorno y las prendas de un bebe deben reflejar el mismo rigor
              arquitectonico y la misma integridad material que un espacio de galeria.
            </p>
            <p>
              Nuestras piezas no estan disenadas como tendencias, sino como objetos cuidadosamente
              seleccionados. Priorizamos la geometria de la silueta y la honestidad tactil de los
              textiles naturales, asegurando que cada prenda sea una compania silenciosa en el
              crecimiento.
            </p>
          </div>
        </section>

        <section className="craft-section">
          <h2>Trabajo Artesanal</h2>

          <div className="craft-grid">
            {CRAFT_ITEMS.map((item) => (
              <article key={item.number} className="craft-card">
                <img src={item.image} alt={item.number} />
                <h3>{item.number}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default AboutPage;

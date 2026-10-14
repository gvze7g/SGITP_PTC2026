import PublicFooter from '../home/PublicFooter';
import PublicNavbar from '../home/PublicNavbar';

// Plantilla de las paginas legales (privacidad y terminos). Reusa los estilos
// de la pagina de Devoluciones (returns-*) para mantener la misma paleta,
// tipografia y modo oscuro sin duplicar CSS.
function LegalLayout({ eyebrow, title, updatedAt, sections }) {
  return (
    <div className="returns-page">
      <PublicNavbar />

      <main>
        <section className="returns-hero">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>Última actualización: {updatedAt}</p>
        </section>

        <section className="returns-faq">
          <div className="returns-faq-list">
            {sections.map((section) => (
              <article key={section.title}>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="legal-paragraph">
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default LegalLayout;

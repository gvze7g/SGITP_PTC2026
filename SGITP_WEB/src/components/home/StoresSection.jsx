const STORES = [
  {
    number: '01',
    name: 'Atelier Ebano - Valle del Lili',
    address: ['Calle 25 # 102 - 120', 'Cali, Valle del Cauca'],
    schedule: [
      ['Lunes - Sabado', '10:00 - 19:00'],
      ['Domingo', '11:00 - 17:00'],
    ],
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=85',
  },
  {
    number: '02',
    name: 'Atelier Ebano - La Flora',
    address: ['Avenida 6N # 47 - 10', 'Cali, Valle del Cauca'],
    schedule: [
      ['Lunes - Sabado', '09:30 - 20:00'],
      ['Domingo', 'Cerrado'],
    ],
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
  },
];

function StoresSection() {
  return (
    <section className="public-section stores-section" id="tiendas">
      <h2 className="public-section-title">Tiendas Fisicas</h2>

      <div className="stores-grid">
        {STORES.map((store) => (
          <article key={store.name} className="store-card">
            <img src={store.image} alt={store.name} />

            <div className="store-title-row">
              <h3>{store.name}</h3>
              <span>{store.number}</span>
            </div>

            <div className="store-meta-grid">
              <div>
                <h4>Direccion</h4>
                {store.address.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              <div>
                <h4>Horario</h4>
                {store.schedule.map(([day, hour]) => (
                  <p key={day}>
                    <span>{day}</span>
                    <strong>{hour}</strong>
                  </p>
                ))}
              </div>
            </div>

            <button type="button" className="store-map-link">
              Ver en mapa <span>↗</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StoresSection;

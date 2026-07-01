function CollectionIntro() {
  return (
    <section className="collection-intro">
      <h1>Coleccion Permanente</h1>

      <nav className="collection-tabs" aria-label="Opciones de coleccion">
        <button type="button" className="collection-tab-active">
          Comprar
        </button>
        <button type="button">Revista</button>
        <button type="button">Coleccion</button>
      </nav>

      <div className="collection-feature">
        <img
          src="https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=1200&q=90"
          alt="Bebe descansando con ropa Peques"
        />
        <span>Nuevos productos</span>
      </div>
    </section>
  );
}

export default CollectionIntro;

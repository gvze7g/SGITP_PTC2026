const PRODUCTS = [
  {
    name: 'Abrigo estructurado',
    material: 'Lana virgen',
    price: '$290',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Triptico acanalado',
    material: 'Algodon pima organico',
    price: '$95',
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Manta de coleccion',
    material: 'Cachemira reciclada',
    price: '$320',
    image: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Abrigo estructurado',
    material: 'Lana virgen',
    price: '$290',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Triptico acanalado',
    material: 'Algodon pima organico',
    price: '$95',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=700&q=85',
  },
];

function ProductRail() {
  return (
    <section className="public-section" id="ropa">
      <h2 className="public-section-title">¡En tendencia ahora mismo!</h2>

      <div className="product-rail">
        {PRODUCTS.map((product, index) => (
          <article key={`${product.name}-${index}`} className="product-card">
            <img src={product.image} alt={product.name} />
            <div className="product-card-info">
              <div>
                <h3>{product.name}</h3>
                <p>{product.material}</p>
              </div>
              <span>{product.price}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProductRail;

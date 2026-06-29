function ProductCatalogCard({ image, title, meta, price }) {
  return (
    <article className="catalog-card">
      <img src={image} alt={title} className="catalog-card-image" />

      <h3 className="catalog-card-title">{title}</h3>
      <p className="catalog-card-meta">{meta}</p>
      <span className="catalog-card-price">{price}</span>
    </article>
  );
}

export default ProductCatalogCard;
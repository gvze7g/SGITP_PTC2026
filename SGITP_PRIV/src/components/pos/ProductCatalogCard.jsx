function ProductCatalogCard({ image, title, meta, price, disabled, onClick }) {
  return (
    <article
      className="catalog-card"
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <img src={image} alt={title} className="catalog-card-image" />

      <h3 className="catalog-card-title">{title}</h3>
      <p className="catalog-card-meta">{disabled ? "Sin stock" : meta}</p>
      <span className="catalog-card-price">{price}</span>
    </article>
  );
}

export default ProductCatalogCard;
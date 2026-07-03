import { CalendarDays, Pencil, Trash2 } from "lucide-react";

function PromotionsGrid({
  promotions = [],
  loading,
  onEditPromotion,
  onDeactivatePromotion,
  onDeletePromotion,
}) {
  // convertir estado a texto visible
  const getStatusLabel = (promotion) => {
    return promotion?.isActive ? "Activo" : "Inactivo";
  };

  // texto del descuento
  const getDiscountLabel = (promotion) => {
    return `${Number(promotion?.discount_percentage || 0)}% de descuento`;
  };

  // rango de fechas
  const getDateRange = (promotion) => {
    const start = promotion?.start_date
      ? new Date(promotion.start_date).toLocaleDateString()
      : "Sin inicio";

    const end = promotion?.end_date
      ? new Date(promotion.end_date).toLocaleDateString()
      : "Sin fin";

    return `${start} - ${end}`;
  };

  const activeCount = promotions.filter((promotion) => promotion.isActive).length;

  return (
    <section className="promotions-page">
      <div className="promotions-summary-block">
        <span>CÓDIGOS ACTIVOS</span>
        <strong>{activeCount}</strong>
      </div>

      {loading ? (
        <div style={{ padding: "20px" }}>Cargando promociones...</div>
      ) : promotions.length === 0 ? (
        <div style={{ padding: "20px" }}>No hay promociones registradas.</div>
      ) : (
        <div className="promotions-grid">
          {promotions.map((promotion) => (
            <article
              key={promotion._id}
              className={`promotion-card ${
                !promotion.isActive ? "promotion-card-expired" : ""
              }`}
            >
              <div className="promotion-card-top">
                <h3>#{promotion.coupon_code}</h3>
                <span className="promotion-status-badge">
                  {getStatusLabel(promotion)}
                </span>
              </div>

              <p className="promotion-discount-text">
                {getDiscountLabel(promotion)}
              </p>

              <div className="promotion-date-row">
                <CalendarDays size={18} strokeWidth={1.8} />
                <span>{getDateRange(promotion)}</span>
              </div>

              <div className="promotion-usage-block">
                <div className="promotion-usage-top">
                  <span>DESCRIPCIÓN</span>
                  <span>{promotion.descriptions || "Sin descripción"}</span>
                </div>
              </div>

              <div
                className="promotion-card-footer"
                style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
              >
                <button
                  type="button"
                  onClick={() => onEditPromotion?.(promotion)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Pencil size={14} />
                  EDITAR
                </button>

                {promotion.isActive && (
                  <button
                    type="button"
                    onClick={() => onDeactivatePromotion?.(promotion)}
                  >
                    DESACTIVAR
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDeletePromotion?.(promotion)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={14} />
                  ELIMINAR
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PromotionsGrid;
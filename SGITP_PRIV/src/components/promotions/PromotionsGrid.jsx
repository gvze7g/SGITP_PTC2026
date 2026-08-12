import { CalendarDays, Pencil, Power, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;

function PromotionsGrid({
  promotions = [],
  loading,
  onEditPromotion,
  onDeactivatePromotion,
  onDeletePromotion,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(promotions.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedPromotions = useMemo(
    () => promotions.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [promotions, startIndex]
  );
  const showingFrom = promotions.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedPromotions.length, promotions.length);

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

  // descripción visible
  const getDescriptionLabel = (promotion) => {
    if (!promotion?.descriptions?.trim()) {
      return "Sin descripción";
    }

    return promotion.descriptions.trim();
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
          {paginatedPromotions.map((promotion) => (
            <article
              key={promotion._id}
              className={`promotion-card ${
                !promotion.isActive ? "promotion-card-expired" : ""
              }`}
            >
              <div className="promotion-card-top">
                <h3>{promotion.coupon_code}</h3>

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
                <span className="promotion-description-label">DESCRIPCIÓN</span>

                <p className="promotion-description-text">
                  {getDescriptionLabel(promotion)}
                </p>
              </div>

              <div className="promotion-card-footer">
                <button
                  type="button"
                  className="promotion-action-btn"
                  onClick={() => onEditPromotion?.(promotion)}
                >
                  <Pencil size={14} />
                  <span>EDITAR</span>
                </button>

                {promotion.isActive && (
                  <button
                    type="button"
                    className="promotion-action-btn"
                    onClick={() => onDeactivatePromotion?.(promotion)}
                  >
                    <Power size={14} />
                    <span>DESACTIVAR</span>
                  </button>
                )}

                <button
                  type="button"
                  className="promotion-action-btn"
                  onClick={() => onDeletePromotion?.(promotion)}
                >
                  <Trash2 size={14} />
                  <span>ELIMINAR</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="promotions-footer">
        <p>
          Mostrando {showingFrom} a {showingTo} de {promotions.length} promociones
        </p>

        <div className="promotions-pagination">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
            aria-label="Pagina anterior"
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              type="button"
              className={safePage === index + 1 ? "promotions-page-active" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safePage === totalPages}
            aria-label="Pagina siguiente"
          >
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default PromotionsGrid;

import { CalendarDays } from 'lucide-react';

const PROMOTIONS = [
  {
    id: 1,
    code: '#MAMAPRIMERIZA',
    status: 'Activo',
    discount: '-20% de descuento',
    dateRange: '1 Oct - 31 Oct',
    usage: '45 / 100 usados',
    type: 'Porcentaje',
    value: '20',
    startDate: '10/01/2023',
    endDate: '10/31/2023',
    minimumPurchase: '0.00',
    usageLimit: '100',
  },
  {
    id: 2,
    code: '#BIENVENIDA',
    status: 'Activo',
    discount: 'Envío Gratis',
    dateRange: 'Permanente',
    usage: '812 / 10000 usados',
    type: 'Envío Gratis',
    value: '0',
    startDate: '01/01/2023',
    endDate: '',
    minimumPurchase: '0.00',
    usageLimit: '10000',
  },
  {
    id: 3,
    code: '#LUXURYBABY',
    status: 'Activo',
    discount: '-$50 Fijos (Min $200)',
    dateRange: '15 Oct - 15 Nov',
    usage: '12 / 50 usados',
    type: 'Monto fijo',
    value: '50',
    startDate: '10/15/2023',
    endDate: '11/15/2023',
    minimumPurchase: '200.00',
    usageLimit: '50',
  },
  {
    id: 4,
    code: '#FLASH15',
    status: 'Expirado',
    discount: '-15% de descuento',
    dateRange: '1 Sep - 2 Sep',
    usage: '100 / 100 usados',
    type: 'Porcentaje',
    value: '15',
    startDate: '09/01/2023',
    endDate: '09/02/2023',
    minimumPurchase: '0.00',
    usageLimit: '100',
  },
];

function PromotionsGrid({ onEditPromotion, onDeactivatePromotion }) {
  return (
    <section className="promotions-page">
      <div className="promotions-summary-block">
        <span>CÓDIGOS ACTIVOS</span>
        <strong>{PROMOTIONS.filter((p) => p.status !== 'Expirado').length}</strong>
      </div>

      <div className="promotions-grid">
        {PROMOTIONS.map((promotion) => (
          <article
            key={promotion.id}
            className={`promotion-card ${promotion.status === 'Expirado' ? 'promotion-card-expired' : ''}`}
          >
            <div className="promotion-card-top">
              <h3>{promotion.code}</h3>
              <span className="promotion-status-badge">{promotion.status}</span>
            </div>

            <p className="promotion-discount-text">{promotion.discount}</p>

            <div className="promotion-date-row">
              <CalendarDays size={18} strokeWidth={1.8} />
              <span>{promotion.dateRange}</span>
            </div>

            <div className="promotion-usage-block">
              <div className="promotion-usage-top">
                <span>USOS</span>
                <span>{promotion.usage}</span>
              </div>
              <div className="promotion-usage-bar">
                <div className="promotion-usage-fill" />
              </div>
            </div>

            <div className="promotion-card-footer">
              {promotion.status !== 'Expirado' ? (
                <>
                  <button type="button" onClick={() => onEditPromotion?.(promotion)}>
                    EDITAR
                  </button>

                  <button type="button" onClick={() => onDeactivatePromotion?.(promotion)}>
                    DESACTIVAR
                  </button>
                </>
              ) : (
                <button type="button">VER DETALLES</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PromotionsGrid;
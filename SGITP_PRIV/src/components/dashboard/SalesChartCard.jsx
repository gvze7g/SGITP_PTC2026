function SalesChartCard() {
  return (
    <section className="panel-card chart-card">
      <div className="chart-card-header">
        <h3 className="panel-title">Gráfico de Ingresos</h3>

        <div className="chart-periods">
          <button type="button" className="chart-period-btn">Semana</button>
          <button type="button" className="chart-period-btn chart-period-btn-active">Mes</button>
          <button type="button" className="chart-period-btn">Año</button>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-line chart-line-1" />
        <div className="chart-line chart-line-2" />
        <div className="chart-line chart-line-3" />
        <div className="chart-line chart-line-4" />
        <div className="chart-line chart-line-5" />

        <svg
          className="income-chart-svg"
          viewBox="0 0 860 430"
          preserveAspectRatio="none"
        >
          <path
            className="income-chart-path"
            d="M40 330
               C100 285, 150 350, 220 285
               C280 220, 300 110, 385 120
               C450 128, 480 155, 530 125
               C575 100, 650 250, 730 225
               C780 210, 810 120, 860 70"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div className="chart-label chart-label-1">01 Oct</div>
        <div className="chart-label chart-label-2">08 Oct</div>
        <div className="chart-label chart-label-3">15 Oct</div>
        <div className="chart-label chart-label-4">22 Oct</div>
        <div className="chart-label chart-label-5">29 Oct</div>
      </div>
    </section>
  );
}

export default SalesChartCard;
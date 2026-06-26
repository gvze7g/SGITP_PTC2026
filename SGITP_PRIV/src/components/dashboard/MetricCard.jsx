function MetricCard({ title, value }) {
  return (
    <div className="metric-card">
      <span className="metric-card-label">{title}</span>
      <h3 className="metric-card-value">{value}</h3>
    </div>
  );
}

export default MetricCard;
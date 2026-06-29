import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const WEEK_DATA = [
  { label: 'Lun', ingresos: 420 },
  { label: 'Mar', ingresos: 520 },
  { label: 'Mié', ingresos: 610 },
  { label: 'Jue', ingresos: 590 },
  { label: 'Vie', ingresos: 760 },
  { label: 'Sáb', ingresos: 820 },
  { label: 'Dom', ingresos: 690 },
];

const MONTH_DATA = [
  { label: '01 Oct', ingresos: 380 },
  { label: '08 Oct', ingresos: 520 },
  { label: '15 Oct', ingresos: 860 },
  { label: '22 Oct', ingresos: 640 },
  { label: '29 Oct', ingresos: 980 },
];

const YEAR_DATA = [
  { label: 'Ene', ingresos: 2400 },
  { label: 'Mar', ingresos: 3100 },
  { label: 'May', ingresos: 4200 },
  { label: 'Jul', ingresos: 3900 },
  { label: 'Sep', ingresos: 5100 },
  { label: 'Nov', ingresos: 6200 },
];

function SalesChartCard() {
  const [period, setPeriod] = useState('month');

  const chartData = useMemo(() => {
    if (period === 'week') return WEEK_DATA;
    if (period === 'year') return YEAR_DATA;
    return MONTH_DATA;
  }, [period]);

  return (
    <motion.section
      className="panel-card chart-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="chart-card-header">
        <h3 className="panel-title">Gráfico de Ingresos</h3>

        <div className="chart-periods">
          <button
            type="button"
            className={`chart-period-btn ${period === 'week' ? 'chart-period-btn-active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Semana
          </button>
          <button
            type="button"
            className={`chart-period-btn ${period === 'month' ? 'chart-period-btn-active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Mes
          </button>
          <button
            type="button"
            className={`chart-period-btn ${period === 'year' ? 'chart-period-btn-active' : ''}`}
            onClick={() => setPeriod('year')}
          >
            Año
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -20, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(120, 106, 97, 0.18)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#7b6f69', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#7b6f69', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ stroke: '#b88e72', strokeWidth: 1 }}
              contentStyle={{
                borderRadius: '14px',
                border: '1px solid rgba(184, 142, 114, 0.25)',
                background: '#fffaf7',
                boxShadow: '0 12px 30px rgba(61, 52, 48, 0.10)',
              }}
              formatter={(value) => [`$${value}`, 'Ingresos']}
              labelStyle={{ color: '#3d3430', fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="ingresos"
              stroke="#b88e72"
              strokeWidth={4}
              dot={{ r: 4, fill: '#b88e72', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#8f6b55' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

export default SalesChartCard;
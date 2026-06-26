import { Clock3, MapPin } from 'lucide-react';

const BRANCHES = [
  {
    id: 1,
    name: 'Boutique principal',
    status: 'OPERATIVA',
    address: 'Av. Las Magnolias 123, Zona Financiera',
    hours: 'Lun - Sab: 10:00 AM - 8:00 PM',
    managerLabel: 'MANAGER',
    manager: 'Carmen Vega',
    type: 'Sucursal',
    phone: '+503 2234-5678',
  },
  {
    id: 2,
    name: 'Kiosco mall central',
    status: 'REMODELACIÓN',
    address: 'Nivel 2, Pasillo Central, C.C. Mall Central',
    hours: 'Temporalmente cerrado',
    managerLabel: 'MANAGER',
    manager: 'Javier Soto',
    type: 'Kiosco',
    phone: '+503 2211-4455',
  },
  {
    id: 3,
    name: 'Bodega general',
    status: 'OPERATIVA',
    address: 'Parque Industrial Sur, Nave 4',
    hours: 'Lun - Vie: 8:00 AM - 5:00 PM',
    managerLabel: 'Logistica',
    manager: 'Equipo central',
    type: 'Bodega',
    phone: '+503 2299-8877',
  },
];

function BranchesGrid({ onEditBranch, onViewInventory }) {
  return (
    <section className="branches-page">
      <div className="branches-stats-grid">
        <div className="branches-stat-block">
          <span>SUCURSALES ACTIVAS</span>
          <strong>3</strong>
        </div>

        <div className="branches-stat-block">
          <span>EMPLEADOS TOTALES</span>
          <strong>12</strong>
        </div>
      </div>

      <div className="branches-grid">
        {BRANCHES.map((branch) => (
          <article key={branch.id} className="branch-card">
            <div className="branch-card-top">
              <h3>{branch.name}</h3>
              <span className="branch-status-badge">{branch.status}</span>
            </div>

            <div className="branch-info-row">
              <MapPin size={22} strokeWidth={1.8} />
              <p>{branch.address}</p>
            </div>

            <div className="branch-info-row branch-info-row-bordered">
              <Clock3 size={22} strokeWidth={1.8} />
              <p>{branch.hours}</p>
            </div>

            <div className="branch-manager-block">
              <span>{branch.managerLabel}</span>
              <strong>{branch.manager}</strong>
            </div>

            <div className="branch-card-footer">
              <button type="button" onClick={() => onEditBranch?.(branch)}>
                Editar detalles
              </button>

              <button type="button" onClick={onViewInventory}>
                Ver inventario
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BranchesGrid;
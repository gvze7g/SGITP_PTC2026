import { Pencil, Trash2 } from 'lucide-react';

const EMPLOYEES = [
  {
    id: 1,
    fullName: 'Paul Urquilla',
    role: 'Administrador',
    branch: 'Merliot',
    status: 'Activo',
    email: 'paul.urquilla@peques.com',
    phone: '7654-1200',
    hireDate: '15/02/2023',
    birthDate: '10/08/1995',
    temporaryPassword: 'Temp1234',
  },
  {
    id: 2,
    fullName: 'Leonel Adrian',
    role: 'Cajero',
    branch: 'Plaza mundo',
    status: 'Activo',
    email: 'leonel.adrian@peques.com',
    phone: '7123-4590',
    hireDate: '09/05/2023',
    birthDate: '22/11/1999',
    temporaryPassword: 'Caja2024',
  },
  {
    id: 3,
    fullName: 'Eduardo Galvez',
    role: 'Bodeguero',
    branch: 'La Gran vía',
    status: 'Inactivo',
    email: 'eduardo.galvez@peques.com',
    phone: '7011-8822',
    hireDate: '18/01/2022',
    birthDate: '03/04/1993',
    temporaryPassword: 'Bodega321',
  },
];

function EmployeesTable({ onOpenDeleteModal, onEditEmployee }) {
  return (
    <section className="employees-panel">
      <div className="employees-table-wrap">
        <div className="employees-head-row">
          <span>EMPLEADO</span>
          <span>CARGO/ROL</span>
          <span>SUCURSAL ASIGNADA</span>
          <span>ESTADO</span>
          <span>ACCIONES</span>
        </div>

        {EMPLOYEES.map((employee) => (
          <article key={employee.id} className="employees-row">
            <div className="employees-name-cell">{employee.fullName}</div>
            <div className="employees-role-cell">{employee.role}</div>
            <div className="employees-branch-cell">{employee.branch}</div>
            <div className="employees-status-cell">{employee.status}</div>

            <div className="employees-actions-cell">
              <button
                type="button"
                className="employees-action-icon"
                onClick={() => onEditEmployee?.(employee)}
              >
                <Pencil size={20} strokeWidth={2} />
              </button>

              <button
                type="button"
                className="employees-action-icon"
                onClick={onOpenDeleteModal}
              >
                <Trash2 size={20} strokeWidth={2} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="employees-footer">
        <p>Mostrando 1 a 10</p>

        <div className="employees-pagination">
          <button type="button">‹</button>
          <button type="button" className="employees-page-active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">›</button>
        </div>
      </div>
    </section>
  );
}

export default EmployeesTable;
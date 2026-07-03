import { Pencil, Trash2 } from "lucide-react";

function EmployeesTable({
  employees = [],
  loading,
  onEditEmployee,
  onDeleteEmployee,
}) {
  const getBranchName = (employee) => {
    if (employee?.branch_id && typeof employee.branch_id === "object") {
      return employee.branch_id.name || "Sucursal asignada";
    }

    if (typeof employee?.branch_id === "string" && employee.branch_id.trim()) {
      return employee.branch_id;
    }

    return "No asignada";
  };

  const getStatusLabel = (employee) => {
    return employee?.isVerified ? "Activo" : "Pendiente";
  };

  const getRoleLabel = (role) => {
    if (role === "Administrator") return "Administrador";
    if (role === "Employee") return "Empleado";
    return role || "Sin rol";
  };

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

        {loading ? (
          <div style={{ padding: "20px" }}>Cargando empleados...</div>
        ) : employees.length === 0 ? (
          <div style={{ padding: "20px" }}>No hay empleados registrados.</div>
        ) : (
          employees.map((employee) => (
            <article key={employee._id} className="employees-row">
              <div className="employees-name-cell">{employee.full_name}</div>
              <div className="employees-role-cell">{getRoleLabel(employee.role)}</div>
              <div className="employees-branch-cell">{getBranchName(employee)}</div>
              <div className="employees-status-cell">{getStatusLabel(employee)}</div>

              <div className="employees-actions-cell">
                <button
                  type="button"
                  className="employees-action-icon"
                  onClick={() => onEditEmployee?.(employee)}
                  aria-label="Editar empleado"
                >
                  <Pencil size={20} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  className="employees-action-icon"
                  onClick={() => onDeleteEmployee?.(employee)}
                  aria-label="Eliminar empleado"
                >
                  <Trash2 size={20} strokeWidth={2} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="employees-footer">
        <p>Mostrando {employees.length} empleados</p>

        <div className="employees-pagination">
          <button type="button">‹</button>
          <button type="button" className="employees-page-active">
            1
          </button>
          <button type="button">›</button>
        </div>
      </div>
    </section>
  );
}

export default EmployeesTable;
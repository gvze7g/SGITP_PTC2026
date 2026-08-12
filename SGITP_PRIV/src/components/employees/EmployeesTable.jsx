import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;

function EmployeesTable({
  employees = [],
  loading,
  onEditEmployee,
  onDeleteEmployee,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(employees.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = useMemo(
    () => employees.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [employees, startIndex]
  );
  const showingFrom = employees.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedEmployees.length, employees.length);

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
          paginatedEmployees.map((employee) => (
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
        <p>
          Mostrando {showingFrom} a {showingTo} de {employees.length} empleados
        </p>

        <div className="employees-pagination">
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
              className={safePage === index + 1 ? "employees-page-active" : ""}
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

export default EmployeesTable;

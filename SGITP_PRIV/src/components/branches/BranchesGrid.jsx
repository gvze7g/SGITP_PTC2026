import { Clock3, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;

function BranchesGrid({
  branches = [],
  loading = false,
  error = "",
  onEditBranch,
  onDeleteBranch,
  onViewInventory,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const activeBranches = branches.filter((branch) => branch.isActive !== false).length;
  const totalPages = Math.max(1, Math.ceil(branches.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedBranches = useMemo(
    () => branches.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [branches, startIndex]
  );
  const showingFrom = branches.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedBranches.length, branches.length);

  return (
    <section className="branches-page">
      <div className="branches-stats-grid">
        <div className="branches-stat-block">
          <span>SUCURSALES ACTIVAS</span>
          <strong>{activeBranches}</strong>
        </div>

        <div className="branches-stat-block">
          <span>SUCURSALES TOTALES</span>
          <strong>{branches.length}</strong>
        </div>
      </div>

      {error ? <p className="admin-error-text">{error}</p> : null}
      {loading ? <p className="admin-muted-text">Cargando sucursales...</p> : null}

      <div className="branches-grid">
        {!loading && branches.length === 0 ? (
          <p className="admin-muted-text">No hay sucursales registradas.</p>
        ) : null}

        {paginatedBranches.map((branch) => (
          <article key={branch._id} className="branch-card">
            <div className="branch-card-top">
              <h3>{branch.name}</h3>
              <span className="branch-status-badge">
                {branch.isActive === false ? "INACTIVA" : "OPERATIVA"}
              </span>
            </div>

            <div className="branch-info-row">
              <MapPin size={22} strokeWidth={1.8} />
              <p>{branch.address || "Direccion no registrada"}</p>
            </div>

            <div className="branch-info-row branch-info-row-bordered">
              <Clock3 size={22} strokeWidth={1.8} />
              <p>
                {branch.opening_date
                  ? `Apertura: ${new Date(branch.opening_date).toLocaleDateString()}`
                  : "Fecha de apertura no registrada"}
              </p>
            </div>

            <div className="branch-manager-block">
              <span>CONTACTO</span>
              <strong>{branch.phone || branch.email || "Sin contacto"}</strong>
            </div>

            <div className="branch-card-footer">
              <button type="button" onClick={() => onEditBranch?.(branch)}>
                Editar detalles
              </button>

              <button type="button" onClick={onViewInventory}>
                Ver inventario
              </button>

              <button type="button" onClick={() => onDeleteBranch?.(branch)}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="branches-footer">
        <p>
          Mostrando {showingFrom} a {showingTo} de {branches.length} sucursales
        </p>

        <div className="branches-pagination">
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
              className={safePage === index + 1 ? "branches-page-active" : ""}
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

export default BranchesGrid;

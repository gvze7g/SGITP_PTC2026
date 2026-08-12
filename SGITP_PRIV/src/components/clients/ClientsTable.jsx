import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;

function ClientsTable({
  clients = [],
  loading = false,
  error = "",
  onEditClient,
  onDeleteClient,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(clients.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = useMemo(
    () => clients.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [clients, startIndex]
  );
  const showingFrom = clients.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedClients.length, clients.length);

  const getClientTypeLabel = (type) => {
    if (type === "Client") return "Cliente";
    if (type === "Wholesale") return "Mayorista";
    return type || "Cliente";
  };

  const getPrimaryPhone = (client) => {
    if (client.main_phone) return client.main_phone;
    const primaryPhone = client.phone_numbers?.find((phone) => phone.isPrimary);
    return primaryPhone?.number || client.phone_numbers?.[0]?.number || "-";
  };

  const getAddressLabel = (client) => {
    const primaryAddress = client.addresses?.find((address) => address.isPrimary);
    return primaryAddress?.label || client.addresses?.[0]?.label || "-";
  };

  return (
    <section className="clients-panel">
      {error ? <p className="admin-error-text">{error}</p> : null}
      {loading ? <p className="admin-muted-text">Cargando clientes...</p> : null}

      <div className="clients-table-wrap">
        <div className="clients-head-row">
          <span>NOMBRE</span>
          <span>TIPO</span>
          <span>CONTACTO</span>
          <span>DIRECCIONES</span>
          <span>ACCIONES</span>
        </div>

        {!loading && clients.length === 0 ? (
          <div className="clients-row">
            <div className="clients-name-cell">No hay clientes registrados.</div>
          </div>
        ) : null}

        {paginatedClients.map((client) => (
          <article key={client._id} className="clients-row">
            <div className="clients-name-cell">{client.full_name || "-"}</div>

            <div className="clients-type-cell">
              <span className="clients-type-badge">
                {getClientTypeLabel(client.customer_type)}
              </span>
            </div>

            <div className="clients-contact-cell">
              <p>{getPrimaryPhone(client)}</p>
              <p>{client.email || "-"}</p>
            </div>

            <div className="clients-address-cell">{getAddressLabel(client)}</div>

            <div className="clients-actions-cell">
              <button
                type="button"
                className="clients-action-icon"
                onClick={() => onEditClient?.(client)}
                aria-label="Editar cliente"
              >
                <Pencil size={20} strokeWidth={2} />
              </button>

              <button
                type="button"
                className="clients-action-icon"
                onClick={() => onDeleteClient?.(client)}
                aria-label="Eliminar cliente"
              >
                <Trash2 size={20} strokeWidth={2} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="clients-footer">
        <p>
          Mostrando {showingFrom} a {showingTo} de {clients.length} clientes
        </p>

        <div className="clients-pagination">
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
              className={safePage === index + 1 ? "clients-page-active" : ""}
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

export default ClientsTable;

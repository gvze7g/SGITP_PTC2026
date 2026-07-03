import { Pencil, Trash2 } from "lucide-react";

function ClientsTable({
  clients = [],
  loading = false,
  error = "",
  onEditClient,
  onDeleteClient,
}) {
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

        {clients.map((client) => (
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
        <p>Mostrando {clients.length} clientes</p>
      </div>
    </section>
  );
}

export default ClientsTable;

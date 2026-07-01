import { Pencil, Trash2 } from 'lucide-react';

const CLIENTS = [
  {
    id: 1,
    fullName: 'Paul Urquilla',
    type: 'Mayorista',
    phone: '+503 4343-4343',
    email: 'sofia.v@editorial.com',
    addressLabel: 'Casa',
    phones: ['+503 4343-4343'],
    addresses: [
      {
        label: 'Casa',
        street: 'Colonia Escalón #12',
        city: 'San Salvador',
        reference: 'Frente al parque',
      },
    ],
  },
  {
    id: 2,
    fullName: 'Leonel Adrian',
    type: 'Mayorista',
    phone: '+503 4343-4343',
    email: 'sofia.v@editorial.com',
    addressLabel: 'Oficina',
    phones: ['+503 4343-4343'],
    addresses: [
      {
        label: 'Oficina',
        street: 'Avenida Olímpica 45',
        city: 'San Salvador',
        reference: 'Edificio azul',
      },
    ],
  },
  {
    id: 3,
    fullName: 'Eduardo Galvez',
    type: 'Mayorista',
    phone: '+503 4343-4343',
    email: 'sofia.v@editorial.com',
    addressLabel: 'Casa',
    phones: ['+503 4343-4343'],
    addresses: [
      {
        label: 'Casa',
        street: 'Residencial Las Flores',
        city: 'Santa Tecla',
        reference: 'Portón negro',
      },
    ],
  },
];

function ClientsTable({ onEditClient, onDeleteClient }) {
  return (
    <section className="clients-panel">
      <div className="clients-table-wrap">
        <div className="clients-head-row">
          <span>NOMBRE</span>
          <span>TIPO</span>
          <span>CONTACTO</span>
          <span>DIRECCIONES</span>
          <span>ACCIONES</span>
        </div>

        {CLIENTS.map((client) => (
          <article key={client.id} className="clients-row">
            <div className="clients-name-cell">{client.fullName}</div>

            <div className="clients-type-cell">
              <span className="clients-type-badge">{client.type}</span>
            </div>

            <div className="clients-contact-cell">
              <p>{client.phone}</p>
              <p>{client.email}</p>
            </div>

            <div className="clients-address-cell">{client.addressLabel}</div>

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
                onClick={onDeleteClient}
                aria-label="Eliminar cliente"
              >
                <Trash2 size={20} strokeWidth={2} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="clients-footer">
        <p>Mostrando 1 a 10</p>

        <div className="clients-pagination">
          <button type="button">‹</button>
          <button type="button" className="clients-page-active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">›</button>
        </div>
      </div>
    </section>
  );
}

export default ClientsTable;
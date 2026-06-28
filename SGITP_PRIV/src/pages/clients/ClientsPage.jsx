import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ClientsTable from '../../components/clients/ClientsTable';
import ClientFormModal from '../../components/clients/ClientFormModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

function ClientsPage({ theme, onToggleTheme }) {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleCreate = () => {
    setSelectedClient(null);
    setClientModalOpen(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setClientModalOpen(true);
  };

  const handleCloseModal = () => {
    setClientModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="page-title-row">
        <h1 className="admin-page-title">Clientes</h1>

        <button type="button" className="admin-primary-btn" onClick={handleCreate}>
          + Nuevo cliente
        </button>
      </div>

      <ClientsTable
        onEditClient={handleEdit}
        onDeleteClient={() => setDeleteModalOpen(true)}
      />

      <ClientFormModal
        open={clientModalOpen}
        onClose={handleCloseModal}
        clientData={selectedClient}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setDeleteModalOpen(false);
          toast.success('Cliente eliminado correctamente.');
        }}
      />
    </DashboardLayout>
  );
}

export default ClientsPage;
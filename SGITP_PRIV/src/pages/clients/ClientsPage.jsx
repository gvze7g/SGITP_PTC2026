import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ClientsTable from '../../components/clients/ClientsTable';
import ClientFormModal from '../../components/clients/ClientFormModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import useClients from '../../hooks/clients/UseClients';

function ClientsPage({ theme, onToggleTheme }) {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const { clients, loading, error, getClients, updateClient, deleteClient } = useClients();

  useEffect(() => {
    getClients();
  }, [getClients]);

  const handleEdit = (client) => {
    setSelectedClient(client);
    setClientModalOpen(true);
  };

  const handleCloseModal = () => {
    setClientModalOpen(false);
    setSelectedClient(null);
  };

  const handleAskDelete = (client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (!payload.full_name || payload.full_name.length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    const result = await updateClient(selectedClient._id, payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Cliente actualizado correctamente.');
    handleCloseModal();
    getClients();
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    const result = await deleteClient(clientToDelete._id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    setDeleteModalOpen(false);
    setClientToDelete(null);
    toast.success('Cliente eliminado correctamente.');
    getClients();
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <motion.div
        className="clients-page-shell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="page-title-row">
          <h1 className="admin-page-title">Clientes</h1>
        </div>

        <ClientsTable
          clients={clients}
          loading={loading}
          error={error}
          onEditClient={handleEdit}
          onDeleteClient={handleAskDelete}
        />
      </motion.div>

      <ClientFormModal
        open={clientModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSave}
        clientData={selectedClient}
        isSaving={loading}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}

export default ClientsPage;

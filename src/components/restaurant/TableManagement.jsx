import { useState, useEffect } from 'react';
import { Plus, Loader2, Ban } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getTables, createTable, updateTable, deleteTable } from '@/services/tablesApi';
import { TableCard } from '@/components/restaurant/TableCard';
import { TableModal } from '@/components/restaurant/TableModal';
import { BlockSlotModal } from '@/components/BlockSlotModal';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

export default function TableManagement() {
  const { token, user } = useAuthStore();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await getTables(token, user.business.slug);
      setTables(data.tables || []);
    } catch (error) {
      console.error('Error cargando mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = () => {
    setEditingTable(null);
    setShowModal(true);
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowModal(true);
  };

  const handleSaveTable = async (tableData) => {
    try {
      if (editingTable) {
        await updateTable(token, user.business.slug, editingTable.id, tableData);
      } else {
        await createTable(token, user.business.slug, tableData);
      }
      loadTables();
      setShowModal(false);
    } catch (error) {
      console.error('Error guardando mesa:', error);
      alert('Error al guardar la mesa');
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm('¿Estás seguro de eliminar esta mesa?')) return;

    try {
      await deleteTable(token, user.business.slug, tableId);
      loadTables();
    } catch (error) {
      console.error('Error eliminando mesa:', error);
      alert(error.response?.data?.error || 'Error al eliminar la mesa');
    }
  };

  const handleSaveBlock = async (blockData) => {
    try {
      await api.createBlockedSlot(blockData);
      console.log('✅ Bloqueo creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando bloqueo:', error);
      throw error;
    }
  };

  // Agrupar por tipo
  const salonTables = tables.filter(t => t.table_type === 'salon' && t.is_active);
  const terrazaTables = tables.filter(t => t.table_type === 'terraza' && t.is_active);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Mesas</h1>
          <p className="text-gray-600">Administra las mesas de tu restaurante</p>
        </div>
        <div className="flex gap-3">
          {/* ✅ BOTÓN BLOQUEAR */}
          <Button 
            onClick={() => setShowBlockModal(true)}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-900/20"
          >
            <Ban className="mr-2 h-4 w-4" />
            Bloquear Disponibilidad
          </Button>
          
          <Button onClick={handleCreateTable}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Mesa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-[#1a2f38] border border-gray-700 p-4 shadow">
          <p className="text-sm text-gray-400">Total Mesas</p>
          <p className="text-2xl font-bold text-white">{tables.length}</p>
        </div>
        <div className="rounded-lg bg-[#1a2f38] border border-gray-700 p-4 shadow">
          <p className="text-sm text-gray-400">Salón</p>
          <p className="text-2xl font-bold text-white">{salonTables.length}</p>
        </div>
        <div className="rounded-lg bg-[#1a2f38] border border-gray-700 p-4 shadow">
          <p className="text-sm text-gray-400">Terraza</p>
          <p className="text-2xl font-bold text-white">{terrazaTables.length}</p>
        </div>
        <div className="rounded-lg bg-[#1a2f38] border border-gray-700 p-4 shadow">
          <p className="text-sm text-gray-400">Capacidad Total</p>
          <p className="text-2xl font-bold text-white">
            {tables.reduce((sum, t) => sum + (t.capacity || 0), 0)}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {tables.length === 0 && (
        <div className="rounded-lg bg-[#1a2f38] border border-gray-700 p-12 text-center shadow">
          <p className="text-gray-400">No hay mesas configuradas</p>
          <Button onClick={handleCreateTable} className="mt-4 bg-blue-600 hover:bg-blue-700">
            Crear primera mesa
          </Button>
        </div>
      )}

      {/* Salón */}
      {salonTables.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Salón ({salonTables.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {salonTables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={handleEditTable}
                onDelete={() => handleDeleteTable(table.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Terraza */}
      {terrazaTables.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Terraza ({terrazaTables.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {terrazaTables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={handleEditTable}
                onDelete={() => handleDeleteTable(table.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Mesa */}
      <TableModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTable}
        table={editingTable}
      />

      {/* ✅ MODAL BLOQUEO */}
      <BlockSlotModal
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onSave={handleSaveBlock}
      />
    </div>
  );
};
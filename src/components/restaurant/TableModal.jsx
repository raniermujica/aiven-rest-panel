import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TableModal({ isOpen, onClose, onSave, table }) {
  const [formData, setFormData] = useState({
    table_number: '',
    table_type: 'salon',
    capacity: 4,
    min_capacity: 2,
    priority: 0,
    auto_assignable: true,
    notes: '',
  });

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number || '',
        table_type: table.table_type || 'salon',
        capacity: table.capacity || 4,
        min_capacity: table.min_capacity || 2,
        priority: table.priority || 0,
        auto_assignable: table.auto_assignable !== false,
        notes: table.notes || '',
      });
    } else {
      setFormData({
        table_number: '',
        table_type: 'salon',
        capacity: 4,
        min_capacity: 2,
        priority: 0,
        auto_assignable: true,
        notes: '',
      });
    }
  }, [table, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md rounded-lg bg-[#0a1820] p-6 shadow-xl border border-gray-700">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {table ? 'Editar Mesa' : 'Nueva Mesa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número de mesa */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Número de Mesa *
            </label>
            <input
              type="text"
              name="table_number"
              value={formData.table_number}
              onChange={handleChange}
              required
              placeholder="1, 2, A1, etc."
              className="w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Ubicación *
            </label>
            <select
              name="table_type"
              value={formData.table_type}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="salon">Salón</option>
              <option value="terraza">Terraza</option>
            </select>
          </div>

          {/* Capacidades */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Capacidad Mínima *
              </label>
              <input
                type="number"
                name="min_capacity"
                value={formData.min_capacity}
                onChange={handleChange}
                required
                min="1"
                className="w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Capacidad Máxima *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                className="w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Prioridad (0 = más prioritaria)
            </label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              min="0"
              className="w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Las mesas con menor número se asignan primero
            </p>
          </div>

          {/* Auto-asignable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="auto_assignable"
              checked={formData.auto_assignable}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-600 bg-[#1a2f38] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#0a1820]"
            />
            <label className="ml-2 text-sm text-white">
              Permitir asignación automática
            </label>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Ej: Junto a la ventana, vista al jardín..."
              className="w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 bg-transparent text-white hover:bg-[#1a2f38]"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {table ? 'Guardar Cambios' : 'Crear Mesa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
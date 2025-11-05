import { Bell, Search, Menu, AlertCircle, X, User, Phone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/uiStore';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

export function Header() {
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Normalizar teléfono (eliminar espacios, guiones, +34)
  const normalizePhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[\s\-\+]/g, '').replace(/^34/, '');
  };

  // Buscar clientes en tiempo real
  useEffect(() => {
    const searchCustomers = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setSearching(true);

      try {
        const response = await api.getCustomers({ search: searchTerm.trim() });
        setResults(response.customers || []);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error buscando clientes:', error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegar a un cliente específico
  const handleSelectCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Manejar Enter: ir a lista de clientes con filtro
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }

    // Si hay un resultado seleccionado con las flechas
    if (selectedIndex >= 0 && results[selectedIndex]) {
      handleSelectCustomer(results[selectedIndex].id);
      return;
    }

    // Si no hay selección, ir a la página de clientes con búsqueda
    navigate(`/customers?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Navegar con teclado (flechas arriba/abajo)
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Resaltar texto coincidente
  const highlightMatch = (text, search) => {
    if (!search) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-500/30 text-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-[#1a2f38] px-4 lg:px-6">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa (solo móvil) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
      
        
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
        </Button>

        {/* Pause AI Button (texto oculto en móvil) */}
        <Button variant="outline" size="sm">
          <AlertCircle className="h-4 w-4 lg:mr-2" />
          <span className="hidden lg:inline">Pausar IA</span>
        </Button>
      </div>
    </header>
  );
};
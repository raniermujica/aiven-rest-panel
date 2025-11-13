import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export function Layout({ children }) {
  const { toggleSidebar } = useUIStore();

  return (
    <div className="layout-container flex h-screen w-screen overflow-hidden bg-[#1a2f38]">
      {/* Botón hamburguesa flotante - SOLO MÓVIL */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <Sidebar className="flex-shrink-0" />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Page content con padding superior para el botón */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
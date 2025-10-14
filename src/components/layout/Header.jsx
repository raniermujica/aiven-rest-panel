import { Bell, Search, Menu, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/uiStore';

export function Header() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
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
        
        {/* Search (oculto en móvil pequeño) */}
        <div className="relative hidden w-64 sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar reservas, clientes..."
            className="pl-9"
          />
        </div>
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
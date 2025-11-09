import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#102027]">
      <div className="text-center">
        <ShieldX className="mx-auto h-24 w-24 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Acceso Denegado</h1>
        <p className="text-gray-400 mb-6">
          No tienes permisos para acceder a esta página
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
};
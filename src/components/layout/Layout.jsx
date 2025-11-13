import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1a2f38]">
      {/* Sidebar - ancho fijo */}
      <Sidebar className="flex-shrink-0" />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Header - altura fija, sin scroll */}
        {/* <Header className="flex-shrink-0" /> */}

        {/* Page content - resto del espacio con scroll interno */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
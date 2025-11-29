import React, { useState } from 'react';
import { TicketFlow } from './pages/ticket/TicketFlow';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useAdminStore } from './stores/adminStore';

type AppMode = 'ticket' | 'admin';

function App() {
  const [mode, setMode] = useState<AppMode>('ticket');
  const { token } = useAdminStore();

  // Show admin dashboard if logged in and in admin mode
  if (mode === 'admin') {
    if (token) {
      return <AdminDashboard />;
    } else {
      return <AdminLogin onLogin={() => {}} />;
    }
  }

  // Default: show ticket creation flow
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mode switcher */}
      <div className="fixed top-4 right-4 z-50 no-print">
        <button
          onClick={() => setMode(mode === 'ticket' ? 'admin' : 'ticket')}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          {mode === 'ticket' ? 'Admin Login' : 'Back to Tickets'}
        </button>
      </div>

      <TicketFlow />
    </div>
  );
}

export default App;

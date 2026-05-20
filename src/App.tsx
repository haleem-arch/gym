import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/coach/DashboardPage';
import ClientsListPage from './pages/coach/ClientsListPage';
import AddClientPage from './pages/coach/AddClientPage';
import ClientManagementPage from './pages/coach/ClientManagementPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-primary font-sans selection:bg-accent/30 relative">
        {/* Swirling Cosmic Mesh Background */}
        <div className="cosmic-mesh">
          <div className="cosmic-blob-1" />
          <div className="cosmic-blob-2" />
        </div>

        {/* Global Floating Navigation Capsule */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="transition-all duration-500 pt-28 pb-20 px-4 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/coach/dashboard" />} />
            
            <Route path="/coach">
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="clients" element={<ClientsListPage />} />
              <Route path="clients/new" element={<AddClientPage />} />
              <Route path="clients/:clientId" element={<ClientManagementPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/coach/dashboard" />} />
          </Routes>
        </main>

        {/* Global Footer / Status Bar */}
        <footer className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none z-40">
          <div className="max-w-7xl mx-auto flex justify-between items-end">
            <div className="bg-surface/40 backdrop-blur-md border border-white/5 p-2.5 rounded-lg pointer-events-auto shadow-lg">
              <p className="font-mono text-[8px] text-gray-400 uppercase tracking-[4px]">Stride Rite Tactical Interface v1.0.5</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;


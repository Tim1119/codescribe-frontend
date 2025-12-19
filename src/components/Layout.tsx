import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  FileText, 
  BookOpen, 
  Menu, 
  X, 
  Server, 
  Sparkles, 
  GitGraph, 
  MessageSquare, 
  GitCompare, 
  Activity 
} from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) => (
  <Link
    to={to}
    className={clsx(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1",
      active 
        ? "bg-primary/10 text-primary border-r-2 border-primary" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { icon: FileText, label: 'Smart Docs', path: '/' },
    { icon: BookOpen, label: 'README Gen', path: '/readme' },
    { icon: Server, label: 'API Reference', path: '/api-docs' },
    { icon: Sparkles, label: 'Code Explainer', path: '/explainer' },
    { icon: GitGraph, label: 'Diagrams', path: '/diagrams' },
    { icon: MessageSquare, label: 'Code Q&A', path: '/qa' },
    { icon: GitCompare, label: 'Changelog', path: '/changelog' },
    { icon: Activity, label: 'Health Score', path: '/health' },
  ];

  return (
    <div className="flex h-screen bg-dark text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={clsx(
          "bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20",
          isSidebarOpen ? "w-64" : "w-0 -ml-4 opacity-0 md:w-20 md:ml-0 md:opacity-100"
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
            D
          </div>
          {isSidebarOpen && <span className="font-bold text-xl text-white">DocuMint</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.path} 
              icon={item.icon} 
              label={isSidebarOpen ? item.label : ''} 
              to={item.path} 
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold">US</span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">User</p>
                <p className="text-xs text-slate-500 truncate">Pro Plan</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            {/* Add header actions here if needed */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Scissors, 
  Users, 
  Zap,
  DollarSign,
  Package,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  User,
  Calculator as CalculatorIcon
} from 'lucide-react';
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';

// Sub-pages (to be created)
import Overview from './dashboard/Overview';
import Agenda from './dashboard/Agenda';
import Services from './dashboard/Services';
import Clients from './dashboard/Clients';
import Automations from './dashboard/Automations';
import Finance from './dashboard/Finance';
import Inventory from './dashboard/Inventory';
import Staff from './dashboard/Staff';
import Settings from './dashboard/Settings';
import PricingConsultant from './dashboard/PricingConsultant';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/dashboard' },
    { icon: CalendarIcon, label: 'Agenda', path: '/dashboard/agenda' },
    { icon: Scissors, label: 'Serviços', path: '/dashboard/services' },
    { icon: Users, label: 'Clientes', path: '/dashboard/clients' },
    { icon: Zap, label: 'Automações', path: '/dashboard/automations' },
    { icon: DollarSign, label: 'Financeiro', path: '/dashboard/finance' },
    { icon: Package, label: 'Estoque', path: '/dashboard/inventory' },
    { icon: CalculatorIcon, label: 'Consultoria IA', path: '/dashboard/pricing' },
    { icon: User, label: 'Equipe', path: '/dashboard/staff' },
    { icon: SettingsIcon, label: 'Configurações', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F9] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-[#F8E8E8] p-4 flex items-center justify-between">
        <div className="text-xl font-serif font-bold text-[#D48C8C]">auralumi</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#F8E8E8] transform transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:block">
          <div className="text-2xl font-serif font-bold text-[#D48C8C]">auralumi</div>
        </div>

        <nav className="mt-6 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-[#F8E8E8] text-[#D48C8C]" 
                    : "text-[#6D5D5D] hover:bg-[#FFF9F9] hover:text-[#D48C8C]"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[#F8E8E8] bg-white">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="services" element={<Services />} />
          <Route path="clients" element={<Clients />} />
          <Route path="automations" element={<Automations />} />
          <Route path="finance" element={<Finance />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="staff" element={<Staff />} />
          <Route path="settings" element={<Settings />} />
          <Route path="pricing" element={<PricingConsultant />} />
        </Routes>
      </main>
    </div>
  );
}

import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { Shield, Users, FileText, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: Users, label: 'SHGs Directory' },
    { to: '/admin/schemes', icon: FileText, label: 'Govt Schemes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white p-4 flex justify-between items-center z-20 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white/90" />
          <span className="font-bold">Admin Portal</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-200 ease-in-out
        fixed md:sticky top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#C2185B] to-[#6A1B9A] text-pink-100 flex flex-col z-10 shadow-xl
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 text-white border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Portal</h1>
            <p className="text-xs text-pink-200">SakhiSahyog</p>
          </div>
        </div>

        <div className="p-4 border-b border-white/10 mt-16 md:mt-0">
          <p className="text-sm font-medium text-white break-all">{admin?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-black/20 text-white text-xs rounded-full border border-white/20">
            {admin?.area_assigned}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive ? 'bg-white/20 text-white font-medium' : 'hover:bg-white/10 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start text-pink-200 hover:text-white hover:bg-white/10 border border-transparent transition-all"
          >
            <Link to="/">
              <Shield className="w-5 h-5 mr-3" />
              Public Portal
            </Link>
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-pink-200 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

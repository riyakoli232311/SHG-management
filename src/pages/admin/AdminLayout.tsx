// src/pages/admin/AdminLayout.tsx — Dark sidebar matching AppSidebar aesthetic
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, LogOut, ChevronLeft,
  ChevronRight, ShieldCheck, Heart, Globe,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/admin/dashboard' },
  { icon: FileText,        label: 'Govt Schemes',  path: '/admin/schemes'   },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const NavItem = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={cn(
          'relative flex items-center gap-3 rounded-xl transition-all duration-200 group',
          collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2.5',
          isActive
            ? 'bg-gradient-to-r from-[#C2185B]/30 to-[#6A1B9A]/20 text-pink-300 border border-pink-500/20'
            : 'text-white/50 hover:bg-white/5 hover:text-white/85'
        )}
      >
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-[#C2185B] to-[#6A1B9A] rounded-r-full shadow-[0_0_8px_rgba(194,24,91,0.6)]" />
        )}
        <item.icon
          className={cn(
            'flex-shrink-0 transition-colors',
            collapsed ? 'w-[19px] h-[19px]' : 'w-[18px] h-[18px]',
            isActive ? 'text-pink-400' : 'text-white/30 group-hover:text-white/70'
          )}
        />
        {!collapsed && (
          <span className={cn('text-[13.5px] font-medium truncate', isActive ? 'text-pink-300 font-semibold' : '')}>
            {item.label}
          </span>
        )}
        {isActive && collapsed && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-400 shadow-[0_0_4px_rgba(194,24,91,0.8)]" />
        )}
      </Link>
    );
  };

  return (
    <div
      className="min-h-screen flex w-full"
      style={{ background: 'linear-gradient(135deg,#07070f 0%,#0a0a12 40%,#0f0520 100%)' }}
    >
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={cn(
          'flex flex-col border-r transition-all duration-300 min-h-screen flex-shrink-0',
          collapsed ? 'w-[68px]' : 'w-[232px]'
        )}
        style={{
          background: 'linear-gradient(180deg,#07070f 0%,#0a0a12 50%,#0f0520 100%)',
          borderRightColor: 'rgba(255,255,255,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div
          className={cn('flex items-center border-b flex-shrink-0', collapsed ? 'justify-center px-3 py-5' : 'gap-3 px-5 py-[18px]')}
          style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#C2185B 0%,#6A1B9A 100%)', boxShadow: '0 0 16px rgba(194,24,91,0.4)' }}
          >
            <ShieldCheck style={{ width: 17, height: 17 }} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1
                className="text-[15px] leading-tight font-bold bg-gradient-to-r from-[#ff6bc1] to-[#b56bff] bg-clip-text text-transparent"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Admin Portal
              </h1>
              <p className="text-[10px] text-pink-400/70 flex items-center gap-1 mt-0.5 leading-none">
                <Heart className="w-2.5 h-2.5 fill-current flex-shrink-0" />
                SakhiSahyog
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-0.5">
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 px-3 mb-3">Menu</p>
          )}
          {NAV_ITEMS.map(item => <NavItem key={item.path} item={item} />)}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 pb-2 pt-1" style={{ borderTopColor: 'rgba(255,255,255,0.06)', borderTopWidth: 1 }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center w-full py-2 rounded-xl text-white/25 hover:bg-white/5 hover:text-white/60 transition-colors text-[13px] font-medium',
              collapsed ? 'justify-center' : 'gap-2 px-3'
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>

        {/* Admin profile */}
        <div
          className={cn('flex-shrink-0', collapsed ? 'p-2' : 'p-3')}
          style={{ borderTopColor: 'rgba(255,255,255,0.06)', borderTopWidth: 1 }}
        >
          <div className={cn('flex items-center w-full rounded-xl p-2 gap-2.5', collapsed && 'justify-center')}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#C2185B 0%,#6A1B9A 100%)', boxShadow: '0 0 12px rgba(194,24,91,0.3)' }}
            >
              {admin?.email?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-semibold text-white/90 truncate leading-tight">
                  {admin?.email ?? 'Admin'}
                </p>
                <p className="text-[11px] text-white/35 mt-0.5 leading-none">
                  {admin?.area_assigned ?? 'District Officer'}
                </p>
              </div>
            )}
          </div>

          {/* Public Portal — original bottom placement */}
          <Link
            to="/"
            className={cn(
              'flex items-center w-full mt-1 rounded-xl text-white/30 hover:bg-white/5 hover:text-white/60 transition-colors text-[13px] font-medium',
              collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            )}
          >
            <Globe className="w-[15px] h-[15px] flex-shrink-0" />
            {!collapsed && <span>Public Portal</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center w-full mt-1 rounded-xl text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors text-[13px] font-medium',
              collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            )}
          >
            <LogOut className="w-[15px] h-[15px] flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  PiggyBank,
  Landmark,
  BarChart3,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LogOut,
  Settings,
  Sparkles,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { currentUser } from "@/data/users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "SHGs", path: "/shgs" },
  { icon: Users, label: "Members", path: "/members" },
  { icon: PiggyBank, label: "Finance", path: "/savings" },
  { icon: Landmark, label: "Loans", path: "/loans" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: MessageCircle, label: "AI Assistant", path: "/chatbot" },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 min-h-screen border-r border-sidebar-border",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-sidebar-border">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow-lg flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="font-bold text-lg text-white">SakhiSahyog</h1>
            <p className="text-xs text-sidebar-foreground/70 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-[#FBC02D] text-[#FBC02D]" />
              Empowering Women
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className={cn("text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-3", collapsed && "hidden")}>
          Main Menu
        </p>
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label + item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                "hover:bg-sidebar-accent",
                isActive && "bg-gradient-to-r from-[#C2185B]/30 to-transparent border-l-2 border-[#FBC02D]"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors",
                isActive ? "text-[#FBC02D]" : "text-sidebar-foreground/70 group-hover:text-white"
              )} />
              {!collapsed && (
                <span className={cn(
                  "animate-fade-in text-sm font-medium",
                  isActive ? "text-white" : "text-sidebar-foreground/80 group-hover:text-white"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        <p className={cn("text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mt-6 mb-3 px-3", collapsed && "hidden")}>
          Others
        </p>
        {navItems.slice(5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label + item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                "hover:bg-sidebar-accent",
                isActive && "bg-gradient-to-r from-[#C2185B]/30 to-transparent border-l-2 border-[#FBC02D]"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors",
                isActive ? "text-[#FBC02D]" : "text-sidebar-foreground/70 group-hover:text-white"
              )} />
              {!collapsed && (
                <span className={cn(
                  "animate-fade-in text-sm font-medium",
                  isActive ? "text-white" : "text-sidebar-foreground/80 group-hover:text-white"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Profile + Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 w-full hover:bg-sidebar-accent rounded-xl p-2 transition-colors",
                collapsed && "justify-center"
              )}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              {!collapsed && (
                <>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-white/50 truncate">{currentUser.role}</p>
                  </div>
                  <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52 mb-1">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout */}
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
            "hover:bg-red-500/20 text-sidebar-foreground/70 hover:text-red-300",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
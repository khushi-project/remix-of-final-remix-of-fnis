import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Shield, LayoutDashboard, Users, Utensils, LogOut, Dumbbell,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const links = [
  { label: 'Overview', path: '/admin-dashboard', icon: LayoutDashboard },
  { label: 'Client Tasks', path: '/admin-dashboard?tab=clients', icon: Users },
  { label: 'Diet Management', path: '/admin-dashboard?tab=diet', icon: Utensils },
];

const AdminSidebar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: 'clients' | 'diet';
  onTabChange: (tab: 'clients' | 'diet') => void;
}) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <Dumbbell className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-tight">FNIS</span>
        )}
      </div>

      {/* Admin badge */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
              ADMIN
            </span>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 p-2">
        <button
          onClick={() => onTabChange('clients')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'clients'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Client Tasks</span>}
        </button>
        <button
          onClick={() => onTabChange('diet')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'diet'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Utensils className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Diet Management</span>}
        </button>
        <Link
          to="/"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Dumbbell className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </nav>

      {/* Bottom actions */}
      <div className="space-y-1 border-t border-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

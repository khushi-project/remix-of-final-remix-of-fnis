import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Dumbbell, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const allNavItems = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Meal Planner', path: '/meals' },
  { label: 'Workouts', path: '/workouts' },
  { label: 'About', path: '/about' },
];

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold tracking-tight">FNIS</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <button onClick={logout} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Login</Link>
              <Link to="/register" className="gradient-primary rounded-md px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">Register</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button onClick={() => { logout(); setMobileOpen(false); }} className="mt-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground">Logout</button>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 gradient-primary rounded-md px-3 py-2 text-center text-sm font-bold text-primary-foreground">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

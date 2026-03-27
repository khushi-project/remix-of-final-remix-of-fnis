import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    login(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Dumbbell className="h-7 w-7 text-primary" />
            <span className="font-display text-2xl font-bold">FNIS</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
          </div>

          <button type="submit" className="gradient-primary w-full rounded-lg py-2.5 font-display font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
            Sign In
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

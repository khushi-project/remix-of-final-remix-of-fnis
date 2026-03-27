import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    register(name, email, password);
    navigate('/dashboard');
  };

  const fields = [
    { label: 'Full Name', value: name, set: setName, key: 'name', type: 'text', placeholder: 'John Doe' },
    { label: 'Email', value: email, set: setEmail, key: 'email', type: 'email', placeholder: 'you@example.com' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Dumbbell className="h-7 w-7 text-primary" />
            <span className="font-display text-2xl font-bold">FNIS</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start your fitness journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium">{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                placeholder={f.placeholder}
              />
              {errors[f.key] && <p className="mt-1 text-xs text-destructive">{errors[f.key]}</p>}
            </div>
          ))}

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

          <div>
            <label className="mb-1 block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="••••••••"
            />
            {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
          </div>

          <button type="submit" className="gradient-primary w-full rounded-lg py-2.5 font-display font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
            Create Account
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

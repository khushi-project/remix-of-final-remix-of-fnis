import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNutrition, Exercise } from '@/context/NutritionContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Trash2, X, Dumbbell, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Core'];

const Workouts = () => {
  const { isAuthenticated } = useAuth();
  const { exercises, addExercise, deleteExercise } = useNutrition();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', sets: '', reps: '', duration: '', category: 'Chest' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isAuthenticated) return <Navigate to="/login" />;

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.sets || +form.sets <= 0) e.sets = 'Required';
    if (!form.reps || +form.reps <= 0) e.reps = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;

    addExercise({
      name: form.name,
      sets: +form.sets,
      reps: +form.reps,
      duration: form.duration ? +form.duration : undefined,
      category: form.category,
    });
    setForm({ name: '', sets: '', reps: '', duration: '', category: 'Chest' });
    setShowForm(false);
  };

  const grouped = categories.reduce((acc, cat) => {
    const items = exercises.filter(e => e.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Workouts</h1>
            <p className="text-sm text-muted-foreground">Track your exercise routines</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
            <Plus className="h-4 w-4" /> Add Exercise
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="mb-8 overflow-hidden rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-semibold">New Exercise</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Exercise Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bench Press" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Sets</label>
                  <input type="number" value={form.sets} onChange={e => setForm({ ...form, sets: e.target.value })} placeholder="0" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  {errors.sets && <p className="mt-1 text-xs text-destructive">{errors.sets}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Reps</label>
                  <input type="number" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} placeholder="0" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  {errors.reps && <p className="mt-1 text-xs text-destructive">{errors.reps}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Duration (min, optional)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="0" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="gradient-primary mt-4 rounded-lg px-6 py-2 text-sm font-bold text-primary-foreground">Add Exercise</button>
            </motion.form>
          )}
        </AnimatePresence>

        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-6">
            <h2 className="mb-3 font-display text-lg font-semibold">{cat}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(ex => (
                <div key={ex.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      <h4 className="font-display font-semibold">{ex.name}</h4>
                    </div>
                    <button onClick={() => deleteExercise(ex.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                    <span>{ex.sets} sets × {ex.reps} reps</span>
                    {ex.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ex.duration} min</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Workouts;

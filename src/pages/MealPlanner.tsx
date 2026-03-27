import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNutrition, Meal } from '@/context/NutritionContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mealTypes: Meal['type'][] = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealTypeLabels: Record<Meal['type'], string> = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snack' };

const emptyForm = { name: '', calories: '', protein: '', carbs: '', fats: '', type: 'breakfast' as Meal['type'] };

const MealPlanner = () => {
  const { isAuthenticated } = useAuth();
  const { meals, addMeal, updateMeal, deleteMeal } = useNutrition();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isAuthenticated) return <Navigate to="/login" />;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.calories || +form.calories <= 0) e.calories = 'Must be > 0';
    if (!form.protein || +form.protein < 0) e.protein = 'Required';
    if (!form.carbs || +form.carbs < 0) e.carbs = 'Required';
    if (!form.fats || +form.fats < 0) e.fats = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const mealData = { name: form.name, calories: +form.calories, protein: +form.protein, carbs: +form.carbs, fats: +form.fats, type: form.type };
    if (editId) { updateMeal(editId, mealData); setEditId(null); }
    else addMeal(mealData);
    setForm(emptyForm);
    setShowForm(false);
  };

  const startEdit = (m: Meal) => {
    setForm({ name: m.name, calories: String(m.calories), protein: String(m.protein), carbs: String(m.carbs), fats: String(m.fats), type: m.type });
    setEditId(m.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Meal Planner</h1>
            <p className="text-sm text-muted-foreground">Plan and track your daily meals</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} className="gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
            <Plus className="h-4 w-4" /> Add Meal
          </button>
        </div>

        {/* Form */}
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
                <h3 className="font-display font-semibold">{editId ? 'Edit Meal' : 'New Meal'}</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Greek Yogurt' },
                  { key: 'calories', label: 'Calories', type: 'number', placeholder: '0' },
                  { key: 'protein', label: 'Protein (g)', type: 'number', placeholder: '0' },
                  { key: 'carbs', label: 'Carbs (g)', type: 'number', placeholder: '0' },
                  { key: 'fats', label: 'Fats (g)', type: 'number', placeholder: '0' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="mb-1 block text-xs text-muted-foreground">{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                    {errors[f.key] && <p className="mt-1 text-xs text-destructive">{errors[f.key]}</p>}
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as Meal['type'] })}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {mealTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="gradient-primary mt-4 rounded-lg px-6 py-2 text-sm font-bold text-primary-foreground">{editId ? 'Update' : 'Add'} Meal</button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Meal groups */}
        {mealTypes.map(type => {
          const filtered = meals.filter(m => m.type === type);
          if (!filtered.length) return null;
          return (
            <div key={type} className="mb-6">
              <h2 className="mb-3 font-display text-lg font-semibold">{mealTypeLabels[type]}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(m => (
                  <div key={m.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30">
                    <div className="flex items-start justify-between">
                      <h4 className="font-display font-semibold">{m.name}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(m)} className="rounded p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteMeal(m.id)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <p className="mt-1 font-display text-xl font-bold text-primary">{m.calories} <span className="text-xs text-muted-foreground font-normal">kcal</span></p>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span>P: {m.protein}g</span>
                      <span>C: {m.carbs}g</span>
                      <span>F: {m.fats}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
      <Footer />
    </div>
  );
};

export default MealPlanner;

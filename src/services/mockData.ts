// Mock data store using localStorage

export interface DietPlan {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  meals: { time: string; description: string }[];
  status: 'pending' | 'accepted';
  createdAt: string;
}

export interface MealLog {
  id: string;
  clientId: string;
  date: string;
  mealTime: string;
  followedPlan: boolean;
  actualMeal?: string;
}

export interface TrainerClient {
  trainerId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
}

const KEYS = {
  dietPlans: 'fnis_diet_plans',
  mealLogs: 'fnis_meal_logs',
  trainerClients: 'fnis_trainer_clients',
  registeredUsers: 'fnis_registered_users',
};

function get<T>(key: string, fallback: T[] = []): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return fallback;
  }
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Diet Plans
export const getDietPlans = () => get<DietPlan>(KEYS.dietPlans);
export const getDietPlansForClient = (clientId: string) => getDietPlans().filter(d => d.clientId === clientId);
export const getDietPlansForTrainer = (trainerId: string) => getDietPlans().filter(d => d.trainerId === trainerId);

export const addDietPlan = (plan: Omit<DietPlan, 'id' | 'status' | 'createdAt'>): DietPlan => {
  const plans = getDietPlans();
  const newPlan: DietPlan = { ...plan, id: `dp-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
  plans.push(newPlan);
  set(KEYS.dietPlans, plans);
  return newPlan;
};

export const updateDietPlan = (id: string, updates: Partial<DietPlan>) => {
  const plans = getDietPlans().map(p => p.id === id ? { ...p, ...updates } : p);
  set(KEYS.dietPlans, plans);
};

export const acceptDietPlan = (id: string) => updateDietPlan(id, { status: 'accepted' });

// Meal Logs
export const getMealLogs = (clientId: string) => get<MealLog>(KEYS.mealLogs).filter(m => m.clientId === clientId);

export const addMealLog = (log: Omit<MealLog, 'id'>): MealLog => {
  const logs = get<MealLog>(KEYS.mealLogs);
  const newLog: MealLog = { ...log, id: `ml-${Date.now()}` };
  logs.push(newLog);
  set(KEYS.mealLogs, logs);
  return newLog;
};

// Trainer-Client relationships
export const getTrainerClients = (trainerId: string) => get<TrainerClient>(KEYS.trainerClients).filter(tc => tc.trainerId === trainerId);

export const addTrainerClient = (tc: TrainerClient) => {
  const all = get<TrainerClient>(KEYS.trainerClients);
  if (!all.find(x => x.trainerId === tc.trainerId && x.clientId === tc.clientId)) {
    all.push(tc);
    set(KEYS.trainerClients, all);
  }
};

export const removeTrainerClient = (trainerId: string, clientId: string) => {
  const all = get<TrainerClient>(KEYS.trainerClients).filter(x => !(x.trainerId === trainerId && x.clientId === clientId));
  set(KEYS.trainerClients, all);
};

export const getClientTrainer = (clientId: string): TrainerClient | undefined => {
  return get<TrainerClient>(KEYS.trainerClients).find(tc => tc.clientId === clientId);
};

// Registered users store (for lookups)
export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const getRegisteredUsers = () => get<RegisteredUser>(KEYS.registeredUsers);
export const addRegisteredUser = (u: RegisteredUser) => {
  const all = getRegisteredUsers();
  if (!all.find(x => x.email === u.email)) {
    all.push(u);
    set(KEYS.registeredUsers, all);
  }
};

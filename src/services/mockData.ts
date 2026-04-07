// Centralized persistent data store using localStorage

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

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialization?: string;
  joinWeight?: number;
  currentWeight?: number;
  assignedTrainerId?: string;
  dateJoined: string;
}

export interface TrainerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  dateJoined: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  goal?: string;
  joinWeight?: number;
  currentWeight?: number;
  assignedTrainerId?: string;
  dateJoined: string;
}

const KEYS = {
  dietPlans: 'fnis_diet_plans',
  mealLogs: 'fnis_meal_logs',
  trainerClients: 'fnis_trainer_clients',
  registeredUsers: 'fnis_registered_users',
  trainers: 'fnis_trainers',
  clients: 'fnis_clients',
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

// ─── Trainers ───────────────────────────────────────────────
const seedTrainers: TrainerProfile[] = [
  { id: 'trainer-1', name: 'Trainer 1', email: 'trainer1@fnis.com', phone: '9876543210', specialization: 'Strength Training', dateJoined: '2025-01-15' },
  { id: 'trainer-2', name: 'Trainer 2', email: 'trainer2@fnis.com', phone: '9876543211', specialization: 'Cardio & HIIT', dateJoined: '2025-02-10' },
  { id: 'trainer-3', name: 'Trainer 3', email: 'trainer3@fnis.com', phone: '9876543212', specialization: 'Yoga & Flexibility', dateJoined: '2025-03-05' },
  { id: 'trainer-4', name: 'Trainer 4', email: 'trainer4@fnis.com', phone: '9876543213', specialization: 'Nutrition Coaching', dateJoined: '2025-04-01' },
];

export const getTrainers = (): TrainerProfile[] => {
  const stored = get<TrainerProfile>(KEYS.trainers);
  if (stored.length === 0) {
    set(KEYS.trainers, seedTrainers);
    return seedTrainers;
  }
  return stored;
};

export const addTrainer = (trainer: Omit<TrainerProfile, 'id' | 'dateJoined'>): TrainerProfile => {
  const all = getTrainers();
  const newT: TrainerProfile = { ...trainer, id: `trainer-${Date.now()}`, dateJoined: new Date().toISOString().split('T')[0] };
  all.push(newT);
  set(KEYS.trainers, all);
  return newT;
};

export const updateTrainer = (id: string, updates: Partial<TrainerProfile>) => {
  const all = getTrainers().map(t => t.id === id ? { ...t, ...updates } : t);
  set(KEYS.trainers, all);
};

export const removeTrainer = (id: string) => {
  set(KEYS.trainers, getTrainers().filter(t => t.id !== id));
};

export const getTrainerById = (id: string): TrainerProfile | undefined => getTrainers().find(t => t.id === id);

// ─── Clients ────────────────────────────────────────────────
const seedClients: ClientProfile[] = [
  { id: 'client-1', name: 'Sarah Miller', email: 'sarah@example.com', phone: '1234567890', goal: 'Weight Loss', dateJoined: '2025-01-20' },
  { id: 'client-2', name: 'John Doe', email: 'john@example.com', phone: '1234567891', goal: 'Muscle Gain', dateJoined: '2025-02-15' },
  { id: 'client-3', name: 'Emily Chen', email: 'emily@example.com', phone: '1234567892', goal: 'General Fitness', dateJoined: '2025-03-10' },
  { id: 'client-4', name: 'Mike Ross', email: 'mike@example.com', phone: '1234567893', goal: 'Endurance Training', dateJoined: '2025-04-05' },
];

export const getClients = (): ClientProfile[] => {
  const stored = get<ClientProfile>(KEYS.clients);
  if (stored.length === 0) {
    set(KEYS.clients, seedClients);
    return seedClients;
  }
  return stored;
};

export const addClient = (client: Omit<ClientProfile, 'id' | 'dateJoined'>): ClientProfile => {
  const all = getClients();
  const newC: ClientProfile = { ...client, id: `client-${Date.now()}`, dateJoined: new Date().toISOString().split('T')[0] };
  all.push(newC);
  set(KEYS.clients, all);
  return newC;
};

export const updateClient = (id: string, updates: Partial<ClientProfile>) => {
  const all = getClients().map(c => c.id === id ? { ...c, ...updates } : c);
  set(KEYS.clients, all);
};

export const removeClient = (id: string) => {
  set(KEYS.clients, getClients().filter(c => c.id !== id));
};

export const getClientById = (id: string): ClientProfile | undefined => getClients().find(c => c.id === id);

// ─── Diet Plans ─────────────────────────────────────────────
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

// ─── Meal Logs ──────────────────────────────────────────────
export const getMealLogs = (clientId: string) => get<MealLog>(KEYS.mealLogs).filter(m => m.clientId === clientId);
export const getAllMealLogs = () => get<MealLog>(KEYS.mealLogs);

export const addMealLog = (log: Omit<MealLog, 'id'>): MealLog => {
  const logs = get<MealLog>(KEYS.mealLogs);
  const newLog: MealLog = { ...log, id: `ml-${Date.now()}` };
  logs.push(newLog);
  set(KEYS.mealLogs, logs);
  return newLog;
};

// ─── Trainer-Client relationships ───────────────────────────
export const getAllTrainerClients = () => get<TrainerClient>(KEYS.trainerClients);
export const getTrainerClients = (trainerId: string) => getAllTrainerClients().filter(tc => tc.trainerId === trainerId);

export const addTrainerClient = (tc: TrainerClient) => {
  const all = getAllTrainerClients();
  if (!all.find(x => x.trainerId === tc.trainerId && x.clientId === tc.clientId)) {
    all.push(tc);
    set(KEYS.trainerClients, all);
  }
  // Also update client's assignedTrainerId
  updateClient(tc.clientId, { assignedTrainerId: tc.trainerId });
};

export const removeTrainerClient = (trainerId: string, clientId: string) => {
  const all = getAllTrainerClients().filter(x => !(x.trainerId === trainerId && x.clientId === clientId));
  set(KEYS.trainerClients, all);
  updateClient(clientId, { assignedTrainerId: undefined });
};

export const getClientTrainer = (clientId: string): TrainerClient | undefined => {
  return getAllTrainerClients().find(tc => tc.clientId === clientId);
};

// ─── Registered users (legacy compat) ──────────────────────
export const getRegisteredUsers = () => get<RegisteredUser>(KEYS.registeredUsers);
export const addRegisteredUser = (u: Omit<RegisteredUser, 'dateJoined'>) => {
  const all = getRegisteredUsers();
  const dateJoined = new Date().toISOString().split('T')[0];
  if (!all.find(x => x.email === u.email)) {
    all.push({ ...u, dateJoined });
    set(KEYS.registeredUsers, all);
  }
  // Also add to trainers/clients stores
  if (u.role === 'trainer') {
    const trainers = getTrainers();
    if (!trainers.find(t => t.email === u.email)) {
      const newT: TrainerProfile = { id: u.id, name: u.name, email: u.email, phone: u.phone, specialization: (u as any).specialization, dateJoined };
      trainers.push(newT);
      set(KEYS.trainers, trainers);
    }
  } else if (u.role === 'client') {
    const clients = getClients();
    if (!clients.find(c => c.email === u.email)) {
      const newC: ClientProfile = { id: u.id, name: u.name, email: u.email, phone: u.phone, goal: '', dateJoined };
      clients.push(newC);
      set(KEYS.clients, newC ? [...clients] : clients);
    }
  }
};

// ─── Helper: Get clients for a trainer ──────────────────────
export const getClientsForTrainer = (trainerId: string): ClientProfile[] => {
  const relations = getTrainerClients(trainerId);
  const allClients = getClients();
  return relations.map(r => allClients.find(c => c.id === r.clientId) || {
    id: r.clientId, name: r.clientName, email: r.clientEmail, dateJoined: '',
  } as ClientProfile);
};

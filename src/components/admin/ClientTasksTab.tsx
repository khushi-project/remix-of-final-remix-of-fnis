import { useState } from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getClients, getAllMealLogs } from '@/services/mockData';

export interface ClientTask {
  id: string;
  clientName: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  completed: 'bg-primary/20 text-primary',
};

const ClientTasksTab = () => {
  const clients = getClients();
  const mealLogs = getAllMealLogs();

  // Generate tasks from actual client data
  const generateTasks = (): ClientTask[] => {
    return clients.slice(0, 6).map((client, i) => ({
      id: client.id,
      clientName: client.name,
      task: i % 3 === 0 ? 'Complete weekly plan' : i % 3 === 1 ? 'Log daily meals' : 'Follow diet plan',
      status: (i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'in-progress' : 'completed') as ClientTask['status'],
    }));
  };

  const [clientTasks, setClientTasks] = useState<ClientTask[]>(generateTasks);

  const updateTaskStatus = (id: string) => {
    setClientTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const next = t.status === 'pending' ? 'in-progress' : t.status === 'in-progress' ? 'completed' : 'pending';
        return { ...t, status: next as ClientTask['status'] };
      })
    );
  };

  const deleteTask = (id: string) => {
    setClientTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold">{clients.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Meal Logs</p>
          <p className="text-2xl font-bold">{mealLogs.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active Tasks</p>
          <p className="text-2xl font-bold">{clientTasks.filter(t => t.status !== 'completed').length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display font-bold">Client Tasks</h2>
        </div>
        <div className="divide-y divide-border">
          {clientTasks.length === 0 && (
            <p className="p-5 text-center text-sm text-muted-foreground">No tasks.</p>
          )}
          {clientTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium">{task.task}</p>
                <p className="text-xs text-muted-foreground">{task.clientName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                <button onClick={() => updateTaskStatus(task.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Cycle status">
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button onClick={() => deleteTask(task.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ClientTasksTab;

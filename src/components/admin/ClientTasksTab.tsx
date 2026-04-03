import { useState } from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

const initialClientTasks: ClientTask[] = [
  { id: '1', clientName: 'Sarah Miller', task: 'Complete weekly cardio plan', status: 'pending' },
  { id: '2', clientName: 'John Doe', task: 'Log daily meals for 7 days', status: 'in-progress' },
  { id: '3', clientName: 'Emily Chen', task: 'Reach 10k steps daily', status: 'completed' },
  { id: '4', clientName: 'Mike Ross', task: 'Follow protein intake goal', status: 'pending' },
];

const ClientTasksTab = () => {
  const [clientTasks, setClientTasks] = useState<ClientTask[]>(initialClientTasks);

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
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
    </motion.div>
  );
};

export default ClientTasksTab;

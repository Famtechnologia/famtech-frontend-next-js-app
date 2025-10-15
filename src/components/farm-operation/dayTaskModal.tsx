
// src/components/farm-operation/dayTaskModal.tsx

import React, { useState, useEffect } from 'react';
import { getTasks, Task as ApiTask } from '../../lib/services/taskplanner';
import { useAuthStore, User } from "@/lib/store/authStore";

interface DayTaskModalProps {
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

interface Task {
  id: string;
  type: string;
  name: string;
  time: string;
  user: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  status: 'pending' | 'ongoing' | 'completed';
  description: string;
  notes?: string;
  dueDate?: string;
}

type ApiTaskWithId = ApiTask & { id: string };

const DayTaskModal: React.FC<DayTaskModalProps> = ({ date, onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = useAuthStore.getState().user as User;
        const data = await getTasks(userData.id) as ApiTaskWithId[];

        const mappedTasks: Task[] = data.map((task) => {
          const dateObject = task.timeline?.dueDate ? new Date(task.timeline.dueDate) : null;
          
          const formattedDateForDisplay = dateObject
            ? dateObject.toISOString().split('T')[0]
            : 'N/A';

          return {
            id: task.id,
            type: task.taskType.charAt(0).toUpperCase() + task.taskType.slice(1),
            name: task.title,
            time: task.timeline?.dueTime || 'N/A',
            user: task.assignee,
            priority: (task.priority?.toLowerCase() as 'low' | 'medium' | 'high') ?? 'low',
            completed: task.status === 'completed',
            status: (task.status as 'pending' | 'ongoing' | 'completed') ?? 'pending',
            description: task.note ?? '',
            notes: task.note,
            dueDate: formattedDateForDisplay,
          };
        });

        const filteredTasks = mappedTasks.filter(task => task.dueDate === date);
        setTasks(filteredTasks);
      } catch (err) {
        console.error(err);
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      fetchTasks();
    }
  }, [date]);

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-semibold">Tasks for {formattedDate}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <p>Loading tasks...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border rounded-md shadow-sm"
              >
                <h4 className={`font-semibold ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                  {task.name}
                </h4>
                <p className="text-xs text-gray-500">
                  {task.user} - Priority: {task.priority}
                </p>
                <p className="text-sm mt-2">{task.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                    Due at {task.time}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No tasks scheduled for this day.</p>
          )}
        </div>
        <div className="pt-4 border-t mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayTaskModal;

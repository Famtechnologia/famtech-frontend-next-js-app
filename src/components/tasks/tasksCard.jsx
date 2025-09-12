'use client'
import { useState } from 'react';
import Card from '@/components/ui/Card'
import { CheckCircle } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Check maize fields for pest activity", completed: false },
    { id: 2, text: "Apply fertilizer to tomato plants", completed: true },
    { id: 3, text: "Order seeds for next season", completed: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <Card title="Today's Tasks" className="h-[320px] " headerClassName='bg-green-50 border-b border-blue-200' bodyClassName='p-6'>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center space-x-3">
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                task.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {task.completed && <CheckCircle className="w-3 h-3" />}
            </button>
            <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
              {task.text}
            </span>
          </div>
        ))}
        
        <div className="pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {completedCount} of {tasks.length} completed
          </div>
          <button className="text-green-600 text-sm font-medium hover:text-green-700 flex items-center mt-2">
            View all tasks →
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Tasks;
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle,
  ChevronRight,
  RefreshCcw,
  Sprout,
  PawPrint,
  Settings,
} from 'lucide-react';
import Modal from '../ui/Modal';
import { getTasks, createTask, updateTask, deleteTask , Task as ApiTask } from '../../lib/services/taskplanner';

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

interface TaskFormProps {
  mode: 'new' | 'edit';
  title: string;
  setTitle: (title: string) => void;
  status: 'Pending' | 'Ongoing' | 'Completed';
  setStatus: (status: 'Pending' | 'Ongoing' | 'Completed') => void;
  priority: 'Low' | 'Medium' | 'High';
  setPriority: (priority: 'Low' | 'Medium' | 'High') => void;
  taskType: string;
  setTaskType: (type: string) => void;
  assignee: string;
  setAssignee: (assignee: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
  dueTime: string;
  setDueTime: (time: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  onDelete: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  title,
  setTitle,
  status,
  setStatus,
  priority,
  setPriority,
  taskType,
  setTaskType,
  assignee,
  setAssignee,
  dueDate,
  setDueDate,
  dueTime,
  setDueTime,
  notes,
  setNotes,
  onSave,
  onClose,
  onDelete,
}) => {
  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Pending' | 'Ongoing' | 'Completed')}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          >
            <option>Pending</option>
            <option>Ongoing</option>
            <option>Completed</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div>
          <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-1">
            Task Type
          </label>
          <select
            id="taskType"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          >
            <option value="General task">General task</option>
            <option value="Crop task">Crop task</option>
            <option value="Livestock task">Livestock task</option>
          </select>
        </div>
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <input
            type="text"
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 mb-1">
            Due Time
          </label>
          <input
            type="time"
            id="dueTime"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
        ></textarea>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
        {mode === 'edit' && (
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-red-600 rounded-md border border-gray-300 hover:bg-red-50"
            onClick={onDelete}
          >
            Delete Task
          </button>
        )}
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700"
        >
          {mode === 'new' ? 'Create Task' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'new' | 'edit'>('new');

  const [formTitle, setFormTitle] = useState('');
  const [formStatus, setFormStatus] = useState<'Pending' | 'Ongoing' | 'Completed'>('Pending');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [formAssignee, setFormAssignee] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formTaskType, setFormTaskType] = useState('General task');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDueTime, setFormDueTime] = useState('');
type ApiTaskWithId = ApiTask & { id: string };
  

const fetchTasks = React.useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await getTasks() as ApiTaskWithId[];

    const mappedTasks: Task[] = data.map((task) => {
      const dateObject = task.timeline?.dueDate ? new Date(task.timeline.dueDate) : null;
      const formattedDate = dateObject
        ? dateObject.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
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
        dueDate: formattedDate,
      };
    });

    setTasks(mappedTasks);
  } catch (err) {
    console.error(err);
    setError(err as Error);
  } finally {
    setLoading(false);
  }
}, [getTasks]); // or [] if getTasks is stable

useEffect(() => {
  fetchTasks();
}, [fetchTasks]); // no more warning




  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      title: formTitle,
      status: formStatus.toLowerCase(),
      priority: formPriority.toLowerCase(),
      timeline: {
        dueDate: formDueDate,
        dueTime: formDueTime,
      },
      note: formNotes,
      taskType: formTaskType.toLowerCase(),
      assignee: formAssignee,
      entity_id: 'sample_entity_id',
    };

    setLoading(true);
    try {
      if (modalMode === 'new') {
        await createTask(taskData);
      } else if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to save task:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (selectedTask && window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await deleteTask(selectedTask.id);
        setIsModalOpen(false);
        fetchTasks();
      } catch (err) {
        console.error('Failed to delete task:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
  };

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setModalMode('new');
    setFormTitle('');
    setFormStatus('Pending');
    setFormPriority('Low');
    setFormAssignee('');
    setFormNotes('');
    setFormTaskType('General task');
    setFormDueDate('');
    setFormDueTime('');
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setFormTitle(task.name);
    setFormStatus(task.status.charAt(0).toUpperCase() + task.status.slice(1) as 'Pending' | 'Ongoing' | 'Completed');
    setFormPriority(task.priority.charAt(0).toUpperCase() + task.priority.slice(1) as 'Low' | 'Medium' | 'High');
    setFormAssignee(task.user);
    setFormNotes(task.notes || '');
    setFormTaskType(task.type);
    setFormDueDate(task.dueDate || '');
    setFormDueTime(task.time || '');
    setIsModalOpen(true);
  };

  const taskTypeIcons = {
    'Crop task': { label: 'Crop Tasks', icon: Sprout },
    'Livestock task': { icon: PawPrint, label: 'Livestock Tasks' },
    'General task': { icon: Settings, label: 'General Tasks' },
  };

  const filteredTasks = tasks.filter((task) => {
    const now = new Date();
    const due = task.dueDate ? new Date(task.dueDate) : null;

    let matchesFilter = false;

    if (activeFilter === 'All') {
      matchesFilter = true;
    } else if (activeFilter === 'Completed') {
      matchesFilter = task.completed;
    } else if (activeFilter === 'This Week') {
      if (due) {
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);
        matchesFilter = due >= now && due <= weekFromNow;
      }
    } else if (activeFilter === 'Overdue') {
      if (due) {
        matchesFilter = due < now && !task.completed;
      }
    } else {
      matchesFilter = task.type === activeFilter;
    }

    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.user.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'Crop task':
        return 'Crop Tasks';
      case 'Livestock task':
        return 'Livestock Tasks';
      case 'General task':
        return 'General Tasks';
      case 'Completed':
        return 'Completed Tasks';
      default:
        return 'All Tasks';
    }
  };

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 w-full">
          <h1 className="text-2xl font-bold text-gray-800 hidden md:block">Task Dashboard</h1>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md border bg-green-600 hover:bg-green-700 transition-transform duration-200 scale-100 hover:scale-105"
              onClick={openNewTaskModal}
            >
              <Plus className="h-4 w-4 mr-2" /> New Task
            </button>
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
              onClick={fetchTasks}
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Sync
            </button>
          </div>
        </div>

        <div className="space-y-6 md:space-y-0 md:flex md:space-x-6 ">
          <div className="w-full md:w-64 space-y-6 p-4 bg-white rounded-xl shadow-xl">
            <div>
              <h3 className="text-lg font-semibold text-gray-500 uppercase mb-2">FILTER TASKS</h3>
              <div className="space-y-2">
                {['All', 'This Week', 'Overdue', 'Completed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`w-full text-left p-2 rounded-xl text-base font-medium transition-colors duration-200 ${activeFilter === filter ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-500 uppercase mb-2">TASK TYPES</h3>
              <div className="space-y-2">
                {(Object.keys(taskTypeIcons) as (keyof typeof taskTypeIcons)[]).map((type) => {
                  const label = taskTypeIcons[type].label;
                  const IconComponent = taskTypeIcons[type].icon;
                  const tasksCount = tasks.filter((t) => t.type === type).length;
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`w-full text-left flex items-center justify-between p-2 rounded-xl text-base font-medium transition-colors duration-200 ${activeFilter === type ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4 text-green-500" />
                        <span>{label}</span>
                      </div>
                      <span className="text-gray-400 text-xs">({tasksCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
              />
            </div>
            {loading && <div className="text-center py-8 text-gray-500">Loading tasks...</div>}
            {error && <div className="text-center py-8 text-red-500">Error: Could not fetch tasks. Please try again.</div>}
            {!loading && !error && (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-500 uppercase">
                  {getTaskTypeLabel(activeFilter)} ({filteredTasks.length})
                </h3>
                <div className="space-y-1 bg-white shadow-xl  rounded-xl overflow-hidden divide-y-t divide-gray-200">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between border-t-3 border-gray-200 p-6 cursor-pointer transition-colors duration-200 hover:border-l-4 hover:border-green-500 rounded-lg hover:bg-green-100"
                      onClick={() => openEditTaskModal(task)}
                    >
                      <div className="flex items-start space-x-3">
                        <CheckCircle className={`h-10 w-10 md:h-5 md:w-5  ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />

                        <div className="space-y-3">
                          <p className="text-xl font-semibold text-gray-800">{task.name}</p>
                          <p className="text-lg text-gray-600 space-x-2">

                            {task.type} • Due: {task.dueDate}, {task.time}
                          </p>
                          <span
                            className={`text-lg px-4 py-2 rounded-full font-semibold capitalize ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex flex-col items-center space-y-6">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                          <p className="text-lg text-gray-600">
                            {task.user}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTasks.length === 0 && <div className="text-center py-4 text-gray-500">No tasks found</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'new' ? 'New Task' : 'Edit Task'}
      >
        <TaskForm
          mode={modalMode}
          title={formTitle}
          setTitle={setFormTitle}
          status={formStatus}
          setStatus={setFormStatus}
          priority={formPriority}
          setPriority={setFormPriority}
          taskType={formTaskType}
          setTaskType={setFormTaskType}
          assignee={formAssignee}
          setAssignee={setFormAssignee}
          dueDate={formDueDate}
          setDueDate={setFormDueDate}
          dueTime={formDueTime}
          setDueTime={setFormDueTime}
          notes={formNotes}
          setNotes={setFormNotes}
          onSave={handleSaveTask}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDeleteTask}
        />
      </Modal>
    </div>
  );
};

export default App;
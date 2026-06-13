// src/components/calendar/CalendarView.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, ListChecks, Trash2, AlertTriangle, ChevronDown } from "lucide-react";
import { getCalendarData, CalendarData } from "@/lib/services/calender";
import Modal from "../ui/Modal";
import { updateTask, createTask, deleteTask, Task } from "../../lib/services/taskplanner";
import CalendarSkeletonLoader from "@/components/skeleton/farm-operation/CalenderSkeleton";
import { getStaffs, StaffType } from "@/lib/services/staff";
import { useProfile } from "@/lib/hooks/useProfile";

const CATEGORY = {
  crop: { label: "Crop Tasks", dot: "bg-green-500" },
  livestock: { label: "Livestock Tasks", dot: "bg-purple-500" },
  general: { label: "General Tasks", dot: "bg-blue-500" },
} as const;

type Category = keyof typeof CATEGORY;

const getCategory = (taskType?: string): Category => {
  const t = (taskType || "").toLowerCase();
  if (t.includes("crop")) return "crop";
  if (t.includes("livestock")) return "livestock";
  return "general";
};

const DayCell: React.FC<{
  day: number;
  tasks: Task[];
  onClick: () => void;
}> = ({ day, tasks, onClick }) => (
  <div
    className="md:h-28 border border-gray-200 dark:border-[#30363d] rounded-md p-2 mt-2 hover:border-green-400 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-[#0d2a1a]/30 cursor-pointer relative overflow-hidden transition-colors"
    onClick={onClick}
  >
    <span className="text-gray-500 dark:text-[#8b949e] text-xs font-semibold">{day}</span>
    <div className="absolute inset-x-0 bottom-0 p-1 flex space-x-1 justify-center md:justify-start overflow-x-auto no-scrollbar">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`h-2 w-2 rounded-full ${CATEGORY[getCategory(task.taskType)].dot} ${
            task.status === "completed" ? "opacity-40" : ""
          }`}
          title={`${task.title} - ${task.status}`}
        ></div>
      ))}
    </div>
  </div>
);

const DayTasksModal: React.FC<{
  isOpen: boolean;
  tasks: Task[];
  dateString: string;
  onClose: () => void;
  onTaskUpdate: () => void;
}> = ({ isOpen, tasks, dateString, onClose, onTaskUpdate }) => {
  const { profile } = useProfile();
  const [staffList, setStaffList] = useState<StaffType[]>([]);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    if (!profile?.id || !isOpen) return;
    getStaffs(profile.id)
      .then((d) => setStaffList(d || []))
      .catch((err) => console.error("Failed to load staff list:", err));
  }, [profile?.id, isOpen]);

  const getAssigneeName = (assigneeVal?: string) => {
    if (!assigneeVal || assigneeVal === "Unassigned") return "Unassigned";
    const lower = assigneeVal.toLowerCase();
    const s = staffList.find(
      (member) => member._id === assigneeVal || member.email?.toLowerCase() === lower
    );
    if (s?.name) return s.name;
    // If it looks like an email, show the part before @
    if (assigneeVal.includes("@")) return assigneeVal.split("@")[0];
    return assigneeVal;
  };

  const handleToggleStatus = async (task: Task) => {
    setUpdatingTaskId(task.id);
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      await updateTask(task.id, { ...task, status: newStatus });
      onTaskUpdate();
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const confirmDeleteTask = async (taskId: string) => {
    setDeletingTaskId(taskId);
    try {
      await deleteTask(taskId);
      setTaskToDelete(null);
      onTaskUpdate();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (!isOpen) return null;

  const formattedDate = dateString ? new Date(dateString).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ) : "";

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      title={`Tasks for ${formattedDate}`}
    >
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {taskToDelete ? (
          <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-sm">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-slate-800">Delete Event</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Are you sure you want to permanently delete: <strong className="text-red-700 font-semibold">"{taskToDelete.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                disabled={deletingTaskId === taskToDelete.id}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteTask(taskToDelete.id)}
                disabled={deletingTaskId === taskToDelete.id}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {deletingTaskId === taskToDelete.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Yes, Delete It"
                )}
              </button>
            </div>
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                className="p-3.5 bg-slate-50/50 dark:bg-[#21262d] hover:bg-slate-50 dark:hover:bg-[#1c2128] border border-slate-100 dark:border-[#30363d] rounded-xl flex justify-between items-center transition-all"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h4
                    className={`text-sm font-semibold truncate capitalize ${isCompleted ? "line-through text-gray-400 dark:text-[#8b949e]" : "text-gray-800 dark:text-[#e6edf3]"}`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-gray-500 dark:text-[#8b949e] font-medium capitalize">
                      Staff: {getAssigneeName(task.assignee)}
                    </span>
                    <span className="text-gray-300 dark:text-[#30363d]">•</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold tracking-wider uppercase ${
                      task.priority === 'high'
                        ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
                        : task.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                        : 'bg-green-50 text-green-700 border-green-100 dark:bg-[#0d2a1a] dark:text-[#4ade80] dark:border-green-900'
                    }`}>
                      {task.priority || 'medium'}
                    </span>
                  </div>
                  {task.note && (
                    <p className="text-[10px] text-gray-400 dark:text-[#8b949e] mt-1 italic line-clamp-2">
                      Note: {task.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    disabled={updatingTaskId === task.id || deletingTaskId === task.id}
                    className={`px-2.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                      isCompleted
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#21262d]"
                    } disabled:opacity-50`}
                  >
                    {updatingTaskId === task.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isCompleted ? (
                      "Completed"
                    ) : (
                      "Mark Done"
                    )}
                  </button>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    disabled={updatingTaskId === task.id || deletingTaskId === task.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                    title="Delete Event"
                  >
                    {deletingTaskId === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <ListChecks className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">No tasks scheduled for this day.</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-[#30363d] mt-4 flex justify-between items-center">
        <p className="text-[10px] text-gray-400 dark:text-[#8b949e]">
          Only tasks for this date are shown. Full details in the Planner tab.
        </p>
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] bg-white dark:bg-[#21262d] border border-gray-200 dark:border-[#30363d] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1c2128]"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

const AddEventModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ show, onClose, onCreated }) => {
  const { profile } = useProfile();
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState("General task");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [assignee, setAssignee] = useState("Unassigned");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.id || !show) return;
    getStaffs(profile.id)
      .then((d) => setStaff(d || []))
      .catch((err) => console.error("Failed to load staff:", err));
  }, [profile?.id, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        status: "pending",
        priority: priority.toLowerCase(),
        timeline: { dueDate, dueTime },
        note: notes,
        taskType: taskType.toLowerCase(),
        assignee,
        userId: profile?.id,
        entity_id: "sample_entity_id",
      };
      await createTask(payload);
      setTitle("");
      setNotes("");
      setAssignee("Unassigned");
      setDueTime("");
      onCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create event:", err);
    } finally {
      setSaving(false);
    }
  };

  const field =
    "w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-xs";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <Modal show={show} onClose={onClose} title="Add Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={saving}
            placeholder="e.g. Water the maize field"
            className={field}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Event Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              disabled={saving}
              className={field}
            >
              <option value="General task">General</option>
              <option value="Crop task">Crop</option>
              <option value="Livestock task">Livestock</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={saving}
              className={field}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              disabled={saving}
              className={field}
            />
          </div>
          <div>
            <label className={labelCls}>Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              required
              disabled={saving}
              className={field}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Assign To</label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            disabled={saving}
            className={field}
          >
            <option value="Unassigned">Unassigned</option>
            {staff?.map((s) => (
              <option key={s.email} value={s.email}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saving}
            className={`${field} resize-none`}
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-medium text-white rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Event"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const CalendarView: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [activeDate, setActiveDate] = useState<Date>(today);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<Record<Category, boolean>>({
    crop: true,
    livestock: true,
    general: true,
  });
  const toggleCategory = (c: Category) =>
    setEnabled((p) => ({ ...p, [c]: !p[c] }));

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const { profile } = useProfile();

  const fetchCalendar = useCallback(async () => {
    if (!profile?.id) {
      setCalendarData({ month: currentMonth, year: currentYear, days: [] });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCalendarData(
        currentYear,
        currentMonth,
        profile.id
      );
      
      const days = Array.isArray(data) ? data.map((item: any) => {
        const parts = item.date.split("-");
        const dayNum = parseInt(parts[2], 10);
        return {
          day: dayNum,
          tasks: item.tasks || []
        };
      }) : [];

      setCalendarData({
        month: currentMonth,
        year: currentYear,
        days
      });
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, currentMonth, profile?.id]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
    setSelectedDay(null);
  };

  const handlePreviousWeek = () => {
    const prev = new Date(activeDate);
    prev.setDate(prev.getDate() - 7);
    setActiveDate(prev);
    
    if (prev.getMonth() + 1 !== currentMonth || prev.getFullYear() !== currentYear) {
      setCurrentMonth(prev.getMonth() + 1);
      setCurrentYear(prev.getFullYear());
    }
    setSelectedDay(null);
  };

  const handleNextWeek = () => {
    const next = new Date(activeDate);
    next.setDate(next.getDate() + 7);
    setActiveDate(next);
    
    if (next.getMonth() + 1 !== currentMonth || next.getFullYear() !== currentYear) {
      setCurrentMonth(next.getMonth() + 1);
      setCurrentYear(next.getFullYear());
    }
    setSelectedDay(null);
  };

  const handlePrev = () => {
    if (viewMode === "month") {
      handlePreviousMonth();
    } else {
      handlePreviousWeek();
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      handleNextMonth();
    } else {
      handleNextWeek();
    }
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const getDaysForActiveWeek = () => {
    const start = new Date(activeDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek); // Sunday
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const getWeekRangeString = () => {
    const days = getDaysForActiveWeek();
    const start = days[0];
    const end = days[6];
    
    const startMonth = monthNames[start.getMonth()].substring(0, 3);
    const endMonth = monthNames[end.getMonth()].substring(0, 3);
    
    return `Week of ${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  if (isLoading) {
    return <CalendarSkeletonLoader />;
  }

  // Derive reactive tasks and date string for the modal
  const selectedDayData = selectedDay !== null 
    ? calendarData?.days?.find((dd) => dd.day === selectedDay)
    : null;
  const filteredTasksForModal = (selectedDayData?.tasks || []).filter(
    (t) => enabled[getCategory(t.taskType)]
  );
  
  const monthString = String(currentMonth).padStart(2, "0");
  const dayString = selectedDay !== null ? String(selectedDay).padStart(2, "0") : "";
  const selectedDateString = selectedDay !== null ? `${currentYear}-${monthString}-${dayString}` : "";

  // Sidebar content — shared between mobile sheet and desktop sidebar
  const SidebarContent = () => (
    <>
      {/* Navigation / Mini calendar */}
      <div className="bg-white dark:bg-[#1c2128] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-[#30363d]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-[#e6edf3] text-sm">
            {monthNames[currentMonth - 1]} {currentYear}
          </h3>
          <div className="flex items-center space-x-2 text-gray-400 dark:text-[#8b949e] font-bold">
            <button className="hover:text-green-600 p-1" onClick={handlePreviousMonth}>&lt;</button>
            <button className="hover:text-green-600 p-1" onClick={handleNextMonth}>&gt;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={day + index} className="font-medium text-gray-500 dark:text-[#8b949e]">
              {day}
            </div>
          ))}
          {blankDays.map((_, index) => (
            <div key={`blank-${index}`}></div>
          ))}
          {[...Array(getDaysInMonth(currentYear, currentMonth)).keys()].map((day) => (
            <div
              key={day}
              onClick={() => {
                const selected = new Date(currentYear, currentMonth - 1, day + 1);
                setActiveDate(selected);
                setSelectedDay(day + 1);
                setSidebarOpen(false);
              }}
              className={`p-2 rounded-lg cursor-pointer dark:text-[#e6edf3] ${
                day + 1 === today.getDate() && currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear()
                  ? "bg-green-100 dark:bg-[#1a3a2a] text-green-700 dark:text-[#4ade80] font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-[#30363d]"
              }`}
            >
              {day + 1}
            </div>
          ))}
        </div>
      </div>

      {/* View Options */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#8b949e] mb-3">
          VIEW OPTIONS
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => { setViewMode("month"); setSidebarOpen(false); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === "month"
                ? "text-white bg-green-600 hover:bg-green-700"
                : "text-gray-600 dark:text-[#8b949e] bg-gray-100 dark:bg-[#21262d] hover:bg-gray-200 dark:hover:bg-[#30363d]"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => { setViewMode("week"); setSidebarOpen(false); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === "week"
                ? "text-white bg-green-600 hover:bg-green-700"
                : "text-gray-600 dark:text-[#8b949e] bg-gray-100 dark:bg-[#21262d] hover:bg-gray-200 dark:hover:bg-[#30363d]"
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Filter Events */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#8b949e] mb-3">
          FILTER EVENTS
        </h3>
        <div className="space-y-1">
          {(Object.keys(CATEGORY) as Category[]).map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-[#8b949e] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#21262d]"
            >
              <input
                type="checkbox"
                checked={enabled[cat]}
                onChange={() => toggleCategory(cat)}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY[cat].dot}`} />
              <span>{CATEGORY[cat].label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#8b949e] mb-3">
          LEGEND
        </h3>
        <div className="space-y-2">
          {[
            { label: "Crop Tasks", color: "bg-green-500" },
            { label: "Livestock Tasks", color: "bg-purple-500" },
            { label: "General Tasks", color: "bg-blue-500" },
            { label: "Completed (faded)", color: "bg-gray-300 dark:bg-gray-600" },
          ].map((item) => (
            <div key={item.label} className="flex items-center space-x-2 text-xs font-medium text-gray-600 dark:text-[#8b949e]">
              <div className={`h-2.5 w-2.5 rounded-full ${item.color}`}></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white dark:bg-[#0d1117] p-2 lg:p-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-[#e6edf3] bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl w-full justify-between shadow-sm"
        >
          <span>{monthNames[currentMonth - 1]} {currentYear} · {viewMode === "month" ? "Month" : "Week"} View</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
        </button>
        {sidebarOpen && (
          <div className="mt-3 p-4 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-md space-y-5">
            <SidebarContent />
          </div>
        )}
      </div>

      {/* Desktop Left Sidebar */}
      <div className="hidden md:block w-64 space-y-6 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Main Calendar Grid */}
      <div className="flex-1 bg-white dark:bg-[#161b22] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-[#30363d]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
              {viewMode === "month"
                ? `${monthNames[currentMonth - 1]} ${currentYear}`
                : getWeekRangeString()}
            </h2>
            <div className="flex items-center space-x-1.5 text-gray-400 dark:text-[#8b949e] font-bold border border-gray-100 dark:border-[#30363d] rounded-md px-1 py-0.5">
              <button className="hover:text-green-600 px-1 text-xs" onClick={handlePrev}>&lt;</button>
              <span className="text-[10px] text-gray-300 dark:text-[#30363d]">|</span>
              <button className="hover:text-green-600 px-1 text-xs" onClick={handleNext}>&gt;</button>
            </div>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Event
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500 text-xs font-semibold">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-semibold text-gray-500 dark:text-[#8b949e] pb-2 border-b dark:border-[#30363d]">
                {day}
              </div>
            ))}
            
            {viewMode === "month" ? (
              // Month View Grid Cells
              (() => {
                const daysInPrevMonth = getDaysInMonth(
                  currentMonth === 1 ? currentYear - 1 : currentYear,
                  currentMonth === 1 ? 12 : currentMonth - 1
                );
                const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
                const totalCells = 42; 
                const cells: React.ReactElement[] = [];
                
                // previous month trailing days
                for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                  const dayNumber = daysInPrevMonth - i;
                  cells.push(
                    <div
                      key={`prev-${dayNumber}`}
                      className="md:h-28 border border-gray-100 dark:border-[#21262d] rounded-md p-2 mt-2 bg-gray-50 dark:bg-[#0d1117] text-gray-300 dark:text-[#30363d]"
                    >
                      <span className="text-xs">{dayNumber}</span>
                    </div>
                  );
                }

                // current month days
                for (let d = 1; d <= daysInCurrentMonth; d++) {
                  const dayData = calendarData?.days?.find((dd) => dd.day === d);
                  const tasksForDay = (dayData?.tasks || []).filter(
                    (t) => enabled[getCategory(t.taskType)]
                  );
                  cells.push(
                    <DayCell
                      key={`curr-${d}`}
                      day={d}
                      tasks={tasksForDay}
                      onClick={() => {
                        const targetDate = new Date(currentYear, currentMonth - 1, d);
                        setActiveDate(targetDate);
                        setSelectedDay(d);
                      }} 
                    />
                  );
                }

                // next month leading days
                const nextDays = totalCells - cells.length;
                for (let d = 1; d <= nextDays; d++) {
                  cells.push(
                    <div
                      key={`next-${d}`}
                      className="md:h-28 border border-gray-100 dark:border-[#21262d] rounded-md p-2 mt-2 bg-gray-50 dark:bg-[#0d1117] text-gray-300 dark:text-[#30363d]"
                    >
                      <span className="text-xs">{d}</span>
                    </div>
                  );
                }

                return cells;
              })()
            ) : (
              // Week View Grid Cells
              getDaysForActiveWeek().map((dateItem) => {
                const isCurrentMonth = dateItem.getMonth() + 1 === currentMonth;
                const d = dateItem.getDate();
                
                const dayData = isCurrentMonth 
                  ? calendarData?.days?.find((dd) => dd.day === d)
                  : null;
                const tasksForDay = (dayData?.tasks || []).filter(
                  (t) => enabled[getCategory(t.taskType)]
                );
                
                const isToday = d === today.getDate() && 
                                dateItem.getMonth() === today.getMonth() && 
                                dateItem.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={`week-${dateItem.getTime()}`}
                    onClick={() => {
                      if (isCurrentMonth) {
                        setSelectedDay(d);
                      } else {
                        // Change active calendar scope to focus neighbor month
                        setCurrentMonth(dateItem.getMonth() + 1);
                        setCurrentYear(dateItem.getFullYear());
                        setActiveDate(dateItem);
                        setSelectedDay(d);
                      }
                    }}
                    className={`md:h-28 border rounded-md p-2 mt-2 hover:border-green-400 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-[#0d2a1a]/30 cursor-pointer relative overflow-hidden transition-colors ${
                      isToday ? 'border-green-500 bg-green-50/20 dark:bg-[#1a3a2a]/20' : 'border-gray-200 dark:border-[#30363d]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-semibold ${isToday ? 'text-green-700 dark:text-[#4ade80]' : 'text-gray-500 dark:text-[#8b949e]'}`}>
                        {d}
                      </span>
                      {!isCurrentMonth && (
                        <span className="text-[8px] text-gray-400 uppercase font-bold tracking-wider">
                          {monthNames[dateItem.getMonth()].substring(0, 3)}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-1 flex space-x-1 justify-center md:justify-start overflow-x-auto no-scrollbar">
                      {tasksForDay.map((task) => (
                        <div
                          key={task.id}
                          className={`h-2 w-2 rounded-full ${CATEGORY[getCategory(task.taskType)].dot} ${
                            task.status === "completed" ? "opacity-40" : ""
                          }`}
                          title={`${task.title} - ${task.status}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL: Render the DayTasksModal */}
      <DayTasksModal
        isOpen={selectedDay !== null}
        tasks={filteredTasksForModal}
        dateString={selectedDateString}
        onClose={() => setSelectedDay(null)}
        onTaskUpdate={fetchCalendar} 
      />

      {/* ADD EVENT MODAL */}
      <AddEventModal
        show={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={fetchCalendar}
      />
    </div>
  );
};

export default CalendarView;

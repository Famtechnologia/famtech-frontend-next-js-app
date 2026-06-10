// src/components/calendar/CalendarView.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Filter } from "lucide-react";
// Assuming these types and services are correctly exported from your lib files
import { getCalendarData, CalendarData } from "@/lib/services/calender";
// createTask service is removed as it is no longer used
import Modal from "../ui/Modal";
// The auth store import is kept for context, though not used in the display logic
import { getTasks, updateTask, createTask, Task } from "../../lib/services/taskplanner";
import CalendarSkeletonLoader from "@/components/skeleton/farm-operation/CalenderSkeleton";

import { getStaffById, getStaffs, StaffType } from "@/lib/services/staff";
import { useProfile } from "@/lib/hooks/useProfile";

interface SelectedDay {
  day: number;
  tasks: Task[];
  dateString: string; // YYYY-MM-DD format for display
}

const DayCell: React.FC<{
  day: number;
  tasks: Task[];
  onClick: () => void;
}> = ({ day, tasks, onClick }) => (
  <div
    className="md:h-28 border border-gray-200 rounded-md p-2 mt-2 hover:border-green-400 hover:bg-green-50 cursor-pointer relative overflow-hidden transition-colors"
    onClick={onClick} // Attach the click handler here
  >
    <span className="text-gray-500 text-xs">{day}</span>
    <div className="absolute inset-x-0 bottom-0 p-1 flex space-x-1 justify-center md:justify-start overflow-x-auto no-scrollbar">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`h-2 w-2 rounded-full ${
            task.status === "completed" ? "bg-green-500" : "bg-orange-500"
          }`}
          title={`${task.title} - ${task.status}`}
        ></div>
      ))}
    </div>
  </div>
);

const DayTasksModal: React.FC<{
  selectedDay: SelectedDay | null;
  selectedDate: string;
  onClose: () => void;
  onTaskUpdate: () => void;
}> = ({ selectedDay, onClose, onTaskUpdate, selectedDate }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [assignee, setAssignee] = useState<string>("");
  const { profile } = useProfile()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks(profile?.id as string);

        const mappedTasks = data.find(
          (task) =>
            task?.timeline?.dueDate &&
            new Date(task.timeline.dueDate).toISOString().split("T")[0] ===
              selectedDate
        );

        // const filteredTasks = mappedTasks.filter(
        //   (task) => task.dueDate === date
        // );
        setTask(mappedTasks || null);
      } catch (err) {
        console.error(err);
      }
    };

    if (selectedDate) {
      fetchTasks();
    }
  }, [profile?.id, selectedDate]);

  const getAssignee = async (id: string) => {
    const res = await getStaffById(id);

    try {
      if (!res) {
        return null;
      }
      setAssignee(res.name as string);
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (task) {
      getAssignee(task?.assignee as string);
    }
    
  }, [task]);

  if (!selectedDay) return null;

  const formattedDate = new Date(selectedDay.dateString).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const handleToggleStatus = async (task: Task) => {
    try {
      // Toggle the status
      const newStatus = task.status === "completed" ? "pending" : "completed";

      // Assuming updateTask takes the task ID and the fields to update
      // We include all required Task properties (omitting `_id` and the deep `timeline` structure might be needed depending on your API structure)
      // For simplicity and compatibility with TaskPlanner API, we pass the necessary fields.
      await updateTask(task.id, { ...task, status: newStatus });

      // Refresh the calendar view
      onTaskUpdate();
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Optionally show a user-facing error message
    }
  };

  return (
    <Modal
      show={!!selectedDay}
      onClose={onClose}
      title={`Tasks for ${formattedDate}`}
    >
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {task ? (
          <div
            key={task.id as string}
            className="p-3 border rounded-md shadow-sm flex justify-between items-center transition-shadow hover:shadow-md border-gray-400"
          >
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold truncate capitalize ${task.status === "completed" ? "line-through text-gray-500" : "text-gray-900"}`}
              >
                {task.title}
              </h4>
              <p className="text-xs text-gray-500 capitalize">
                {assignee} - Priority: {task.priority}
              </p>
            </div>
            <button
              onClick={() => handleToggleStatus(task)}
              className={`ml-4 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                task.status === "completed"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              {task.status === "completed" ? "Done" : "Mark Complete"}
            </button>
          </div>
        ) : (
          <p className="text-gray-500">No tasks scheduled for this day.</p>
        )}
      </div>

      <div className="pt-4 border-t mt-4">
        <p className="text-sm text-gray-400">
          Note: Only tasks for the day are shown. Full details in the Task
          Planner.
        </p>
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
  const [assignee, setAssignee] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.id || !show) return;
    getStaffs(profile.id)
      .then((d) => setStaff(d))
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
      setAssignee("");
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
    "w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

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
            <option value="">Unassigned</option>
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
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50"
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
  const [currentMonth, setCurrentMonth] = useState<number>(
    today.getMonth() + 1
  ); // 1-12
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDayTasks, setSelectedDayTasks] = useState<SelectedDay | null>(
    null
  );
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

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
    setIsLoading(true);
    setError(null);
    try {
      // Note: If user is null, "" is passed for userId, assuming API handles this or it's implicitly part of the auth flow.
      const data = await getCalendarData(
        currentYear,
        currentMonth,
        profile?.id || ""
      );
      setCalendarData(data);
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

  const handleDayClick = (day: number, tasks: Task[]) => {
    const monthString = String(currentMonth).padStart(2, "0");
    const dayString = String(day).padStart(2, "0");

    setSelectedDayTasks({
      day: day,
      tasks: tasks,
      dateString: `${currentYear}-${monthString}-${dayString}`,
    });
  };

  const handleCloseDayTasksModal = () => {
    setSelectedDayTasks(null);
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  if (isLoading) {
    return <CalendarSkeletonLoader />;
  }

  return (
    <div className="bg-white p-2 lg::p-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
      {/* Left Sidebar for Calendar and Filters */}
      <div className="w-full md:w-64 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              {monthNames[currentMonth - 1]} {currentYear}
            </h3>
            <div className="flex items-center space-x-2 text-gray-400">
              <button onClick={handlePreviousMonth}>&lt;</button>
              <button onClick={handleNextMonth}>&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div key={day + index} className="font-medium text-gray-500">
                {day}
              </div>
            ))}
            {blankDays.map((_, index) => (
              <div key={`blank-${index}`}></div>
            ))}
            {[...Array(getDaysInMonth(currentYear, currentMonth)).keys()].map(
              (day) => (
                <div
                  key={day}
                  className={`p-2 rounded-lg cursor-pointer ${
                    day + 1 === today.getDate() &&
                    currentMonth === today.getMonth() + 1 &&
                    currentYear === today.getFullYear()
                      ? "bg-green-100 text-green-700 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {day + 1}
                </div>
              )
            )}
          </div>
        </div>

        {/* View Options */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            VIEW OPTIONS
          </h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
              Month
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">
              Week
            </button>
          </div>
        </div>

        {/* Filter Events */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            FILTER EVENTS
          </h3>
          <div className="space-y-2">
            {[
              "Crop Tasks",
              "Livestock Tasks",
              "Equipment",
              "General Tasks",
            ].map((type) => (
              <div
                key={type}
                className="flex items-center space-x-2 p-2 rounded-xl text-sm font-medium text-gray-600"
              >
                <input
                  type="checkbox"
                  className="rounded-sm text-green-600"
                  defaultChecked
                />
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            LEGEND
          </h3>
          <div className="space-y-3">
            {[
              { label: "Seeding", color: "bg-green-500", icon: "Bean" },
              { label: "Fertilizer", color: "bg-blue-500", icon: "Wrench" },
              { label: "Harvesting", color: "bg-yellow-500", icon: "Apple" },
              { label: "Livestock", color: "bg-purple-500", icon: "Cow" },
              { label: "Equipment", color: "bg-red-500" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600"
              >
                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth - 1]} {currentYear}
          </h2>
          <div className="flex items-center space-x-2">
            <div className="relative inline-block text-left">
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
                <Filter className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden md:flex">Add&nbsp;</span>
              <span>Event</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-medium text-gray-500">
                {day}
              </div>
            ))}
            {/* build full 6-row × 7-col grid including previous/next month days */}
            {(() => {
              const daysInPrevMonth = getDaysInMonth(
                currentMonth === 1 ? currentYear - 1 : currentYear,
                currentMonth === 1 ? 12 : currentMonth - 1
              );
              const daysInCurrentMonth = getDaysInMonth(
                currentYear,
                currentMonth
              );
              const totalCells = 42; // 6 rows * 7 columns

              const cells: React.ReactElement[] = [];
              // previous month trailing days
              for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                // Corrected loop based on firstDayOfMonth
                const dayNumber = daysInPrevMonth - i;
                cells.push(
                  <div
                    key={`prev-${dayNumber}`}
                    className="md:h-28 border border-gray-200 rounded-md p-2 mt-2 bg-gray-50 text-gray-400"
                  >
                    <span className="text-xs">{dayNumber}</span>
                  </div>
                );
              }

              // current month days
              for (let d = 1; d <= daysInCurrentMonth; d++) {
                const dayData = calendarData?.days?.find((dd) => dd.day === d);
                const tasksForDay = dayData?.tasks || [];
                cells.push(
                  <DayCell
                    key={`curr-${d}`}
                    day={d}
                    tasks={tasksForDay}
                    onClick={() => handleDayClick(d, tasksForDay)} // ADD CLICK HANDLER
                  />
                );
              }

              // next month leading days
              const nextDays = totalCells - cells.length;
              for (let d = 1; d <= nextDays; d++) {
                cells.push(
                  <div
                    key={`next-${d}`}
                    className="md:h-28 border border-gray-200 rounded-md p-2 mt-2 bg-gray-50 text-gray-400"
                  >
                    <span className="text-xs">{d}</span>
                  </div>
                );
              }

              return cells;
            })()}
          </div>
        )}
      </div>

      {/* MODAL: Render the DayTasksModal */}
      <DayTasksModal
        selectedDay={selectedDayTasks}
        selectedDate={`${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(selectedDayTasks?.day).padStart(2, "0")}`}
        onClose={handleCloseDayTasksModal}
        onTaskUpdate={fetchCalendar} // Pass fetchCalendar to refresh data after an update (e.g., status change)
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

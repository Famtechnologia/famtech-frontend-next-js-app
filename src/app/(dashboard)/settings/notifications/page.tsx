"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone, CheckCircle, AlertTriangle, CloudSun, ClipboardList, Users, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

interface NotifGroup {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  channels: { email: boolean; push: boolean };
}

const DEFAULT_GROUPS: NotifGroup[] = [
  {
    key: "tasks",
    label: "Task Reminders",
    description: "Alerts for upcoming, overdue, or newly assigned tasks.",
    icon: ClipboardList,
    channels: { email: true, push: true },
  },
  {
    key: "health",
    label: "Farm Health Alerts",
    description: "Disease detections, treatment recommendations, and health updates.",
    icon: AlertTriangle,
    channels: { email: true, push: true },
  },
  {
    key: "weather",
    label: "Weather Advisories",
    description: "Extreme weather warnings and climate change notifications.",
    icon: CloudSun,
    channels: { email: false, push: true },
  },
  {
    key: "staff",
    label: "Staff Activity",
    description: "Staff task completions, new assignments, and status updates.",
    icon: Users,
    channels: { email: false, push: true },
  },
  {
    key: "analytics",
    label: "Analytics & Reports",
    description: "Weekly farm summaries, yield reports, and performance KPIs.",
    icon: TrendingUp,
    channels: { email: true, push: false },
  },
];

export default function NotificationsPage() {
  const [groups, setGroups] = useState<NotifGroup[]>(DEFAULT_GROUPS);
  const [saving, setSaving] = useState(false);

  const toggle = (key: string, channel: "email" | "push") => {
    setGroups((prev) =>
      prev.map((g) =>
        g.key === key
          ? { ...g, channels: { ...g.channels, [channel]: !g.channels[channel] } }
          : g
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast.success("Notification preferences saved.");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-[#1a3a2a] flex items-center justify-center">
          <Bell className="w-5 h-5 text-green-600 dark:text-[#4ade80]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">Notification Settings</h1>
          <p className="text-sm text-gray-500 dark:text-[#8b949e]">Choose what you get notified about and how.</p>
        </div>
      </div>

      {/* Channel legend */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#8b949e] font-medium">
          <Mail className="w-3.5 h-3.5" /> Email
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#8b949e] font-medium">
          <Smartphone className="w-3.5 h-3.5" /> Push
        </div>
      </div>

      {/* Notification groups */}
      <div className="space-y-3">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.key}
              className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl shadow-sm"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-[#21262d] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-green-600 dark:text-[#4ade80]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">{group.label}</p>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-0.5 leading-relaxed">{group.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Email toggle */}
                <button
                  onClick={() => toggle(group.key, "email")}
                  title="Email"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    group.channels.email
                      ? "bg-green-100 dark:bg-[#1a3a2a] text-green-600 dark:text-[#4ade80]"
                      : "bg-gray-100 dark:bg-[#21262d] text-gray-400 dark:text-[#8b949e]"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                </button>

                {/* Push toggle */}
                <button
                  onClick={() => toggle(group.key, "push")}
                  title="Push"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    group.channels.push
                      ? "bg-green-100 dark:bg-[#1a3a2a] text-green-600 dark:text-[#4ade80]"
                      : "bg-gray-100 dark:bg-[#21262d] text-gray-400 dark:text-[#8b949e]"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-xl transition-colors"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

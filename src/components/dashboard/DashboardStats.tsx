"use client";

import {
  Tractor,
  Sprout,
  Beef,
  ListChecks,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface Stat {
  label: string;
  value: string;
  delta: number; // % change vs last month
  positiveIsGood: boolean;
  Icon: LucideIcon;
  iconClass: string;
  stroke: string;
  gradientId: string;
  data: { v: number }[];
}

const toSpark = (arr: number[]) => arr.map((v) => ({ v }));

const stats: Stat[] = [
  {
    label: "Active Farms",
    value: "8",
    delta: 12.5,
    positiveIsGood: true,
    Icon: Tractor,
    iconClass: "bg-emerald-50 text-emerald-600",
    stroke: "#10b981",
    gradientId: "spark-farms",
    data: toSpark([3, 4, 4, 5, 6, 6, 7, 8]),
  },
  {
    label: "Crops Tracked",
    value: "34",
    delta: 6.2,
    positiveIsGood: true,
    Icon: Sprout,
    iconClass: "bg-green-50 text-green-600",
    stroke: "#22c55e",
    gradientId: "spark-crops",
    data: toSpark([20, 22, 25, 24, 28, 30, 32, 34]),
  },
  {
    label: "Livestock",
    value: "126",
    delta: 3.1,
    positiveIsGood: true,
    Icon: Beef,
    iconClass: "bg-amber-50 text-amber-600",
    stroke: "#f59e0b",
    gradientId: "spark-livestock",
    data: toSpark([110, 112, 115, 118, 120, 122, 124, 126]),
  },
  {
    label: "Tasks Completed",
    value: "24",
    delta: 8.0,
    positiveIsGood: true,
    Icon: ListChecks,
    iconClass: "bg-sky-50 text-sky-600",
    stroke: "#0ea5e9",
    gradientId: "spark-tasks",
    data: toSpark([12, 14, 13, 16, 18, 20, 22, 24]),
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.Icon;
        const up = s.delta >= 0;
        const good = up === s.positiveIsGood;
        return (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-500">{s.label}</p>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconClass} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={18} />
              </span>
            </div>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-gray-900">
                {s.value}
              </span>
              <span
                className={`mb-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  good
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(s.delta)}%
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">vs last month</p>

            <div className="mt-3 h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={s.data}
                  margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id={s.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.stroke} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={s.stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={s.stroke}
                    strokeWidth={2}
                    fill={`url(#${s.gradientId})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}

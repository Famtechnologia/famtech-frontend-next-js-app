"use client";

import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", yield: 32 },
  { month: "Feb", yield: 41 },
  { month: "Mar", yield: 38 },
  { month: "Apr", yield: 54 },
  { month: "May", yield: 49 },
  { month: "Jun", yield: 63 },
];

export default function ProductionChart() {
  const total = data.reduce((a, b) => a + b.yield, 0);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Production overview
          </h3>
          <p className="text-sm text-gray-500">Monthly yield (tons)</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {total}
            <span className="text-sm font-medium text-gray-400"> t</span>
          </p>
          <p className="text-xs font-semibold text-emerald-600">
            +14% this season
          </p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            />
            <Bar
              dataKey="yield"
              fill="#16a34a"
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

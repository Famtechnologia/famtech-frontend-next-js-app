"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Maize", value: 45, color: "#16a34a" },
  { name: "Cassava", value: 25, color: "#22c55e" },
  { name: "Rice", value: 18, color: "#86efac" },
  { name: "Other", value: 12, color: "#cbd5e1" },
];

export default function CropDistribution() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">Crop distribution</h3>
      <p className="text-sm text-gray-500">Share of total acreage</p>

      <div className="relative mt-2 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">4</span>
          <span className="text-xs text-gray-400">crop types</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.name}
            </span>
            <span className="font-semibold text-gray-900">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

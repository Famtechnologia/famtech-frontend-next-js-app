"use client";

import { ArrowUpRight } from "lucide-react";

type Status = "Completed" | "In progress" | "Scheduled" | "Overdue";

const statusClass: Record<Status, string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  "In progress": "bg-amber-50 text-amber-700",
  Scheduled: "bg-sky-50 text-sky-700",
  Overdue: "bg-red-50 text-red-700",
};

const rows: {
  activity: string;
  farm: string;
  field: string;
  date: string;
  status: Status;
}[] = [
  { activity: "Planted maize seedlings", farm: "Green Acres", field: "Field A-2", date: "Today", status: "In progress" },
  { activity: "Irrigation cycle completed", farm: "Riverside Farm", field: "Field B-1", date: "Yesterday", status: "Completed" },
  { activity: "Livestock health check", farm: "Hillside Ranch", field: "Pen 3", date: "2 days ago", status: "Completed" },
  { activity: "Fertilizer application", farm: "Green Acres", field: "Field A-1", date: "In 2 days", status: "Scheduled" },
  { activity: "Pest inspection", farm: "Sunrise Plots", field: "Field C-4", date: "Overdue", status: "Overdue" },
];

export default function RecentActivity() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Recent activity</h3>
          <p className="text-sm text-gray-500">Latest tasks across your farms</p>
        </div>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-green-600 transition-colors hover:text-green-700">
          View all <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3 font-medium">Activity</th>
              <th className="px-5 py-3 font-medium">Farm</th>
              <th className="px-5 py-3 font-medium">Field</th>
              <th className="px-5 py-3 font-medium">When</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={i} className="transition-colors hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{r.activity}</td>
                <td className="px-5 py-3 text-gray-600">{r.farm}</td>
                <td className="px-5 py-3 text-gray-600">{r.field}</td>
                <td className="px-5 py-3 text-gray-500">{r.date}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

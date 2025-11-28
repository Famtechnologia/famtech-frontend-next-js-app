"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PerformanceChartProps {
  labels?: string[];
  values?: number[];
  title?: string;
}

export default function PerformanceChart({ labels = [], values = [], title = "Performance" }: PerformanceChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        fill: true,
        backgroundColor: 'rgba(16,163,74,0.08)',
        borderColor: 'rgba(16,163,74,1)',
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
      tooltip: { mode: 'index', intersect: false },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: {
      x: { display: true, grid: { display: false } },
      y: { display: true, grid: { color: '#f3f4f6' } },
    },
  };

  return (
    <div style={{ height: 220 }} className="w-full">
      <Line options={options} data={data} />
    </div>
  );
}

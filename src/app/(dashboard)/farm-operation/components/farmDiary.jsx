'use client';
import { Plus, Calendar, NotebookPen, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';

const FarmDiary = () => {
  // 🔒 Temporary placeholder: Mock data commented out until integration
  /*
  const activities = [
    { activity: "Planted Maize", date: "Jun 15, 2023" },
    { activity: "Applied NPK Fertilizer", date: "Jun 20, 2023" }
  ];
  */

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>Farm Diary</span>
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      }
      className="h-full"
      headerClassName="bg-green-50 border-b border-green-200"
      bodyClassName="p-6 flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
          <NotebookPen className="w-7 h-7 text-green-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Coming Soon</p>
          <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
            Record and manage your farm activities. Track planting, harvesting, and fertilizer applications all in one place.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default FarmDiary;

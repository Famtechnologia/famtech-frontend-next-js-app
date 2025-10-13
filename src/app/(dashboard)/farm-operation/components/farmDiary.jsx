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
      className="h-fit"
      headerClassName="bg-green-50 border-b border-green-200"
      bodyClassName="p-6"
    >
      <div className="flex flex-col justify-between min-h-[180px]">
        {/* Empty State Message */}
        <div className="flex flex-col items-center justify-center text-center text-gray-600 mt-4">
          <NotebookPen className="w-8 h-8 text-green-500 mb-3" />
          <p className="text-sm mb-4 max-w-xs">
            Record and manage your farm activities easily. Track planting, harvesting, and fertilizer applications all in one place.
          </p>
        </div>

        
      </div>
    </Card>
  );
};

export default FarmDiary;

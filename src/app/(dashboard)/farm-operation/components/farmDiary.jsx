// Farm Diary Card
import { Plus, Calendar,  } from 'lucide-react';
import Card from '@/components/ui/Card'


const FarmDiary = () => {
  const activities = [
    { activity: "Planted Maize", date: "Jun 15, 2023" },
    { activity: "Applied NPK Fertilizer", date: "Jun 20, 2023" }
  ];

  return (
    <Card title="Farm Diary" className="h-fit" headerClassName='bg-green-50 border-b border-blue-200' bodyClassName='p-6'>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Recent Activities</span>
          <button className="p-1 ">
            <Plus className="w-6 h-6 text-white text-lg bg-green-600  rounded-3xl cursor-pointer hover:w-5 hover:h-5 transition ease-in-out" />
          </button>
        </div>
        
        {activities.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 py-2">
            <Calendar className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-800">{item.activity}</div>
              <div className="text-xs text-gray-500">{item.date}</div>
            </div>
          </div>
        ))}
        
        <button className="text-green-600 text-sm font-medium hover:text-green-700 flex items-center">
          View diary →
        </button>
      </div>
    </Card>
  );
};

export default FarmDiary;
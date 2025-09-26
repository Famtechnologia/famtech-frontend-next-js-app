// Example: app/farm-operation/page.tsx or app/farm-operation/[subRole]/page.tsx
'use client';

import React, { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Calendar, Grid, ClipboardList, Leaf} from 'lucide-react';

// Import all your tab components
import InventoryManagement from '@/components/farm-operation/InventoryManagement';
import CropLivestockRecords from '@/components/farm-operation/CropLivestockRecords';
import CalendarView from '@/components/farm-operation/CalenderView';
import TaskPlanner from '@/components/farm-operation/TaskPlanner';
// Ensure you have an EquipmentUsage component


// --- 1. Define the Tab Data Structure ---
const tabsConfig = [
    { label: 'Task Planner', icon: ClipboardList, key: 'planner' },
    { label: 'Calendar View', icon: Calendar, key: 'calendar' },
    { label: 'Inventory Management', icon: Grid, key: 'inventory' },
    { label: 'Crop & Livestock Records', icon: Leaf, key: 'records' },
    
];

// --- 2. The Main Page Component ---
export default function FarmOperationsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Get the current tab from the URL query, defaulting to 'planner'
    const activeTabKey = searchParams.get('tab') || 'planner'; 

    // Function to handle tab clicks (updates the URL query)
    const handleTabChange = (key: string) => {
        const newUrl = `${pathname}?tab=${key}`;
        router.push(newUrl, { scroll: false });
    };

    // 3. The CASE/SWITCH Logic
    const ActiveComponent = useMemo(() => {
        switch (activeTabKey) {
            case 'planner':
                return <TaskPlanner />;
            case 'calendar':
                return <CalendarView />;
            case 'inventory':
                return <InventoryManagement />;
            case 'records':
                return <CropLivestockRecords />;
           
            default:
                return <TaskPlanner />;
        }
    }, [activeTabKey]);

    return (
        <div className="p-0 md:p-6 bg-white">
            <h1 className="text-3xl font-semibold text-green-700 mb-6">Farm Operations</h1>

            {/* Internal Tab Navigation Driven by URL Query */}
            <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-6 -mt-2">
                {tabsConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTabKey === tab.key;
                    
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors
                                ${isActive
                                    ? 'border-b-2 border-green-600 text-green-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Render the Active Component */}
            <div className="mt-4">
                {ActiveComponent}
            </div>
        </div>
    );
}
'use client';

import React, { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Calendar,ClipboardList, Leaf, Users } from 'lucide-react';

// Import all your tab components

import CropLivestockRecords from '@/components/farm-operation/CropLivestockRecords';
import CalendarView from '@/components/farm-operation/CalenderView';
import TaskPlanner from '@/components/farm-operation/TaskPlanner';
import StaffManagement from '@/components/farm-operation/StaffManagement';
// Ensure you have an EquipmentUsage component


// --- 1. Define the Tab Data Structure ---
const tabsConfig = [
    { label: 'Task Planner', icon: ClipboardList, key: 'planner' },
    { label: 'Calendar View', icon: Calendar, key: 'calendar' },
    
    { label: 'Crop & Livestock Records', icon: Leaf, key: 'records' },
    { label: 'Staff Management', icon: Users, key: 'staff' },
    
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
            
            case 'records':
                return <CropLivestockRecords />;
            case 'staff':
                return <StaffManagement />;
           
            default:
                return <TaskPlanner />;
        }
    }, [activeTabKey]);

    return (
        <div className="p-0 md:p-6 bg-white dark:bg-[#0d1117]">
            <h1 className="text-2xl font-semibold text-green-700 dark:text-[#4ade80] mb-4 px-4 md:px-0 pt-4 md:pt-0">Farm Operations</h1>

            {/* Tab strip — horizontally scrollable on mobile */}
            <div className="flex overflow-x-auto no-scrollbar gap-1 px-3 md:px-0 pb-0 mb-5 border-b border-gray-200 dark:border-[#30363d]">
                {tabsConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTabKey === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs md:text-sm font-medium whitespace-nowrap transition-colors shrink-0 border-b-2 -mb-px
                                ${isActive
                                    ? 'border-green-600 text-green-700 dark:text-[#4ade80] dark:border-[#4ade80]'
                                    : 'border-transparent text-gray-500 dark:text-[#8b949e] hover:text-gray-700 dark:hover:text-[#e6edf3]'
                                }`}
                        >
                            <Icon size={15} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Active tab content */}
            <div>
                {ActiveComponent}
            </div>
        </div>
    );
}
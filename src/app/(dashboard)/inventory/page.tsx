import React from 'react'
import InventoryManagement from '@/components/farm-operation/InventoryManagement';
const page = () => {
  return (
    
        <div className="p-0 md:p-6 bg-white dark:bg-[#0d1117]">
            <h1 className="text-3xl font-semibold text-green-700 mb-2 border-b border-gray-200 dark:border-[#30363d] pb-4">Farm Supplies & Seeds</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Track seeds, fertilizers, pesticides, feed, and farm equipment tools.</p>
            <InventoryManagement />
        </div>
  )
}

export default page
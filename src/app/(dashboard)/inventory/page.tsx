import React from 'react'
import InventoryManagement from '@/components/farm-operation/InventoryManagement';
const page = () => {
  return (
    
        <div className="p-0 md:p-6 bg-white">
            <h1 className="text-3xl font-semibold text-green-700 mb-6">Inventory Management</h1>
        <InventoryManagement />
    </div>
  )
}

export default page
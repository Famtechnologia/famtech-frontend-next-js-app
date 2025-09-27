import React from 'react'
import { SeedItem, FeedItem, FertilizerItem, ToolItem, EquipmentPartItem, } from '@/types/inventory';
 type NewInventoryItemData =
  | (Omit<SeedItem, 'id' | 'timestamp'> & { category: 'seeds' })
  | (Omit<FeedItem, 'id' | 'timestamp'> & { category: 'feed' })
  | (Omit<FertilizerItem, 'id' | 'timestamp'> & { category: 'fertilizer' })
  | (Omit<ToolItem, 'id' | 'timestamp'> & { category: 'tools' })
  | (Omit<EquipmentPartItem, 'id' | 'timestamp'> & { category: 'equipment parts' });






const renderFormFields = (
  data: NewInventoryItemData,
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
) => {
  switch (data.category)  {
            case 'seeds':
                const seedData = data as Omit<SeedItem, '_id' | 'timestamp'>;
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Seed Name</label>
                            <input type="text" id="name" name="name" required value={seedData.name} onChange={handleChange} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Maize Seeds" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
                            <input type="number" id="quantity" name="quantity" required value={seedData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 250" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (kg)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={seedData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 50" />
                        </div>
                        <div>
                            <label htmlFor="usageRate" className="block text-sm font-medium text-gray-700">Usage Rate (kg/week)</label>
                            <input type="text" id="usageRate" name="usageRate" value={seedData.usageRate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="date" id="expireDate" name="expireDate" value={seedData.expireDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                        </div>
                    </>
                );
            case 'feed':
                const feedData = data as Omit<FeedItem, '_id' | 'timestamp'>;
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Feed Name</label>
                            <input type="text" id="name" name="name" required value={feedData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Alfalfa Hay" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Bags)</label>
                            <input type="number" id="quantity" name="quantity" required value={feedData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 50" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (Bags)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={feedData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                            <select id="type" name="type" value={feedData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                                <option value="Concentrate">Concentrate</option>
                                <option value="Hay">Hay</option>
                                <option value="Silage">Silage</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="date" id="expireDate" name="expireDate" value={feedData.expireDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                        </div>
                    </>
                );
            case 'fertilizer':
                const fertData = data as Omit<FertilizerItem, '_id' | 'timestamp'>;
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Fertilizer Name</label>
                            <input type="text" id="name" name="name" required value={fertData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10-10-10" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Bags)</label>
                            <input type="number" id="quantity" name="quantity" required value={fertData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 20" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (Bags)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={fertData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 5" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                            <select id="type" name="type" value={fertData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                                <option value="Liquid">Liquid</option>
                                <option value="Granular">Granular</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="n" className="block text-sm font-medium text-gray-700">Nitrogen (N %)</label>
                            <input type="number" id="n" name="n" value={fertData.n || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="p" className="block text-sm font-medium text-gray-700">Phosphorus (P %)</label>
                            <input type="number" id="p" name="p" value={fertData.p || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="k" className="block text-sm font-medium text-gray-700">Potassium (K %)</label>
                            <input type="number" id="k" name="k" value={fertData.k || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10" />
                        </div>
                        <div>
                            <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="date" id="expireDate" name="expireDate" value={fertData.expireDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                        </div>
                    </>
                );
            case 'tools':
                const toolData = data as Omit<ToolItem, ''>; // Cast for correct type inference
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tool Name</label>
                            <input type="text" id="name" name="name" required value={toolData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Shovel" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Units)</label>
                            <input type="number" id="quantity" name="quantity" required value={toolData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 5" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (Units)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={toolData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 1" />
                        </div>
                    </>
                );
            case 'equipment parts':
                const equipmentPartData = data as Omit<EquipmentPartItem, ''>; // Cast for correct type inference
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Part Name</label>
                            <input type="text" id="name" name="name" required value={equipmentPartData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Tractor Oil Filter" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (Units)</label>
                            <input type="number" id="quantity" name="quantity" required value={equipmentPartData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 3" />
                        </div>
                        <div>
                            <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700">Reorder Level (Units)</label>
                            <input type="number" id="reorderLevel" name="reorderLevel" required value={equipmentPartData.reorderLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 1" />
                        </div>
                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                            <input type="text" id="model" name="model" required value={equipmentPartData.model} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., John Deere 404" />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

export default renderFormFields
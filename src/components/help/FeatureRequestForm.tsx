// src/components/FeatureRequestForm.tsx
'use client';
import React, { useState } from 'react';
import { FeatureRequest } from '@/types/feature'; // Assuming the type is here

interface FeatureRequestFormProps {
  farmId: string; // Pass the current farm's ID as a prop
  onSubmit: (request: Omit<FeatureRequest, 'id' | 'status' | 'dateRequested'>) => void;
}

const FeatureRequestForm: React.FC<FeatureRequestFormProps> = ({ farmId, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Integration' | 'Reporting' | 'Automation' | 'Other'>('Other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    // Call the parent handler with the new request data
    onSubmit({
      farmId,
      title,
      description,
      category,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Other');
  };

  return (
    <div className="bg-white p-2 md:p-6 rounded-xl md:shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4"> Request a New Feature for Your Farm</h2>
      <p className="text-sm text-gray-500 mb-6">Tell us what custom tools or reports your farm needs to operate better.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-base font-medium text-gray-900">Feature Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 transition duration-150"
            placeholder="E.g., Custom Pesticide Application Report"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-base font-medium text-gray-900">Detailed Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 transition duration-150"
            placeholder="Explain why this feature is needed and how it will help your specific farm operations."
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-base font-medium text-gray-800">Category</label>
          <select
            id="category"
            value={category}
           // onChange={(e) => setCategory(e.target.value as any)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 appearance-none bg-white transition duration-150"
          >
            <option value="Integration">System Integration</option>
            <option value="Reporting">Custom Reporting</option>
            <option value="Automation">Process Automation</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="pt-2">
            <button
            type="submit"
            className="w-full max-w-lg flex justify-center items-center mx-auto py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
            >
            Submit Feature Request
            </button>
        </div>
      </form>
    </div>
  );
};

export default FeatureRequestForm;
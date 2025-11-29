// src/app/help/request/page.tsx
'use client';

import React from 'react';
import FeatureRequestForm from '@/components/help/FeatureRequestForm';
import { FeatureRequest } from '@/types/feature';

const CURRENT_FARM_ID = 'FARM-A392';

const FeatureRequestPage: React.FC = () => {
  const handleNewRequest = (
    newRequestData: Omit<FeatureRequest, 'id' | 'status' | 'dateRequested'>
  ) => {
    const newRequest: FeatureRequest = {
      ...newRequestData,
      id: `req-${Date.now()}`,
      status: 'Pending',
      dateRequested: new Date().toISOString(),
    };

    console.log('Sending feature request to server:', newRequest);
    alert('Thank you! Your feature request has been submitted.');
  };

  return (
    <div className="p-2 md:p-8 bg-white min-h-screen flex justify-center items-start">
      <div className="w-full ">
        <h1 className="text-3xl font-extrabold text-green-700 mb-8 text-center md:text-start">
          Custom Feature Request
        </h1>

        <FeatureRequestForm
          farmId={CURRENT_FARM_ID}
          onSubmit={handleNewRequest}
        />

        <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-md">
          <p className="text-sm">
            <strong>Note:</strong> This form is for custom features specific to
            your farm <strong>{CURRENT_FARM_ID}</strong>. For general support or
            bug reports, please use the Support channel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureRequestPage;

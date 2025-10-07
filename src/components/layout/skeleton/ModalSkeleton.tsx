import React from 'react';
import Skeleton from './Skeleton'; // Assuming you still use the Skeleton utility

/**
 * Renders the loading placeholder for the content inside your Modal.
 * It mirrors the Modal's header and body padding/structure.
 */
const ModalContentSkeleton: React.FC = () => {
  return (
    <div className="w-full">
      {/* NOTE: Since your main Modal component already handles the backdrop, 
        container, and X button, this component only needs to fill the 
        "Modal Header" and "Modal Body" sections with placeholders. 
      */}

      {/* 1. MIRROR MODAL HEADER CONTENT */}
      {/* Your Modal Header applies p-6, border-b, flex, justify-between */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        
        {/* MIMIC H2 TITLE: text-xl font-semibold */}
        <Skeleton className="h-7 w-2/5" /> 
        
        {/* MIMIC CLOSE BUTTON: Since the button is fixed, we skip a skeleton for it */}
        <div className="h-6 w-6"></div> {/* Placeholder space for the X icon */}
      </div>

      {/* 2. MIRROR MODAL BODY CONTENT */}
      {/* Your Modal Body applies p-6 */}
      <div className="p-6">
        
        {/* Placeholder Content Lines (mimicking typical form or text content) */}
        <div className="space-y-4">
          {/* Main content block */}
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-10/12 mb-6" />

          {/* Another content block (e.g., a form field group) */}
          <Skeleton className="h-5 w-1/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          {/* Button placeholder at the bottom */}
          <div className="pt-4 flex justify-end">
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalContentSkeleton;
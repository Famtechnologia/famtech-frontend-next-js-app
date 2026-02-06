const WarehouseCardSkeleton = () => {
  return (
    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full animate-pulse">
      {/* Top content */}
      <div className="p-4 sm:p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2 w-full max-w-[70%]">
            {/* Warehouse name */}
            <div className="h-6 w-full bg-gray-200 rounded"></div>
          </div>

          {/* Action icons */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Info section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="h-4 w-full max-w-[85%] bg-gray-200 rounded"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-5 w-5 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="h-4 w-full max-w-[70%] bg-gray-200 rounded"></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="h-4 w-full max-w-[90%] bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="p-3 sm:p-4 border-t border-gray-100 mt-auto">
        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export default WarehouseCardSkeleton;

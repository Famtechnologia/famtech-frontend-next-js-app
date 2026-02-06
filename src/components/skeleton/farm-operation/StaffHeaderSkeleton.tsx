const StaffHeaderSkeleton = () => {
    return (
      <div className="md:flex justify-between items-center space-y-4 md:space-y-0 mb-8 animate-pulse">
        {/* Search */}
        <div className="h-10 w-full max-w-xs bg-gray-200 rounded-lg" />
  
        {/* Buttons */}
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          <div className="h-10 w-24 bg-gray-200 rounded-lg hidden lg:block" />
          <div className="h-10 w-32 bg-gray-300 rounded-lg" />
        </div>
      </div>
    );
  };
  
  export default StaffHeaderSkeleton;
  
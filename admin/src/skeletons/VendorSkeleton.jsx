import React from "react";

const VendorSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
        >
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full" />
          </div>

          {/* Text placeholders */}
          <div className="text-center space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorSkeleton;

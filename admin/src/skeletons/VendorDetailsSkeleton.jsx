import React from "react";

function VendorDetailsSkeleton() {
  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100 animate-pulse">
      {/* Sidebar Skeleton */}
      {/* Main content */}
      <div className="w-full flex flex-col p-6">
        {/* UpperBar Skeleton */}
        <div className="h-12 bg-gray-200 rounded mb-6"></div>

        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex mb-6 gap-4">
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VendorDetailsSkeleton;

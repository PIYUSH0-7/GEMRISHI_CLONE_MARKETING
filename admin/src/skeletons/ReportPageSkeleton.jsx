import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ReportPageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton height={80} borderRadius={20} /> {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton height={100} borderRadius={12} /> {/* Revenue */}
        <Skeleton height={100} borderRadius={12} /> {/* Orders */}
        <Skeleton height={100} borderRadius={12} /> {/* Avg Order */}
      </div>
      <Skeleton height={400} borderRadius={30} /> {/* Charts */}
      <Skeleton height={300} borderRadius={30} /> {/* Other charts */}
    </div>
  );
}

export default ReportPageSkeleton;

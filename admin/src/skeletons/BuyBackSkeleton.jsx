import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BuyBackSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
            <Skeleton circle width={32} height={32} />
            <Skeleton height={14} width="60%" className="mt-2" />
            <Skeleton height={24} width="40%" className="mt-2" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mt-6">
        <Skeleton height={40} width={130} />
        <Skeleton height={40} width={130} />
      </div>

      {/* Request Cards */}
      <div className="space-y-4 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton width={96} height={96} />
              <div className="flex-1">
                <Skeleton height={20} width="50%" />
                <Skeleton height={12} width="30%" className="mt-2" />
                <Skeleton height={14} width="60%" className="mt-2" />
                <Skeleton height={14} width="40%" className="mt-2" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Skeleton height={24} width={100} />
              <div className="flex gap-3">
                <Skeleton height={36} width={100} />
                <Skeleton height={36} width={100} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
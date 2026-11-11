import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const BannerSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="relative flex justify-center bg-gray-50 p-2 rounded-lg"
        >
          {/* Image Skeleton */}
          <Skeleton height={160} width="100%" className="rounded" />

          {/* Name overlay skeleton */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <Skeleton width={80} height={20} />
          </div>

          {/* Edit button skeleton */}
          <div className="absolute top-2 right-12">
            <Skeleton circle height={24} width={24} />
          </div>

          {/* Delete button skeleton */}
          <div className="absolute top-2 right-2">
            <Skeleton circle height={24} width={24} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerSkeleton;

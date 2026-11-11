import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CategorySkeleton = () => {
  return (
    <div className="p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-6">
          {/* Parent Category Skeleton */}
          <div className="flex justify-between items-center mb-2 p-2">
            <Skeleton height={28} width={150} />
            <Skeleton circle height={32} width={32} />
          </div>

          {/* Subcategories Skeleton */}
          <div className="grid grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div
                key={j}
                className="flex p-2 items-center gap-2 border rounded-2xl"
              >
                <Skeleton circle height={48} width={48} />
                <Skeleton height={16} width={64} />
              </div>
            ))}
          </div>

          {/* Add New Category Skeleton */}
          <div className="mt-4">
            <Skeleton height={40} width={160} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategorySkeleton;

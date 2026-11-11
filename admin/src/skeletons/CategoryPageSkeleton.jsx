// components/CategoryPageSkeleton.jsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import ProductCardSkeleton from "./ProductCardSkeleton";

const CategoryPageSkeleton = () => {
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Image & Title */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton height={300} width={250} />
        <div className="flex-1 flex flex-col gap-4">
          <Skeleton height={40} width="60%" />
          <Skeleton height={20} width="90%" count={3} />
          <Skeleton height={25} width="40%" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} height={40} width={120} />
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-5 gap-8">
        {Array(5).fill(0).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Skeleton height={40} width={200} />
      </div>
    </div>
  );
};

export default CategoryPageSkeleton;

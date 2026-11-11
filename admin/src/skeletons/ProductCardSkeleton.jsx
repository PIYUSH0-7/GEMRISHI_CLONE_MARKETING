import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Card = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-lg bg-white shadow-sm p-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const ProductCardSkeleton = () => {
  return (
    <Card>
      <div className="relative flex justify-center items-center mb-4">
        <Skeleton height={120} width={120} />
      </div>
      <div className="text-center space-y-2">
        <Skeleton height={20} width={120} />
        <Skeleton height={14} width={100} />
        <Skeleton height={18} width={80} />
        <Skeleton height={12} width={60} />
      </div>
    </Card>
  );
};

export default ProductCardSkeleton;

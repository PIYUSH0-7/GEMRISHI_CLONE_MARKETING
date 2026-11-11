import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const OrderRowSkeleton = () => {
  return (
    <div className="grid grid-cols-7 gap-4 px-5 py-4 border-b border-[rgba(18,2,19,0.1)]">
      <Skeleton height={20} />
      <div>
        <Skeleton height={20} width="80%" />
        <Skeleton height={14} width="60%" />
      </div>
      <Skeleton height={20} width="70%" />
      <Skeleton height={28} width={80} />
      <Skeleton height={20} width="60%" />
      <Skeleton height={20} width="50%" />
      <Skeleton height={20} width="70%" />
    </div>
  );
};

export default OrderRowSkeleton;

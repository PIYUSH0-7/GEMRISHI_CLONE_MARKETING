import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CustomerListSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-5 gap-4 px-5 py-4 border-b border-[rgba(18,2,19,0.1)]"
        >
          <div><Skeleton width={50} /></div>
          <div>
            <Skeleton width={`80%`} height={15} />
            <Skeleton width={`60%`} height={12} className="mt-1" />
            <Skeleton width={`60%`} height={12} className="mt-1" />
          </div>
          <div><Skeleton width={30} /></div>
          <div><Skeleton width={60} /></div>
          <div><Skeleton width={50} /></div>
        </div>
      ))}
    </div>
  );
};

export default CustomerListSkeleton;

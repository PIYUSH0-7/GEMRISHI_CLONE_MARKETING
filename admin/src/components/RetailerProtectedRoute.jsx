import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetRetailerProfileQuery } from "../features/api/apiSlice";

const RetailerProtectedRoute = () => {
  const { data: retailerProfile, isLoading, isError } = useGetRetailerProfileQuery();
  if (isLoading)
    return (
      <div className="p-6 space-y-4">
        <Skeleton height={30} width={200} />
        <Skeleton height={20} count={3} />
      </div>
    );
  if (isError || !retailerProfile) return <Navigate to="/retailer/login" replace />;

  // If authenticated, pass avatarUrl to nested routes
  const avatarUrl = retailerProfile?.profile?.profilePic?.url || "";

  return <Outlet context={{ avatarUrl }} />;
};

export default RetailerProtectedRoute;

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetAdminProfileQuery } from "../features/api/apiSlice";

const ProtectedRoute = () => {
  const { data: adminProfile, isLoading, isError } = useGetAdminProfileQuery();

  if (isLoading)
    return (
      <div className="p-6 space-y-4">
        <Skeleton height={30} width={200} />
        <Skeleton height={20} count={3} />
      </div>
    );
  if (isError || !adminProfile) return <Navigate to="/login" replace />;

  // If authenticated, pass avatarUrl to nested routes
  const avatarUrl = adminProfile.avatar?.url || "";

  return <Outlet context={{ avatarUrl }} />;
};

export default ProtectedRoute;

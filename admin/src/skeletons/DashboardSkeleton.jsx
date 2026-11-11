"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import UpperBar from "../components/UpperBar";
import DashboardTable from "../components/DashboardTable";
import MetalRates from "../components/MetalRates";
import PaymentMethodPieChart from "../components/PaymentMethodPieChart";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function DashboardSkeleton() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <Navbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="w-full lg:ml-[230px] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 pb-2">
              <Skeleton width={200} />
            </h1>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold mb-4">
                <Skeleton width={120} />
              </h2>
              <div className="w-full h-64 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="w-full h-64" />
            </div>
          </div>

          {/* Bottom Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <Skeleton className="w-32 h-32" circle />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <Skeleton className="w-32 h-32" circle />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <Skeleton className="w-32 h-32" circle />
            </div>
          </div>

          {/* Dashboard Table */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <Skeleton count={5} height={30} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;

"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import DashboardTable from "../../components/DashboardTable";
import { motion, AnimatePresence } from "framer-motion";
import {
  useBestSellersQuery,
  useCustomerStatsQuery,
  useGetFeaturedProductsQuery,
  useGetProductsQuery,
  useGetReveuneByMonthYearQuery,
  useSalesDataQuery,
} from "../../features/api/apiSlice";
import MetalRates from "../../components/MetalRates";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import PaymentMethodPieChart from "../../components/PaymentMethodPieChart";
import DashboardSkeleton from "../../skeletons/DashboardSkeleton";
import { getImageUrl, onImageError } from "../../utils/imageUtils";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const {
    data: salesData,
    isLoading: salesDataLoading,
    error: salesError,
  } = useSalesDataQuery();

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useGetFeaturedProductsQuery();
  const featuredProds = products?.products || [];

  const { data: customerStatsData } = useCustomerStatsQuery();

  const {
    data: revenue,
    isLoading: revenueLoading,
    error: revenueError,
  } = useGetReveuneByMonthYearQuery();

  const sales = revenue?.revenue;

  // Assuming stat is already fetched and set via useState
  const total =
    (customerStatsData?.repeatedCustomers || 0) +
    (customerStatsData?.newCustomers || 0);
  const repeatedPercentage = total
    ? (customerStatsData?.repeatedCustomers / total) * 100
    : 0;
  const newPercentage = total
    ? (customerStatsData?.newCustomers / total) * 100
    : 0;

  // Calculate dasharray lengths (circumference is ~2πr; here r=40 → 2*3.14*40 ≈ 251.2)
  const circumference = 2 * Math.PI * 40;
  const repeatedLength = (repeatedPercentage / 100) * circumference;
  const newLength = (newPercentage / 100) * circumference;

  const current = featuredProds[index] || 0;

  const prev = () => {
    setIndex((i) => (i === 0 ? featuredProds.length - 1 : i - 1));
  };

  const next = () => {
    setIndex((i) => (i === featuredProds.length - 1 ? 0 : i + 1));
  };

  const chartWidth = 800;
  const chartHeight = 240;
  const baselineY = 192;

  let salesPathClosed = "";

  if (salesData?.sales?.length) {
    // Find max sales to scale height
    const maxSales = Math.max(...salesData.sales.map((d) => d.totalSales));

    // Scale factor for chart height (100px tall above baseline)
    const scaleHeight = 100;

    // Build path string
    const salesPath = salesData.sales
      .map((d, i) => {
        const x = (i / (salesData.sales.length - 1)) * chartWidth;
        const y = baselineY - (d.totalSales / maxSales) * scaleHeight;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

    salesPathClosed = `${salesPath} L${chartWidth},${baselineY} L0,${baselineY} Z`;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  if (productsLoading) return <DashboardSkeleton />;
  if (productsError) return <p>Something went wrong</p>;

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <Navbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
            onClick={closeSidebar}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-[230px] bg-white border-r border-gray-200 lg:hidden"
          >
            <Navbar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              closeSidebar={closeSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Dashboard Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 pb-2">
                Dashboard
              </h1>
            </div>

            {/* Products Chart Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6 mb-6 grid grid-cols-[70%_30%]"
            >
              <div className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#2563eb]" />
                      Sales Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={sales}>
                        {/* Background Grid */}
                        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

                        {/* X Axis */}
                        <XAxis
                          dataKey="_id.month"
                          stroke="#475569"
                          tick={{ fill: "#475569", fontSize: 12 }}
                          tickFormatter={(month) => {
                            const months = [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "May",
                              "Jun",
                              "Jul",
                              "Aug",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dec",
                            ];
                            return months[month - 1];
                          }}
                        />

                        {/* Y Axis */}
                        <YAxis
                          stroke="#475569"
                          tick={{ fill: "#475569", fontSize: 12 }}
                          tickFormatter={(value) =>
                            `₹${value.toLocaleString()}`
                          } // 👈 Add ₹ + commas
                        />

                        {/* Tooltip */}
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                          }}
                          labelStyle={{ fontWeight: "600", color: "#2563eb" }}
                        />

                        {/* Gradient Fill */}
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#2563eb"
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor="#2563eb"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        {/* Area Line */}
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2563eb"
                          strokeWidth={3}
                          fill="url(#colorRevenue)"
                          dot={{ r: 3, fill: "#2563eb", strokeWidth: 1 }}
                          activeDot={{
                            r: 6,
                            fill: "#1d4ed8",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <div>
                <MetalRates />
              </div>
            </motion.div>

            {/* Bottom Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customers Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Customers
                </h3>
                {/* Donut Chart */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-60">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                      />
                      {/* New customers arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#214436"
                        strokeWidth="8"
                        strokeDasharray={`${newLength} ${
                          circumference - newLength
                        }`}
                        strokeDashoffset={circumference - newLength}
                      />
                      {/* Repeated customers arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="8"
                        strokeDasharray={`${repeatedLength} ${
                          circumference - repeatedLength
                        }`}
                        strokeDashoffset={
                          circumference - repeatedLength - newLength
                        }
                      />
                    </svg>
                  </div>
                </div>
                {/* Customer Stats */}
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {customerStatsData?.newCustomers}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-[#214436]"></div>
                      New Customers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {customerStatsData?.repeatedCustomers}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      Repeated
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Featured Product Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Featured Product
                </h3>
                <div className="flex flex-col items-center">
                  {/* Product Image with centered navigation arrows */}
                  <div className="relative flex items-center justify-center w-full mb-4">
                    {/* Left arrow - positioned at center level */}
                    <button
                      className="absolute left-0 p-2 hover:bg-gray-100 rounded z-10"
                      onClick={prev}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Product Image */}
                    <div className="w-32 h-62">
                      <img
                        src={getImageUrl(current?.images?.[0]?.url)}
                        alt="Product"
                        onError={onImageError()}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Right arrow - positioned at center level */}
                    <button
                      className="absolute right-0 p-2 hover:bg-gray-100 rounded z-10"
                      onClick={next}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-800">
                      {current?.name}
                    </h4>
                    <p className="text-gray-600">
                      {Number(current?.price)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Sales Analytics Card */}
              <div className="bg-white">
                <PaymentMethodPieChart />
              </div>
            </div>

            {/* Dashboard Table Component */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6"
            >
              <DashboardTable />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

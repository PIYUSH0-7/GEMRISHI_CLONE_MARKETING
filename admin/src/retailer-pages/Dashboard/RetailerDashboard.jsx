import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import DashboardTable from "../../components/DashboardTable";
import Stone1 from "../../assets/Stone1.svg";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetFeaturedProductsQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useRetailerDashboardStatsQuery,
  useSalesDataQuery,
} from "../../features/api/apiSlice";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import OrderRowSkeleton from "../../skeletons/OrderRowSkeleton";
import RetailerNavbar from "../../components/RetailerNavbar";
import RetailerUpperBar from "../../components/RetailerUpperBar";

const data = [
  { name: "Jan", orders: 45 },
  { name: "Feb", orders: 52 },
  { name: "Mar", orders: 65 },
  { name: "Apr", orders: 60 },
  { name: "May", orders: 75 },
  { name: "Jun", orders: 95 },
  { name: "July", orders: 95 },
  { name: "Aug", orders: 95 },
  { name: "Sep", orders: 95 },
  { name: "Oct", orders: 95 },
  { name: "Nov", orders: 95 },
  { name: "Dec", orders: 95 },
];

function RetailerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const { data: dashboardStat } = useRetailerDashboardStatsQuery();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100">
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <RetailerNavbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

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
            <RetailerNavbar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              closeSidebar={closeSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <RetailerUpperBar toggleSidebar={toggleSidebar} />
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section */}
          <div className="col-span-2 space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow">
                <p className="text-gray-500 text-sm">Total Orders</p>
                <h2 className="text-3xl font-semibold">
                  {dashboardStat?.orderCount}
                </h2>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow">
                <p className="text-gray-500 text-sm">
                  Pending Buy-Back Request
                </p>
                <h2 className="text-3xl font-semibold">
                  {dashboardStat?.buyBackCount}
                </h2>
              </div>
            </div>

            {/* Order Volume Chart */}
            <div className="bg-white p-4 rounded-2xl shadow">
              <h3 className="text-gray-600 mb-2 font-medium">Order Volume</h3>
              <p className="text-sm text-gray-400 mb-4">
                Number of orders per month
              </p>
              <div className="h-84">
                {/* Rechart BarChart component here */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardStat?.ordersByMonth} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
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
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#4ade80"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetailerDashboard;

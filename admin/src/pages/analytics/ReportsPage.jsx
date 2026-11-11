import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  IndianRupee,
  Package,
  Users,
  ShoppingBag,
  BarChart3,
  PieChart,
  Target,
  Award,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
// import { Badge } from './ui/badge';
import { Separator } from "../../ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  useBestSellersQuery,
  useGetInventoryDataQuery,
  useGetOrdersCountByMonthYearQuery,
  useGetReveuneByMonthYearQuery,
  useOrderDashboardMetricsQuery,
} from "../../features/api/apiSlice";
import ReportPageSkeleton from "../../skeletons/ReportPageSkeleton";

// Mock data for reports
const salesData = [
  { month: "Jan", revenue: 45000, orders: 32, profit: 18000 },
  { month: "Feb", revenue: 52000, orders: 38, profit: 21000 },
  { month: "Mar", revenue: 48000, orders: 35, profit: 19500 },
  { month: "Apr", revenue: 61000, orders: 42, profit: 25000 },
  { month: "May", revenue: 55000, orders: 39, profit: 22500 },
  { month: "Jun", revenue: 67000, orders: 48, profit: 28000 },
  { month: "Jul", revenue: 73000, orders: 52, profit: 31000 },
  { month: "Aug", revenue: 69000, orders: 49, profit: 29500 },
];

const gemstonePopularity = [
  { name: "Ruby", value: 30, count: 156, revenue: 234000 },
  { name: "Sapphire", value: 25, count: 128, revenue: 189000 },
  { name: "Emerald", value: 20, count: 102, revenue: 167000 },
  { name: "Diamond", value: 15, count: 78, revenue: 245000 },
  { name: "Topaz", value: 10, count: 52, revenue: 78000 },
];

const inventoryData = [
  { category: "Ruby", inStock: 45, lowStock: 8, outOfStock: 2, value: 187000 },
  {
    category: "Sapphire",
    inStock: 38,
    lowStock: 6,
    outOfStock: 1,
    value: 156000,
  },
  {
    category: "Emerald",
    inStock: 29,
    lowStock: 4,
    outOfStock: 3,
    value: 143000,
  },
  {
    category: "Diamond",
    inStock: 22,
    lowStock: 2,
    outOfStock: 1,
    value: 198000,
  },
  { category: "Topaz", inStock: 56, lowStock: 12, outOfStock: 0, value: 89000 },
];

const customerSegments = [
  { segment: "VIP", customers: 23, revenue: 156000, avgOrder: 6782 },
  { segment: "Gold", customers: 67, revenue: 234000, avgOrder: 3493 },
  { segment: "Silver", customers: 128, revenue: 189000, avgOrder: 1476 },
  { segment: "Bronze", customers: 234, revenue: 145000, avgOrder: 620 },
];

const regionData = [
  { region: "North America", sales: 245000, customers: 156, growth: 12.5 },
  { region: "Europe", sales: 189000, customers: 124, growth: 8.7 },
  { region: "Asia Pacific", sales: 167000, customers: 98, growth: 15.2 },
  { region: "Others", sales: 89000, customers: 76, growth: 6.1 },
];

const COLORS = ["#329141", "#f93c65", "#304c57", "#120213", "#f39c12"];

function ReportsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState("last-6-months");
  const [reportType, setReportType] = useState("overview");
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: revenue,
    isLoading: revenueLoading,
    error: revenueError,
  } = useGetReveuneByMonthYearQuery();

  const {
    data: ordersCount,
    isLoading: ordersCountLoading,
    error: ordersCountError,
  } = useGetOrdersCountByMonthYearQuery();

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useOrderDashboardMetricsQuery();

  const { data: inventory, isLoading: inventoryLoading } =
    useGetInventoryDataQuery();

  const { data: bestSeller, isLoading: bestSellersLoading } =
    useBestSellersQuery();

  const sales = revenue?.revenue;
  const orders = ordersCount?.ordersCount;

  const calculatePercentageChange = (current, previous) => {
    return ((current - previous) / previous) * 100;
  };

  const getCurrentPeriodMetrics = () => {
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
    const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0);
    const avgOrderValue = totalRevenue / totalOrders;

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      profit: totalProfit,
      avgOrderValue: avgOrderValue,
      revenueGrowth: 12.8,
      ordersGrowth: 8.5,
      profitGrowth: 15.2,
      avgOrderGrowth: 4.1,
    };
  };

  const metrics = getCurrentPeriodMetrics();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, []);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100">
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <Navbar
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
            <Navbar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              closeSidebar={closeSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>
        {revenueLoading ||
        ordersCountLoading ||
        dashboardLoading ||
        inventoryLoading ? (
          <ReportPageSkeleton />
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-[30px] p-8 shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-[#120213] mb-2">
                      Reports & Analytics
                    </h1>
                    <p className="text-[#304c57] opacity-60">
                      Comprehensive business insights and performance metrics
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <IndianRupee className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600 opacity-80">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      Rs. {dashboard?.revenue.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingBag className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-600 opacity-80">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {dashboard?.orderCount || 0}
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-sm text-orange-600 opacity-80">
                      Avg Order Value
                    </p>
                    <p className="text-2xl font-bold text-orange-700">
                      Rs. {dashboard?.avgOrderValue.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Reports */}
              <div className="rounded-[30px] p-8 shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]">
                <Tabs
                  value={reportType}
                  onValueChange={setReportType}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-[#F2F2F2]">
                    <TabsTrigger
                      value="overview"
                      className={activeTab === "overview" ? "bg-white" : ""}
                      onClick={() => setActiveTab("overview")}
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="sales"
                      className={activeTab === "sales" ? "bg-white" : ""}
                      onClick={() => setActiveTab("sales")}
                    >
                      Sales
                    </TabsTrigger>
                    <TabsTrigger
                      value="inventory"
                      className={activeTab === "inventory" ? "bg-white" : ""}
                      onClick={() => setActiveTab("inventory")}
                    >
                      Inventory
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[#329141]" />
                            Revenue Trend
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={sales}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                              />
                              <XAxis
                                dataKey="_id.month"
                                stroke="#304c57"
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
                                  return months[month - 1]; // convert number → name
                                }}
                              />
                              <YAxis
                                stroke="#304c57"
                                // tickFormatter={(value) =>
                                //   `₹${value.toLocaleString()}`
                                // } 
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: "8px",
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#329141"
                                fill="rgba(50, 145, 65, 0.1)"
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      {/* 
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-5 h-5 text-[#329141]" />
                          Gemstone Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={gemstonePopularity}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {gemstonePopularity.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                          {gemstonePopularity.map((item, index) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: COLORS[index] }}
                                />
                                <span className="text-[#120213]">
                                  {item.name}
                                </span>
                              </div>
                              <div className="flex gap-4">
                                <span className="text-[#304c57]">
                                  {item.count} sold
                                </span>
                                <span className="font-medium text-[#120213]">
                                  ${item.revenue.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card> */}
                    </div>
                  </TabsContent>

                  {/* Sales Tab */}
                  <TabsContent value="sales" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Best Sellers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {bestSeller?.bestSellers?.map((gemstone, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 border border-[rgba(18,2,19,0.1)] rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#329141] text-white font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#120213]">
                                    {gemstone?.itemDetails?.name}
                                  </h4>
                                  <p className="text-sm text-[#304c57] opacity-60">
                                    {gemstone?.totalSold} units sold
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-[#120213]">
                                  Rs.{" "}
                                  {gemstone?.itemDetails?.price *
                                    gemstone?.totalSold}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Order Volume Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={orders}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                              />
                              <XAxis
                                dataKey="_id.month"
                                stroke="#304c57"
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
                                  return months[month - 1]; // convert number → name
                                }}
                              />
                              <YAxis stroke="#304c57" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: "8px",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="totalOrders"
                                stroke="#304c57"
                                strokeWidth={3}
                                dot={{ fill: "#304c57", strokeWidth: 2, r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Inventory Tab */}
                  <TabsContent value="inventory" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Gemstone Inventory Status Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {inventory?.result?.map((inventory, index) => (
                            <div
                              key={index}
                              className="p-4 border border-[rgba(18,2,19,0.1)] rounded-lg"
                            >
                              <h4 className="font-medium text-[#120213] mb-3">
                                {inventory.subCategoryName}
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-[#304c57]">
                                    In Stock:
                                  </span>
                                  <p className="bg-green-100 text-green-800 border-green-200">
                                    {inventory.inStock}
                                  </p>
                                </div>

                                <div className="flex justify-between">
                                  <span className="text-[#304c57]">
                                    Out of Stock:
                                  </span>
                                  <p className="bg-red-100 text-red-800 border-red-200">
                                    {inventory.outOfStock}
                                  </p>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-medium">
                                  <span className="text-[#120213]">
                                    Total Value:
                                  </span>
                                  <span className="text-[#329141]">
                                    Rs.{" "}
                                    {inventory.totalAmount.toLocaleString() ||
                                      0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Customers Tab */}
                  <TabsContent value="customers" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#329141]" />
                            Customer Segments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={customerSegments}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                              />
                              <XAxis dataKey="segment" stroke="#304c57" />
                              <YAxis stroke="#304c57" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar
                                dataKey="customers"
                                fill="#329141"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue by Customer Segment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                              <Pie
                                data={customerSegments}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="revenue"
                              >
                                {customerSegments.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                          <div className="mt-4 space-y-2">
                            {customerSegments.map((segment, index) => (
                              <div
                                key={segment.segment}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index] }}
                                  />
                                  <span className="text-[#120213]">
                                    {segment.segment}
                                  </span>
                                </div>
                                <span className="font-medium text-[#120213]">
                                  ${segment.revenue.toLocaleString() || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Segment Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {customerSegments.map((segment, index) => (
                            <div
                              key={segment.segment}
                              className="flex items-center justify-between p-4 border border-[rgba(18,2,19,0.1)] rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="flex items-center justify-center w-12 h-12 rounded-full"
                                  style={{
                                    backgroundColor: `${COLORS[index]}20`,
                                  }}
                                >
                                  <Award
                                    className="w-6 h-6"
                                    style={{ color: COLORS[index] }}
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#120213]">
                                    {segment.segment} Tier
                                  </h4>
                                  <p className="text-sm text-[#304c57] opacity-60">
                                    {segment.customers} customers
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-[#120213]">
                                  ${segment.revenue.toLocaleString() || 0}
                                </p>
                                <p className="text-sm text-[#304c57] opacity-60">
                                  Avg: ${segment.avgOrder.toFixed(0) || 0}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Regional Tab */}
                  <TabsContent value="regional" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Regional Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={regionData} layout="horizontal">
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis type="number" stroke="#304c57" />
                            <YAxis
                              dataKey="region"
                              type="category"
                              width={100}
                              stroke="#304c57"
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                              }}
                            />
                            <Bar
                              dataKey="sales"
                              fill="#329141"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {regionData.map((region, index) => (
                        <Card key={region.region}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-[#120213]">
                                {region.region}
                              </h4>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                  +{region.growth}%
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-[#304c57]">Sales:</span>
                                <span className="font-medium text-[#120213]">
                                  ${region.sales.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#304c57]">
                                  Customers:
                                </span>
                                <span className="font-medium text-[#120213]">
                                  {region.customers}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#304c57]">
                                  Avg per Customer:
                                </span>
                                <span className="font-medium text-[#120213]">
                                  $
                                  {Math.round(
                                    region.sales / region.customers
                                  ).toLocaleString() || 0}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;

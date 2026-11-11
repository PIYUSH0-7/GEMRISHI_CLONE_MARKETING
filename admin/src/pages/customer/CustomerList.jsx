import { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Calendar,
  X,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Info,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
// import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
// import { CustomerDetailPopup } from './CustomerDetailPopup';
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import {
  useGetAllOrderUsersQuery,
  useOrderDashboardMetricsQuery,
} from "../../features/api/apiSlice";
import Pagination from "../../components/Pagination";
import CustomerListSkeleton from "../../skeletons/CustomerListSkeleton";
const API_URL = import.meta.env.VITE_URL;

export function CustomerList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCustomerForPopup, setSelectedCustomerForPopup] =
    useState(null);
  const [page, setPage] = useState(1);

  const {
    data: customers,
    isLoading: customersLoading,
    error: customerError,
  } = useGetAllOrderUsersQuery({ page, limit: 5, search: searchTerm });

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useOrderDashboardMetricsQuery();

  const handlePageChange = (page) => {
    setPage(page); // triggers API refetch with ?page=page
  };

  const exportToCSV = async () => {
    const response = await fetch(
      `${API_URL}/order/get-all-customers-csv`,
      {
        method: "GET",
        credentials: "include", // ✅ include cookies/session
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const allCustomers = await response.json();
    const headers = [
      "Customer ID",
      "Name",
      "Email",
      "Mobile No",
      "Total Orders",
      "Total Spent",
      "Last Order",
    ];
    const rows = allCustomers?.users?.map((customer) => [
      customer._id,
      customer.name,
      customer.email,
      customer.mobileNo,
      customer.totalOrders,
      customer.totalSpent,
      customer.lastOrder.split("T")[0],
    ]);
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNext = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    setPage((prev) => (prev === 1 ? prev : prev - 1));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
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
          <div className="p-4">
            <div className="bg-white rounded-[30px] p-8 shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-[#120213] mb-2">
                    Customer Management
                  </h1>
                  <p className="text-[#304c57] opacity-60">
                    Manage customer relationships and track customer data
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <Button
                    className="bg-[rgba(64,137,75,0.1)] text-[#329141] hover:bg-[rgba(64,137,75,0.2)] border-0"
                    size="sm"
                    onClick={exportToCSV}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Customer Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 opacity-80">
                        Total Customers
                      </p>
                      <p className="text-xl font-bold text-blue-700">
                        {dashboard?.userCount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 opacity-80">
                        Total Orders
                      </p>
                      <p className="text-xl font-bold text-green-700">
                        {dashboard?.orderCount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <IndianRupee className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 opacity-80">
                        Total Revenue
                      </p>
                      <p className="text-xl font-bold text-purple-700">
                        Rs. {dashboard?.revenue.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-orange-600 opacity-80">
                        Avg Order Value
                      </p>
                      <p className="text-xl font-bold text-orange-700">
                        Rs. {dashboard?.avgOrderValue.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2.5">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#304c57] opacity-60" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-white border-[rgba(48,76,87,0.2)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.1)]"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-[10px] overflow-hidden">
                {/* Table Header */}
                <div className="bg-[#f7fbfc] px-5 py-4">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="font-medium text-[#304c57] opacity-60 text-sm">
                      Customer ID (last 8 digits)
                    </div>
                    <div className="font-medium text-[#304c57] opacity-60 text-sm">
                      Name & Contact
                    </div>
                    <div className="font-medium text-[#304c57] opacity-60 text-sm">
                      Orders
                    </div>
                    <div className="font-medium text-[#304c57] opacity-60 text-sm">
                      Total Spent
                    </div>
                    <div className="font-medium text-[#304c57] opacity-60 text-sm">
                      Last Order
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                {customersLoading ? (
                  <CustomerListSkeleton rows={5} />
                ) : (
                  <div className="bg-white">
                    {customers?.users?.map((customer, index) => (
                      <div
                        key={customer._id}
                        className="grid grid-cols-5 gap-4 px-5 py-4 border-b border-[rgba(18,2,19,0.1)] hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-[#120213]">
                          {customer._id.slice(-8)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#120213]">
                            {customer.name}
                          </div>
                          <div className="text-xs text-[#304c57] opacity-60">
                            {customer.email}
                          </div>
                          <div className="text-xs text-[#304c57] opacity-60">
                            {customer.mobileNo}
                          </div>
                        </div>
                        <div className="text-sm text-[#120213]">
                          {customer.totalOrders}
                        </div>
                        <div className="text-sm font-medium text-[#120213]">
                          Rs. {customer.totalSpent.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-[#120213]">
                          {customer.lastOrder.split("T")[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <Pagination
                  currentPage={customers?.currentPage}
                  totalPage={customers?.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

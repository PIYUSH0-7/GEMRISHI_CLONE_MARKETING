import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import DashboardTable from "../../components/DashboardTable";
import Stone1 from "../../assets/Stone1.svg";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetFeaturedProductsQuery,
  useGetOrdersForCsvQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useSalesDataQuery,
} from "../../features/api/apiSlice";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import OrderRowSkeleton from "../../skeletons/OrderRowSkeleton";
import { toast } from "react-toastify";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200 p-1 rounded-lg",
  InProgress: "bg-blue-100 text-blue-800 border-blue-200 p-1 rounded-lg",
  Completed: "bg-purple-100 text-purple-800 border-purple-200 p-1 rounded-lg",
  Cancelled: "bg-red-100 text-red-800 border-red-200 p-1 rounded-lg",
};

function OrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrderForPopup, setSelectedOrderForPopup] = useState(null);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useGetOrdersQuery({
    page,
    limit: 10,
    search: searchTerm,
    orderStatus: statusFilter === "all" ? "" : statusFilter,
  });

  // Transform API orders into UI-friendly format
  const mappedOrders =
    ordersData?.orders?.map((order) => {
      const customerName =
        order.address?.fullName ||
        order.userId?.fullName ||
        order.retailerId?.fullName ||
        "Guest Customer";

      let customerEmail =
        order.address?.email ||
        order.userId?.email ||
        order.retailerId?.email ||
        "";
      if (customerEmail.startsWith("guest_") || customerEmail.includes("@temp.com")) {
        customerEmail = "";
      }

      const customerPhone =
        order.address?.mobileNo ||
        order.userId?.mobileNo ||
        order.retailerId?.mobileNo ||
        "";

      return {
        id: order.orderId, // Order ID from Mongo
        mongooseId: order._id,
        customer: customerName,
        email: customerEmail,
        phone: customerPhone,
        date: order.createdAt,
        status: order.orderStatus, // e.g. "Pending"
        items: order.items?.length || 0, // count of items
        total: Number(order.totalAmount || 0),
        paidAmount: order.paidAmount !== undefined ? Number(order.paidAmount) : (order.paymentStatus === "Completed" ? Number(order.totalAmount || 0) : 0),
        payment: order.paymentStatus?.toLowerCase() || "pending", // e.g. "Pending"
        paymentStatus: order.paymentStatus || "Pending",
        paymentMethod: order.paymentMethod || "cashfree",
        paymentMode: order.paymentMode || (order.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)"),
      };
    }) || [];

  const sortedOrders = [...mappedOrders].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "date":
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case "total":
        aValue = a.total;
        bValue = b.total;
        break;
      case "customer":
        aValue = a.customer;
        bValue = b.customer;
        break;
      default:
        aValue = a.id;
        bValue = b.id;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const {
    data: allOrders,
    isLoading: csvOrdersLoading,
    error: csvOrdersError,
  } = useGetOrdersForCsvQuery();

  const exportToCSV = async () => {
    if (!allOrders?.orders?.length) {
      toast.error("No orders available for export");
      return;
    }

    const headers = [
      "Order ID",
      "Customer",
      "Phone",
      "Email",
      "Address",
      "City",
      "State",
      "Pincode",
      "Date",
      "Status",
      "Items",
      "Total Amount",
      "Paid Amount",
      "Payment Mode",
      "Payment Status",
    ];

    const rows = allOrders?.orders?.map((order) => [
      order.orderId,
      order.address?.fullName || order?.userId?.fullName || order?.retailerId?.fullName || "Guest Customer",
      order.address?.mobileNo || order?.userId?.mobileNo || order?.retailerId?.mobileNo || "",
      order.address?.email && !order.address.email.startsWith("guest_") ? order.address.email : (order?.userId?.email && !order.userId.email.startsWith("guest_") ? order.userId.email : ""),
      order.address?.addressLine1 || "",
      order.address?.city || "",
      order.address?.state || "",
      order.address?.pinCode || "",
      new Date(order.createdAt).toLocaleDateString(),
      order.orderStatus,
      order.items?.length || 0,
      order.totalAmount,
      order.paidAmount !== undefined ? order.paidAmount : (order.paymentStatus === "Completed" ? order.totalAmount : 0),
      order.paymentMode || (order.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)"),
      order.paymentStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusLabelMap = {
    InProgress: "In Progress",
    Pending: "Pending",
    Completed: "Completed",
    Cancelled: "Cancelled",
    Failed: "Failed",
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#120213] mb-2">
                Order Management
              </h1>
              <p className="text-[#304c57] opacity-60">
                Manage and track all customer orders
              </p>
            </div>
            <div className="flex gap-2.5">
              <Button
                className="bg-[rgba(64,137,75,0.1)] text-[#329141] border-0 cursor-pointer hover:bg-[rgba(64,137,75,0.2)]"
                size="sm"
                variant="link"
                onClick={exportToCSV}
              >
                <Filter className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#304c57] opacity-60" />
                <Input
                  placeholder="Search order by customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-69 bg-white border-[rgba(48,76,87,0.2)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.1)]"
                />
              </div>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white border-[rgba(48,76,87,0.2)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.1)]"
                  >
                    Status:{" "}
                    {statusFilter === "all"
                      ? "All"
                      : statusFilter === "InProgress"
                      ? "In Progress"
                      : statusFilter}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("InProgress")}
                  >
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("Completed")}
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("Cancelled")}
                  >
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-[10px] overflow-hidden">
            {/* Table Header */}
            <div className="bg-[#f7fbfc] px-5 py-4">
              <div className="grid grid-cols-7 gap-4">
                <div className="font-medium text-[#304c57] opacity-60 text-sm">
                  Order ID (last 8 digits)
                </div>
                <div className="font-medium text-[#304c57] opacity-60 text-sm">
                  Customer
                </div>
                <div className="font-medium text-[#304c57] opacity-60 text-sm">
                  Date
                </div>
                <div className="font-medium text-[#304c57] opacity-60 text-sm">
                  Status
                </div>

                <div className="font-medium text-[#304c57] opacity-60 text-sm">
                  Items
                </div>
                <div className="font-medium text-[#304c57] opacity-60 text-sm">
                  Amount
                </div>
                <div className="font-medium text-[#304c57] opacity-60 text-sm">
                  Mode & Payment
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="bg-white">
              {ordersLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <OrderRowSkeleton key={i} />
                  ))
                : sortedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="grid grid-cols-7 gap-4 px-5 py-4 border-b border-[rgba(18,2,19,0.1)] hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/order/${order.mongooseId}`)}
                    >
                      <div className="text-sm font-medium text-[#120213]">
                        {order?.id?.slice(-8)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#120213]">
                          {order.customer}
                        </div>
                        <div className="text-xs text-[#304c57] opacity-60 flex flex-col gap-0.5">
                          {order.phone && <span>{order.phone}</span>}
                          {order.email && <span>{order.email}</span>}
                        </div>
                      </div>
                      <div className="text-sm text-[#120213]">
                        {new Date(order.date).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div>
                        <p
                          className={`inline-block text-sm font-medium ${
                            statusColors[order.status] ||
                            "bg-gray-100 text-gray-800 border border-gray-200 px-2 py-1 rounded"
                          }`}
                        >
                          {statusLabelMap[order.status] || order.status}
                        </p>
                      </div>
                      <div className="text-sm text-[#120213]">
                        {order.items}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#120213]">
                          Rs. {order.total.toLocaleString("en-IN")}
                        </div>
                        {order.paidAmount > 0 ? (
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            Paid: Rs. {order.paidAmount.toLocaleString("en-IN")}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 mt-0.5">Unpaid</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#120213] leading-tight">
                          {order.paymentMode}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              order.payment === "completed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : order.payment === "failed"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {order.payment.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={ordersData?.currentPage}
              totalPage={ordersData?.totalPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;

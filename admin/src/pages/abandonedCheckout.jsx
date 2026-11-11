import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Download,
  CheckCircle,
  Clock,
  ShoppingCart,
  IndianRupee,
  Eye,
  X,
  User,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Filter,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  Package,
  Globe,
  Smartphone,
} from "lucide-react";
import { getImageUrl, onImageError } from "../utils/imageUtils";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import UpperBar from "../components/UpperBar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Pagination from "../components/Pagination";
import { toast } from "react-toastify";
import {
  getAbandonedCheckouts,
  markAbandonedCheckoutResolved,
  exportAbandonedCheckoutsCsv,
} from "../features/api/abandonedCheckoutApi";

const useAdminToken = () => localStorage.getItem("adminToken");

const rupees = (paisa) =>
  paisa || paisa === 0 ? `₹${(paisa / 100).toLocaleString("en-IN")}` : "—";

const stageLabel = {
  before_address: "Left before address",
  before_payment: "Left before payment",
  completed: "Completed",
};

const stageColor = {
  before_address: "bg-amber-100 text-amber-800 border-amber-300",
  before_payment: "bg-rose-100 text-rose-800 border-rose-300",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

// ---- Device / network helpers -------------------------------------------
// Backend should store `ipAddress` and `deviceInfo` (see backend patch). For older
// records that only have a raw `userAgent`, we derive a readable name here.
const parseUserAgent = (ua = "") => {
  if (!ua) return null;
  let browser = "Unknown browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
  else if (/Chrome\/|CriOS/.test(ua)) browser = "Chrome";
  else if (/Firefox\/|FxiOS/.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let deviceType = "desktop";
  if (/iPad|Tablet/.test(ua)) deviceType = "tablet";
  else if (/Mobi|iPhone|Android/.test(ua)) deviceType = "mobile";

  // Android UAs often contain the model: "Linux; Android 13; SM-S918B)"
  const model = ua.match(/Android [\d.]+;\s*([^;)]+)/)?.[1]?.trim();
  let deviceName = model || (/iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : "");
  if (!deviceName) deviceName = deviceType === "desktop" ? `${os} Computer` : `${os} ${deviceType}`;

  return { deviceName, deviceType, browser, os };
};

const getDeviceDetails = (record = {}) => {
  const info = record.deviceInfo || {};
  const parsed = parseUserAgent(record.userAgent || info.userAgent) || {};
  return {
    ip: record.ipAddress || info.ip || "",
    deviceName: info.deviceName || parsed.deviceName || "",
    deviceType: info.deviceType || parsed.deviceType || "",
    browser: info.browser || parsed.browser || "",
    os: info.os || parsed.os || "",
    userAgent: record.userAgent || info.userAgent || "",
  };
};

export default function AbandonedCheckouts() {
  const token = useAdminToken();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [totalAbandonedValue, setTotalAbandonedValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState(""); // "", "pending", "resolved"
  const [stage, setStage] = useState(""); // "", "before_address", "before_payment", "completed"
  const [sort, setSort] = useState("latest"); // "latest" | "oldest"
  const [page, setPage] = useState(1);
  const limit = 20;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAbandonedCheckouts(token, {
        search: search || undefined,
        status: status || undefined,
        stage: stage || undefined,
        sort,
        page,
        limit,
      });
      setData(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      setTotalAbandonedValue(res.totalAbandonedValue || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load abandoned checkouts");
    } finally {
      setLoading(false);
    }
  }, [token, search, status, stage, sort, page]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // ⚡ Realtime live auto-fetch every 4 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleResolve = async (id, isResolved = true) => {
    try {
      await markAbandonedCheckoutResolved(token, id, isResolved);
      setData((prev) =>
        prev.map((row) => (row._id === id ? { ...row, isResolved } : row))
      );
      if (selectedRecord && selectedRecord._id === id) {
        setSelectedRecord((prev) => ({ ...prev, isResolved }));
      }
      toast.success(isResolved ? "Marked as resolved" : "Marked as pending");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleExport = () => {
    exportAbandonedCheckoutsCsv(token, {
      search: search || undefined,
      status: status || undefined,
      stage: stage || undefined,
      sort,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const copyCustomerDetails = (record) => {
    const name =
      record.customer?.shippingAddress?.[0]?.name ||
      record.customer?.billingAddress?.[0]?.name ||
      "Customer";
    const phone = record.customer?.phoneNumber || "";
    const email = record.customer?.emailAddress || "";
    const items = (record.cartDetails?.items || [])
      .map((it) => `${it.title} (Qty: ${it.quantity}, ${rupees(it.finalPrice)})`)
      .join("; ");
    const address = record.customer?.shippingAddress?.[0]
      ? `${record.customer.shippingAddress[0].line1 || ""}, ${
          record.customer.shippingAddress[0].city || ""
        }, ${record.customer.shippingAddress[0].state || ""} ${
          record.customer.shippingAddress[0].postalCode || ""
        }`
      : "Not provided";

    const dev = getDeviceDetails(record);
    const text = [
      `Customer: ${name}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      `Cart Value: ${rupees(record.cartDetails?.totalPrice)} (${record.cartDetails?.itemCount || 0} items)`,
      items ? `Products: ${items}` : null,
      `Payment Mode: ${record.paymentMode || (record.paymentMethod === "cod" ? "COD" : "Cashfree (Online)")}`,
      `Payment Amount: ${rupees(record.cartDetails?.totalPrice)}${record.amountPaid || record.cartDetails?.amountPaid ? ` (Paid: ${rupees(record.cartDetails?.amountPaid || (record.amountPaid * 100))})` : " (Unpaid)"}`,
      `Drop-off Stage: ${stageLabel[record.dropOffStage] || record.dropOffStage}`,
      address !== "Not provided" ? `Shipping Address: ${address}` : null,
      dev.ip ? `IP Address: ${dev.ip}` : null,
      dev.deviceName ? `Device: ${dev.deviceName}${dev.os ? ` (${dev.os}` + (dev.browser ? `, ${dev.browser}` : "") + ")" : ""}` : null,
      record.checkoutUrl ? `Checkout URL: ${record.checkoutUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text);
    toast.success("Customer and cart details copied to clipboard!");
  };

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

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
            onClick={closeSidebar}
          />
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

      {/* Main Content Area */}
      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-4 md:p-6">
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#120213]">
                  Abandoned Checkouts
                </h1>
                <p className="text-[#304c57] opacity-70 text-sm mt-1">
                  Track drop-offs, recover abandoned carts, and directly contact customers regarding their products
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={fetchData}
                  className="flex items-center gap-1 text-xs border-gray-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                </Button>
                <Button
                  className="bg-[#214436] text-white hover:bg-[#1a372c] flex items-center gap-2 border-0"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-800 rounded-lg">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-amber-800 font-medium uppercase tracking-wider">
                    Total Abandoned Carts
                  </p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">
                    {pagination.total}
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-emerald-800 font-medium uppercase tracking-wider">
                    Total Abandoned Value
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">
                    {rupees(totalAbandonedValue)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-800 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-blue-800 font-medium uppercase tracking-wider">
                    Current Page
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {pagination.page} of {pagination.totalPages || 1}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls / Filters */}
            <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                {/* Search */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search name, email, or phone…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 bg-white border-gray-300"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#214436]"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>

                {/* Drop-off Stage Filter */}
                <select
                  value={stage}
                  onChange={(e) => {
                    setStage(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#214436]"
                >
                  <option value="">All Drop-off Stages</option>
                  <option value="before_address">Left before address</option>
                  <option value="before_payment">Left before payment</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Sort Filter */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#214436]"
                >
                  <option value="latest">Sort: Latest first</option>
                  <option value="oldest">Sort: Oldest first</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer Details</th>
                    <th className="px-4 py-3">Quick Contact</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Cart Value</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        Loading abandoned checkouts…
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        No abandoned checkouts found.
                      </td>
                    </tr>
                  ) : (
                    data.map((row) => {
                      const name =
                        row.customer?.name ||
                        row.customer?.shippingAddress?.[0]?.name ||
                        row.customer?.billingAddress?.[0]?.name ||
                        "Unregistered Customer";
                      const phone = row.customer?.phoneNumber || "";
                      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
                      const email =
                        row.customer?.emailAddress &&
                        !row.customer.emailAddress.startsWith("guest_") &&
                        !row.customer.emailAddress.includes("@temp.com") &&
                        row.customer.emailAddress !== "guest@gemrishi.com"
                          ? row.customer.emailAddress
                          : "";
                      const firstItem = row.cartDetails?.items?.[0]?.title || "selected items";

                      return (
                        <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            {new Date(row.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{name}</div>
                            <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-0.5">
                              {email && (
                                <a
                                  href={`mailto:${email}`}
                                  className="flex items-center gap-1 hover:underline hover:text-blue-600"
                                >
                                  <Mail className="w-3 h-3" /> {email}
                                </a>
                              )}
                              {phone && (
                                <a
                                  href={`tel:${phone}`}
                                  className="flex items-center gap-1 hover:underline text-gray-700"
                                >
                                  <Phone className="w-3 h-3" /> {phone}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {cleanPhone ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                    `Hi ${name !== "Unregistered Customer" ? name : "there"}, we noticed you were interested in ${firstItem} on GemRishi. Can we assist you with any questions or help you complete your order?`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                                </a>
                                <a
                                  href={`tel:${phone}`}
                                  className="inline-flex items-center p-1.5 rounded-md text-xs font-medium text-blue-700 hover:bg-blue-50 border border-blue-200"
                                  title="Call Customer"
                                >
                                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No phone</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                stageColor[row.dropOffStage] || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {stageLabel[row.dropOffStage] || row.dropOffStage}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">
                            {row.cartDetails?.itemCount ?? 0} item(s)
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-bold text-gray-900 leading-tight">
                              {rupees(row.cartDetails?.totalPrice)}
                            </div>
                            {row.amountPaid || row.cartDetails?.amountPaid ? (
                              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                                Paid: {rupees(row.cartDetails?.amountPaid || (row.amountPaid * 100))}
                              </div>
                            ) : (
                              <div className="text-[10px] text-gray-400 mt-0.5">Unpaid</div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-xs text-gray-900">
                              {row.paymentMode || (row.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)")}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                              {row.paymentMethod === "cod" ? "COD" : "Cashfree PG"}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                row.isResolved
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {row.isResolved ? "Resolved" : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                            <button
                              onClick={() => setSelectedRecord(row)}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg inline-flex items-center gap-1 text-xs font-medium border border-gray-200"
                              title="View Full Details"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            {!row.isResolved ? (
                              <button
                                onClick={() => handleResolve(row._id, true)}
                                className="px-2.5 py-1 text-xs font-medium bg-[#214436] text-white hover:bg-[#1a372c] rounded-lg border border-transparent inline-flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Resolve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleResolve(row._id, false)}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded border border-gray-200"
                                title="Reopen as Pending"
                              >
                                Reopen
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPage={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setSelectedRecord(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between gap-3 mb-6 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#214436] text-white rounded-xl">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Abandoned Checkout Details
                    </h3>
                    <p className="text-xs text-gray-500">
                      ID: {selectedRecord._id} · Recorded:{" "}
                      {new Date(selectedRecord.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => copyCustomerDetails(selectedRecord)}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Details
                </Button>
              </div>

              {/* Status and Stage Banner */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase">
                    Drop-off Stage
                  </div>
                  <div className="font-semibold text-gray-800 mt-0.5">
                    {stageLabel[selectedRecord.dropOffStage] || selectedRecord.dropOffStage}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase">
                    Status
                  </div>
                  <div className="mt-0.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        selectedRecord.isResolved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {selectedRecord.isResolved ? "Resolved" : "Pending"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase">
                    Total Cart Value
                  </div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {rupees(selectedRecord.cartDetails?.totalPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase">
                    Payment Mode
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">
                    {selectedRecord.paymentMode || (selectedRecord.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)")}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    {selectedRecord.amountPaid || selectedRecord.cartDetails?.amountPaid
                      ? `Paid: ${rupees(selectedRecord.cartDetails?.amountPaid || (selectedRecord.amountPaid * 100))}`
                      : "Unpaid / Pending"}
                  </div>
                </div>
              </div>

              {/* Customer Contact & Quick Actions */}
              <div className="mb-6 bg-[#f7fbfc] p-4 rounded-xl border border-[#304c57]/20">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#214436]" /> Customer Contact & Recovery Actions
                </h4>
                <div className="text-sm space-y-1 mb-3">
                  <p>
                    <span className="font-semibold text-gray-700">Customer Name:</span>{" "}
                    {selectedRecord.customer?.name ||
                      selectedRecord.customer?.shippingAddress?.[0]?.name ||
                      selectedRecord.customer?.billingAddress?.[0]?.name ||
                      "Unregistered Customer"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Phone Number:</span>{" "}
                    {selectedRecord.customer?.phoneNumber || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Email Address:</span>{" "}
                    {selectedRecord.customer?.emailAddress &&
                    !selectedRecord.customer.emailAddress.startsWith("guest_") &&
                    !selectedRecord.customer.emailAddress.includes("@temp.com") &&
                    selectedRecord.customer.emailAddress !== "guest@gemrishi.com"
                      ? selectedRecord.customer.emailAddress
                      : "Not Provided"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Mode of Payment:</span>{" "}
                    <span className="font-bold text-[#214436]">
                      {selectedRecord.paymentMode || (selectedRecord.paymentMethod === "cod" ? "Cash on Delivery" : "Cashfree (Online)")}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Payment Amount:</span>{" "}
                    Total: <span className="font-bold">{rupees(selectedRecord.cartDetails?.totalPrice)}</span>
                    {selectedRecord.amountPaid || selectedRecord.cartDetails?.amountPaid ? (
                      <span className="text-emerald-700 font-bold ml-2">
                        (Paid: {rupees(selectedRecord.cartDetails?.amountPaid || (selectedRecord.amountPaid * 100))})
                      </span>
                    ) : (
                      <span className="text-gray-400 ml-2">(Unpaid)</span>
                    )}
                  </p>
                </div>

                {/* Direct Action Buttons */}
                {selectedRecord.customer?.phoneNumber && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    <a
                      href={`https://wa.me/91${selectedRecord.customer.phoneNumber.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                        `Hi ${selectedRecord.customer?.shippingAddress?.[0]?.name || "there"}, we noticed you were looking at ${
                          selectedRecord.cartDetails?.items?.[0]?.title || "items"
                        } on GemRishi. We're here to assist you with any questions or help you complete your order!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                    </a>

                    <a
                      href={`tel:${selectedRecord.customer.phoneNumber}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    >
                      <Phone className="w-4 h-4" /> Call Customer
                    </a>

                    {selectedRecord.customer?.emailAddress && (
                      <a
                        href={`mailto:${selectedRecord.customer.emailAddress}?subject=${encodeURIComponent(
                          "Your GemRishi Cart - Can we help you?"
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-white hover:bg-gray-900 shadow-sm"
                      >
                        <Mail className="w-4 h-4" /> Send Email
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Device & Network */}
              {(() => {
                const dev = getDeviceDetails(selectedRecord);
                return (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#214436]" /> Device & Network
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 font-medium uppercase">IP Address</div>
                        <div className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5 break-all">
                          {dev.ip || "N/A"}
                          {dev.ip && (
                            <button
                              type="button"
                              title="Copy IP"
                              onClick={() => {
                                navigator.clipboard.writeText(dev.ip);
                                toast.success("IP address copied");
                              }}
                              className="text-gray-400 hover:text-gray-700"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium uppercase">Device</div>
                        <div className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-gray-500" />
                          {dev.deviceName || "N/A"}
                        </div>
                        {dev.deviceType && (
                          <div className="text-xs text-gray-500 capitalize">{dev.deviceType}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium uppercase">OS</div>
                        <div className="font-semibold text-gray-900 mt-0.5">{dev.os || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium uppercase">Browser</div>
                        <div className="font-semibold text-gray-900 mt-0.5">{dev.browser || "N/A"}</div>
                      </div>
                      {dev.userAgent && (
                        <div className="col-span-2 md:col-span-4">
                          <div className="text-xs text-gray-500 font-medium uppercase">User Agent</div>
                          <div className="text-xs text-gray-600 mt-0.5 break-all">{dev.userAgent}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Shipping & Billing Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#214436]" /> Shipping Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-1 h-full">
                    {selectedRecord.customer?.shippingAddress?.[0] ? (
                      <>
                        <p className="font-bold text-sm text-gray-900">{selectedRecord.customer.shippingAddress[0].name}</p>
                        <p>{selectedRecord.customer.shippingAddress[0].line1}</p>
                        {selectedRecord.customer.shippingAddress[0].line2 && <p>{selectedRecord.customer.shippingAddress[0].line2}</p>}
                        <p>{selectedRecord.customer.shippingAddress[0].city}, {selectedRecord.customer.shippingAddress[0].state} {selectedRecord.customer.shippingAddress[0].postalCode}</p>
                        <p>{selectedRecord.customer.shippingAddress[0].country}</p>
                        {selectedRecord.customer.shippingAddress[0].phoneNumber && (
                          <p className="text-gray-600">Phone: {selectedRecord.customer.shippingAddress[0].phoneNumber}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-400 italic">No shipping address provided before drop-off.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#214436]" /> Billing Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-1 h-full">
                    {selectedRecord.customer?.billingAddress?.[0] ? (
                      <>
                        <p className="font-bold text-sm text-gray-900">{selectedRecord.customer.billingAddress[0].name}</p>
                        <p>{selectedRecord.customer.billingAddress[0].line1}</p>
                        {selectedRecord.customer.billingAddress[0].line2 && <p>{selectedRecord.customer.billingAddress[0].line2}</p>}
                        <p>{selectedRecord.customer.billingAddress[0].city}, {selectedRecord.customer.billingAddress[0].state} {selectedRecord.customer.billingAddress[0].postalCode}</p>
                        <p>{selectedRecord.customer.billingAddress[0].country}</p>
                      </>
                    ) : (
                      <p className="text-gray-400 italic">Same as shipping address or not provided.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#214436]" /> Cart Items ({selectedRecord.cartDetails?.itemCount || 0})
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                      <tr>
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedRecord.cartDetails?.items?.map((item, idx) => {
                        const hasJewelry = !!(item.jewelryTitle || item.jewelryImage || item.customization?.jewelryId);
                        const jewelryName = item.jewelryTitle || item.customization?.jewelryId?.jewelryName || "";
                        const ringSize = item.customization?.sizeSystem?.sizeNumber;
                        const goldKarat = item.customization?.goldKarat?.karatType;
                        const metal = item.customization?.metal;
                        const cert = item.customization?.certificate?.certificateType;

                        return (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="p-2.5">
                              <div className="flex items-center gap-3">
                                {/* Single unified item image */}
                                <div className="w-12 h-12 rounded border border-gray-200 bg-gray-50 flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0">
                                  {(item.image || item.jewelryImage) ? (
                                    <img
                                      src={getImageUrl(item.image || item.jewelryImage)}
                                      alt={item.title}
                                      onError={onImageError()}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <Package className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 leading-tight">{item.title}</p>
                                  {jewelryName && (
                                    <p className="text-[11px] text-[#214436] font-medium mt-0.5">
                                      Mounted in: <span className="font-semibold">{jewelryName}</span>
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {(goldKarat || metal) && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                                        Metal: {goldKarat || metal}
                                      </span>
                                    )}
                                    {ringSize && (
                                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium">
                                        Size: {ringSize}
                                      </span>
                                    )}
                                    {cert && (
                                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
                                        Cert: {cert}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-medium text-gray-700">{item.quantity}</td>
                            <td className="p-2.5 text-right font-semibold text-gray-900">{rupees(item.finalPrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Checkout Link & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                {selectedRecord.checkoutUrl && (
                  <a
                    href={selectedRecord.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                  >
                    Open Original Checkout Session <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="flex gap-2 ml-auto">
                  {!selectedRecord.isResolved ? (
                    <Button
                      onClick={() => handleResolve(selectedRecord._id, true)}
                      className="bg-[#214436] text-white hover:bg-[#1a372c] text-xs"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Mark as Resolved
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleResolve(selectedRecord._id, false)}
                      variant="outline"
                      className="text-xs"
                    >
                      Reopen as Pending
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRecord(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
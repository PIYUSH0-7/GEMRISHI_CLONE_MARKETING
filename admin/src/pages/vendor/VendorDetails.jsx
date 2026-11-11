import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import DashboardTable from "../../components/DashboardTable";
import Stone1 from "../../assets/Stone1.svg";
import { motion, AnimatePresence, moveItem } from "framer-motion";
import {
  useBlockOrUnblockRetailerMutation,
  useCreateBuyBackRequestMutation,
  useGetBusinessSummaryQuery,
  useGetFeaturedProductsQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useGetRetailerStockQuery,
  useGetSingleRetailerQuery,
  useSalesDataQuery,
} from "../../features/api/apiSlice";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { FaBackward } from "react-icons/fa";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import VendorDetailsSkeleton from "../../skeletons/VendorDetailsSkeleton";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200 p-1 rounded-lg",
  InProgress: "bg-blue-100 text-blue-800 border-blue-200 p-1 rounded-lg",
  Completed: "bg-purple-100 text-purple-800 border-purple-200 p-1 rounded-lg",
  Cancelled: "bg-red-100 text-red-800 border-red-200 p-1 rounded-lg",
};

function VendorDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [selectedGemstone, setSelectedGemstone] = useState(null);
  const [customization, setCustomization] = useState({
    certificate: null,
  });
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const GemstoneCard = ({ gemstone, index, img }) => (
    <div
      key={index}
      onClick={() => setSelectedGemstone(gemstone)} // 🔹 sets gemstone
      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white"
    >
      <img src={img} className="h-8 w-8" alt="gemstoneimg" />
      <span className="text-sm font-medium text-gray-700">{gemstone.name}</span>
    </div>
  );

  const {
    data: singleRetailer,
    isLoading: singleRetailerLoading,
    error: singleRetailerError,
  } = useGetSingleRetailerQuery(id);
  const Retailer = singleRetailer?.retailer || {};

  const { data: businessSummary } = useGetBusinessSummaryQuery(id);

  const {
    data: retailerStock,
    isLoading: retailerStockLoading,
    error: retailerStockError,
  } = useGetRetailerStockQuery({ retailerId: id, page, limit: 50 });

  const [
    createBuyBackRequest,
    { isLoading: buyBackRequestLoading, error: buyBackRequestError },
  ] = useCreateBuyBackRequestMutation();

  const [blockOrUnblockRetailer] = useBlockOrUnblockRetailerMutation();

  const handleBlockUnblock = async (retailerId, currentStatus) => {
    try {
      const res = await blockOrUnblockRetailer({
        retailerId,
        status: !currentStatus, // toggle status
      }).unwrap();

      toast.success(
        res?.message ||
          `Retailer ${!currentStatus ? "blocked" : "unblocked"} successfully`
      );
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const sendBuyBackRequest = async (items) => {
    const newErrors = {};
    if (!items || items.length === 0) {
      newErrors.items = "Please select at least one item.";
    }

    try {
      await createBuyBackRequest({ retailerId: id, items }).unwrap();
      toast.success("Buy-back request sent successfully.");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Failed to send buy-back request."
      );
    }
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
        {retailerStockLoading ? (
          <VendorDetailsSkeleton />
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Retailer Details - {Retailer?.fullName || "NA"}
              </h1>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`w-1/2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "products"
                      ? "border-[#264A3F] text-[#264A3F]"
                      : "border-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
                  }`}
                >
                  Available Products
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`w-1/2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "contact"
                      ? "border-[#264A3F] text-[#264A3F]"
                      : "border-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
                  }`}
                >
                  Contact Information
                </button>
              </div>
              <button
                onClick={() => handleBlockUnblock(Retailer._id, Retailer.isBlocked)}
                className={`mb-2 px-5 py-2 rounded-lg text-white font-semibold transition ${
                  Retailer.isBlocked
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {Retailer.isBlocked ? "Unblock Retailer" : "Block Retailer"}
              </button>

              {/* Tab Content */}
              {activeTab === "products" && (
                <>
                  {!selectedGemstone ? (
                    <>
                      <h2 className="text-lg font-semibold text-[#264A3F] mb-6">
                        Select Gemstone Subcategory
                      </h2>
                      <div className="space-y-6">
                        {retailerStock?.data &&
                          Object.entries(retailerStock?.data).map(
                            ([subcategoryName, gemstones = []]) => (
                              <div key={subcategoryName}>
                                <GemstoneCard
                                  gemstone={{ name: subcategoryName }}
                                  img={gemstones[0]?.images?.[0]?.url || Stone1}
                                />
                              </div>
                            )
                          )}
                      </div>
                      <Pagination
                        currentPage={page}
                        totalPage={retailerStock?.totalPages}
                        onPageChange={(newPage) => setPage(newPage)}
                      />
                    </>
                  ) : (
                    <div>
                      {/* Selected gemstone UI */}
                      <h2 className="text-lg font-semibold text-[#264A3F] mb-6 gap-4 flex items-center">
                        <button
                          onClick={() => setSelectedGemstone(null)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          <ArrowLeft className="w-5 h-5 text-gray-600 cursor-pointer" />
                        </button>
                        Products
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(retailerStock?.data?.[selectedGemstone?.name] || []).map((item, index) => (
                          
                              <div
                                key={index}
                                className="relative border rounded-lg p-4 flex flex-col bg-white shadow-sm cursor-pointer"
                                onClick={() =>
                                  navigate(`/product-details/${item.slug}`)
                                }
                              >
                                {/* Price at top-right */}
                                <span className="absolute top-4 right-4 text-blue-600 font-semibold">
                                  ₹ {item.price || "NA"}
                                </span>

                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <img
                                      src={item.images?.[0]?.url || Stone1}
                                      alt="Gemstone"
                                      className="w-28 h-28 object-cover rounded-lg"
                                    />
                                  </div>

                                  <div className="flex flex-col justify-between col-span-2">
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {item.name}
                                      </h3>
                                      <p className="text-sm text-gray-500">
                                        SKU : {item.sku || "NA"}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Origin : {item.origin || "NA"}
                                      </p>
                                      <p>
                                        Certificate:{" "}
                                        {item.certificate?.certificateType ||
                                          "NA"}
                                      </p>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4">
                                      {item.status ? (
                                        <button className="bg-[#264A3F] text-white px-4 py-2 rounded-md text-sm w-[50%] hover:bg-[#1f3a31]">
                                          {item.status}
                                        </button>
                                      ) : (
                                        <button
                                          className="bg-[#264A3F] text-white px-4 py-2 rounded-md text-sm w-[50%] hover:bg-[#1f3a31]"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            sendBuyBackRequest([
                                              {
                                                productId: item._id,
                                                customization: {
                                                  certificate: {
                                                    certificateType:
                                                      item.certificate
                                                        ?.certificateType ||
                                                      "NA",
                                                    price:
                                                      item.certificate?.price ||
                                                      0,
                                                  },
                                                },
                                                quantity: 1,
                                              },
                                            ]);
                                          }}
                                        >
                                          Buy-Back
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "contact" && (
                <div className="rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Contact Information
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                        {Retailer?.fullName?.charAt(0) || "NA"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {Retailer?.fullName || "NA"}
                        </h3>
                        <p className="text-gray-500">Retailer</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-900">
                              {Retailer?.email || "NA"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-900">
                              +91 {Retailer?.mobileNo || "NA"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-gray-900">
                              {Retailer?.address || "NA"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "contact" && (
                <div className="rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Business Summary
                  </h2>
                  <div className="flex flex-col gap-4">
                    <p className="font-medium text-gray-700">
                      Total Sales:{" "}
                      <span className="text-gray-500 font-semibold">
                        {businessSummary?.totalSales.toLocaleString() || 0}
                      </span>
                    </p>
                    <p className="font-medium text-gray-700">
                      Total Products:{" "}
                      <span className="text-gray-500 font-semibold">
                        {businessSummary?.totalItems}
                      </span>
                    </p>
                    <p className="font-medium text-gray-700">
                      Total Stock Value:{" "}
                      <span className="text-gray-500 font-semibold">
                        {businessSummary?.totalStockValue.toLocaleString() || 0}
                      </span>
                    </p>
                    <p className="font-medium text-gray-700">
                      Total Orders:{" "}
                      <span className="text-gray-500 font-semibold">
                        {businessSummary?.totalOrders.toLocaleString() || 0}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorDetails;

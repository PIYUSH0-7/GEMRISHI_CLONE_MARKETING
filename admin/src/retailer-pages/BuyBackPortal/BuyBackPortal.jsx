import { useEffect, useState } from "react";
import UpperBar from "../../components/UpperBar";
import RetailerNavbar from "../../components/RetailerNavbar";
import CartItem from "../../components/CartItem";
import ShoppingMap from "../../components/ShoppingMap";
import Form from "../../components/Form";
import RetailerUpperBar from "../../components/RetailerUpperBar";
import {
  useGetAllRequestsQuery,
  useGetBuyBackSummaryQuery,
  useGetCartQuery,
  useGetPendingRequestsQuery,
  useUpdateRequestMutation,
} from "../../features/api/apiSlice";
import { CheckCircle, CircleCheckBig, Clock, IndianRupee, ListCheck, ShoppingBag, Target } from "lucide-react";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";
import BuyBackSkeleton from "../../skeletons/BuyBackSkeleton";

// Custom Components
const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`rounded-lg bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const Button = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  onClick,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;
  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

function BuyBackPortal() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);

  const { data: requests1, isLoading: requestsLoading } =
    useGetPendingRequestsQuery({ page, limit: 4 });
  const list = requests1?.requests;

  const { data: allRequests, isLoading: allRequestsLoading } =
    useGetAllRequestsQuery({ page, limit: 4 });

  const allList = allRequests?.requests;

  const finalList = activeTab === "pending" ? list : allList;
  const current = activeTab === "pending" ? requests1 : allRequests;

  const { data: buyBackSummary } = useGetBuyBackSummaryQuery();


  const [updateRequest] = useUpdateRequestMutation();

  const handleUpdateReq = async ({ status, requestId }) => {
    try {
      await updateRequest({ status, requestId }).unwrap();

      toast.success(`Request status updated to ${status} successfully`);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.msg ||
          error?.error ||
          "Something went wrong"
      );
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (requestsLoading) return <BuyBackSkeleton />;

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200`}
      >
        <RetailerNavbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden`}
          onClick={closeSidebar}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-[230px] bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out lg:hidden
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <RetailerNavbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Main Content */}
      <div
        className={`w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col`}
      >
        <div className="w-full sticky top-0 z-30">
          <RetailerUpperBar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="mb-2">
            <h2 className="font-semibold text-2xl">Buy Back Portal</h2>
            <span className="text-sm text-gray-700">
              Manage your buy-back requests from Gemrishi
            </span>
          </div>

          {/* 3 cards here */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <ListCheck className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-green-600 opacity-80">Total Request</p>
              <p className="text-2xl font-bold text-green-700">
                {buyBackSummary?.summary?.totalRequests}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-blue-600 opacity-80">
                Pending Requests
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {buyBackSummary?.summary?.pendingCount}
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-sm text-orange-600 opacity-80">Accepted Requests</p>
              <p className="text-2xl font-bold text-orange-700">
                {buyBackSummary?.summary?.acceptedCount}
              </p>
            </div>
            {/* <div className="bg-yellow-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <CircleCheckBig className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm text-yellow-600 opacity-80">Completed Requests</p>
              <p className="text-2xl font-bold text-yellow-700">
                {buyBackSummary?.summary?.completedCount}
              </p>
            </div> */}
          </div>

          {/* request area here */}
          <div>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "pending"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending Requests
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                All Requests
              </button>
            </div>

            {/* Request Cards */}
            <div className="space-y-4">
              {finalList?.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-lg shadow-sm p-6 space-y-6"
                >
                  {request.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={item?.productId?.images?.[0]?.url}
                            alt="product-image"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {item?.productId?.name}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {item?.productId?._id}
                          </span>
                          <p className="text-sm text-gray-500 mb-2">
                            Certificate :{" "}
                            {item?.customization?.certificate?.certificateType}
                          </p>
                          <p className="text-sm text-gray-800">
                            Certificate :{" "}
                            {item?.customization?.certificate?.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center">
                    <span className="px-4 py-2 rounded-full bg-yellow-50 text-yellow-600 text-sm font-medium">
                      {request.status}
                    </span>

                    {request.status === "Pending" ? (
                      <>
                        <div className="flex gap-3">
                          <button
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                            onClick={() => {
                              handleUpdateReq({
                                status: "Accepted",
                                requestId: request._id,
                              });
                            }}
                          >
                            Accept
                          </button>
                          <button
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                            onClick={() => {
                              handleUpdateReq({
                                status: "Rejected",
                                requestId: request._id,
                              });
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Pagination
          currentPage={current?.currentPage}
          totalPage={current?.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default BuyBackPortal;

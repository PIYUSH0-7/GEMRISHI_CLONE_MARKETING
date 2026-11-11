import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import {
  FaFilter,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Stone1 from "../../assets/Stone1.svg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useGetJewelleriesQuery,
  useGetProductsQuery,
  useGetRetailerStockByTokenQuery,
  useGetRetailerStockQuery,
  useSearchProductsQuery,
} from "../../features/api/apiSlice";
import ProductCard from "../../components/ProductCard";
import JewelleryCard from "../../components/JewelleryCard";
import Pagination from "../../components/Pagination";
import ProductCardSkeleton from "../../skeletons/ProductCardSkeleton";
import RetailerNavbar from "../../components/RetailerNavbar";
import RetailerUpperBar from "../../components/RetailerUpperBar";

// Custom Card Components
const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Custom Button Component
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
    green: "text-white hover:opacity-90 focus:ring-green-500",
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

const filterTabs = ["Gemstone"];

// Framer Motion variants
const mainContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardItemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

function ProductStock() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("");
  const [selectedJewelryType, setSelectedJewelryType] = useState("Gemstone");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, refetch } = useSearchProductsQuery(searchQuery, {
    skip: searchQuery === "", // skip API if empty
  });

  const isGemstone = selectedJewelryType === "Gemstone";

  const { data: retailerStock, isLoading: retailerStockLoading, error: retailerStockError } = useGetRetailerStockByTokenQuery({page, limit: 15})

  const {
    data: tempproducts,
    isLoading: productsLoading,
    error: productsError,
  } = useGetProductsQuery({ page, limit: 15 }, { skip: !isGemstone });


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleProductClick = (slug) => {
    navigate(`/retailer-product-details/${slug}`);
  };

  const handleJewelleryClick = (slug) => {
    navigate(`/jewellery-details/${slug}`);
  };

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <RetailerNavbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
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
      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col">
        <div className="w-full sticky top-0 z-30">
          <RetailerUpperBar toggleSidebar={toggleSidebar} />
        </div>

        {/* Products Content */}
        <motion.div
          className="flex-1 p-6 overflow-y-auto"
          initial="hidden"
          animate="visible"
          variants={mainContentVariants}
        >
          {/* Breadcrumb */}
          <div className="mb-4">
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/retailer/dashboard")}
            >
              Dashboard
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-700 text-sm font-medium">Products</span>
          </div>

          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Products</h1>

          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between mb-6 flex-wrap">
            {/* Filter buttons on the left */}
            <div className="flex items-center gap-4 flex-wrap">
              {filterTabs.map((tab, index) => (
                <Button
                  key={tab}
                  variant={activeFilter === index ? "default" : "ghost"}
                  size="sm"
                  className={
                    activeFilter === index
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }
                  onClick={() => {
                    setActiveFilter(index);
                    setSelectedJewelryType(tab);
                  }}
                >
                  {tab}
                </Button>
              ))}
            </div>

            {/* Search bar on the right */}
            {/* <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[30%]"
            /> */}
          </div>

          {/* Products Grid with animation */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={cardContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {productsLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : (searchQuery
                  ? searchResults?.products
                  : retailerStock?.retailerStock
                )?.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product.productId}
                    variants={cardItemVariants}
                    onClick={handleProductClick}
                  />
                ))}
          </motion.div>
        </motion.div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={
            isGemstone ? retailerStock?.currentPage : jewelleries?.currentPage
          }
          totalPage={
            isGemstone ? retailerStock?.totalPage : jewelleries?.totalPage
          }
          onPageChange={(page) => setPage(page)}
        />
      </div>
    </div>
  );
}

export default ProductStock;

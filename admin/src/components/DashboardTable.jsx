import { useState } from "react";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useGetProductsQuery } from "../features/api/apiSlice";
import Pagination from "./Pagination";

const rowVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

function DashboardTable() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOrnare, setSelectedOrnare] = useState("");
  const [selectedUltrices, setSelectedUltrices] = useState("");
  const [selectedErat, setSelectedErat] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useGetProductsQuery({ page, limit: 5 });
  


  // Sample data - you can replace this with your actual data
  const allData =
    products?.products?.map((prod, index) => ({
      id: prod._id,
      magna: new Date(prod.createdAt).toLocaleDateString(), // created date
      ultrices: prod.name, // gemstone name
      ornare: prod.color, // gemstone color
      erat: prod.shape, // shape
      nisl: prod.weight, // weight
      facilisis: prod.stock, // stock
      elit: prod.isAvailable ? "Available" : "Out of Stock", // availability
      senectus: prod.isFeatured ? "Featured" : "Not Featured", // featured info
      felis: prod.origin, // origin
    })) || [];
  // ✅ If backend handles pagination, just use products.data directly
  const currentData = allData; // already paginated by API

  const handlePageChange = (page) => {
    setPage(page); // triggers API refetch with ?page=page
  };

  const handlePrevious = () => {
    if (products?.currentPage > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (products?.currentPage < products?.totalPage) {
      setPage((prev) => prev + 1);
    }
  };

  const clearAllFilters = () => {
    setSelectedDate("");
    setSelectedOrnare("");
    setSelectedUltrices("");
    setSelectedErat("");
  };

  if (productsLoading) {
    return <p>Loading...</p>;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-lg shadow-sm p-6 mt-6"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
        <div className="mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Gemstones
          </h2>
          <p className="text-gray-500">
            Overview of gemstones with details like origin, weight, stock, and
            availability.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`${import.meta.env.VITE_URL || "http://localhost:7788/api/v1"}/product/products-export`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white transition shadow-sm"
            style={{ backgroundColor: "#1e3a8a" }}
          >
            📥 Export CSV
          </a>
          <a
            href={`${import.meta.env.VITE_URL || "http://localhost:7788/api/v1"}/product/products-view`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white transition shadow-sm"
            style={{ backgroundColor: "#214436" }}
          >
            📊 Live Sheet
          </a>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Created Date
                  
                </div>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Gemstone name
                  
                </div>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Color
                  
                </div>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Shape
                  
                </div>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Weight
                  
                </div>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Stock
                  
                </div>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Available
                  
                </div>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Status
                  
                </div>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  Origin
                  
                </div>
              </th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <tbody>
              {currentData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="py-4 px-2 text-gray-800">{item.magna}</td>
                  <td className="py-4 px-2 text-gray-800">{item.ultrices}</td>
                  <td className="py-4 px-2 text-gray-800">{item.ornare}</td>
                  <td className="py-4 px-2 text-gray-800">{item.erat}</td>
                  <td className="py-4 px-2 text-gray-800">{item.nisl}</td>
                  <td className="py-4 px-2 text-gray-800">{item.facilisis}</td>
                  <td className="py-4 px-2 text-gray-800">{item.elit}</td>
                  <td className="py-4 px-2 text-gray-800">{item.senectus}</td>
                  <td className="py-4 px-2 text-gray-800">{item.felis}</td>
                </motion.tr>
              ))}
            </tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* Pagination Section */}
      <Pagination
        currentPage={products?.currentPage}
        totalPage={products?.totalPage}
        onPageChange={handlePageChange}
      />
    </motion.div>
  );
}

export default DashboardTable;

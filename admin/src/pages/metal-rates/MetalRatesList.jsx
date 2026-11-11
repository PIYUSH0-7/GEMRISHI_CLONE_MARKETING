import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import DashboardTable from "../../components/DashboardTable";
import Stone1 from "../../assets/Stone1.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useMetalRatesHistoryQuery } from "../../features/api/apiSlice";
import Pagination from "../../components/Pagination";

function MetalRatesList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const {
    data: ratesHistory,
    isLoading: ratesHistoryLoading,
    error: ratesHistoryError,
  } = useMetalRatesHistoryQuery({
    page,
    limit: 10,
  });

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
        <div className="p-6 space-y-6">
          <div className="mb-6">
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/metal-rates")}
            >
              Metal Rates
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-500 text-sm mx-2">History</span>
          </div>
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Calendar size={20} /> Historical Metal Rates
            </h2>
            <p className="text-gray-500 mb-4 text-sm">
              Per gram pricing history
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="py-4 px-8 text-left border-b">Date</th>
                    <th className="py-4 px-8 text-left border-b">Gold 24K</th>
                    <th className="py-4 px-8 text-left border-b">Gold 22K</th>
                    <th className="py-4 px-8 text-left border-b">Gold 18K</th>
                    <th className="py-4 px-8 text-left border-b">Silver</th>
                    <th className="py-4 px-8 text-left border-b">Platinum</th>
                    <th className="py-4 px-8 text-left border-b">Panchadhatu</th>
                  </tr>
                </thead>
                <tbody>
                  {ratesHistory?.rates.map((rate, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-4 px-8">
                        {new Date(rate?.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-8">
                        {rate?.gold?.gold24k?.withGSTRate}
                      </td>
                      <td className="py-4 px-8">
                        {rate?.gold?.gold22k?.withGSTRate}
                      </td>
                      <td className="py-4 px-8">
                        {rate?.gold?.gold18k?.withGSTRate}
                      </td>
                      <td className="py-4 px-8">{rate?.silver?.withGSTRate}</td>
                      <td className="py-4 px-8">
                        {rate?.platinum?.withGSTRate}
                      </td>
                      <td className="py-4 px-8">
                        {rate?.panchadhatu?.withGSTRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPage={ratesHistory?.totalPages || 1}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetalRatesList;

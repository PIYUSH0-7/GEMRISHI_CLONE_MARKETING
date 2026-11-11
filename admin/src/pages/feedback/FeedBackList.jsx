import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAllReviewsQuery,
  useGetContactsQuery,
  useGetSubscribersQuery,
} from "../../features/api/apiSlice";
import Pagination from "../../components/Pagination";
import { Textarea } from "../../ui/textarea";

export const FeedBackList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const {
    data: contacts,
    isLoading,
    error,
  } = useGetAllReviewsQuery({ page, limit: 10 });


  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <Navbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Overlay for mobile */}
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

      {/* Main content */}
      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Feedbacks
          </h2>

          {isLoading ? (
            <p className="text-center text-gray-500">Loading reviews...</p>
          ) : error ? (
            <p className="text-center text-red-500">Failed to load reviews.</p>
          ) : contacts?.reviews?.length === 0 ? (
            <p className="text-center text-gray-500">No reviews found.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow">
              <table className="min-w-full text-sm text-gray-700 border-collapse">
                <thead className="bg-green-600 text-white text-left">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Review</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Image</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {contacts?.reviews?.map((rev, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {/* Index */}
                      <td className="p-3">{i + 1}</td>

                      {/* Item Name */}
                      <td className="p-3 font-medium">{rev.name}</td>

                      {/* Review Text */}
                      <td className="p-3 max-w-[250px] break-words">
                        {rev.review.review}
                      </td>

                      {/* Rating */}
                      <td className="p-3">{rev.review.rating} ⭐</td>

                      {/* Review Image */}
                      <td className="p-3">
                        {rev.review?.image?.url ? (
                          <img
                            src={rev.review.image.url}
                            alt="review"
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3">
                        {new Date(rev.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={contacts?.page}
                totalPage={contacts?.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

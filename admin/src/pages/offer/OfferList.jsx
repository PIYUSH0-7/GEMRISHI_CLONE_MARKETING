import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useDeleteOfferMutation,
  useGetOffersQuery,
} from "../../features/api/apiSlice";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";
import OfferEditModal from "../../components/OfferEditModal";

export const OfferList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    error,
  } = useGetOffersQuery({ page, limit });

  const offers = response?.data || [];

  const [deleteOfferById] = useDeleteOfferMutation();

  const deleteOffer = async (id) => {
    try {
      await deleteOfferById(id).unwrap();
      toast.success("Offer deleted successfully");
    } catch (error) {
      toast.error("Could not delete offer try again");
    }
  };


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

      {/* Main */}
      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>

        {/* Offer List */}
        <div className="p-6">
           <div className="mb-6">
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/offer")}
            >
              Create Offer
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-500 text-sm mx-2">Offer Lists</span>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Offers</h2>
              <button
                onClick={() => navigate("/offer")}
                className="bg-[#264A3F] text-white px-4 py-2 rounded-lg hover:bg-[#1b352d]"
              >
                + Create Offer
              </button>
            </div>

            {isLoading && <p>Loading offers...</p>}
            {error && <p className="text-red-500">Error loading offers</p>}

            {!isLoading && offers?.length > 0 ? (
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Discount</th>
                    <th className="p-3 text-left">Expiry</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers?.map((offer) => (
                    <tr key={offer._id} className="border-t">
                      <td className="p-3">{offer.name}</td>
                      <td className="p-3 capitalize">{offer.offerType}</td>
                      <td className="p-3">
                        {offer.discountType === "percent"
                          ? `${offer.discountValue}%`
                          : `₹${offer.discountValue}`}
                      </td>
                      <td className="p-3">
                        {new Date(offer.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            offer.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {offer.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          className="text-blue-500 hover:underline cursor-pointer"
                          onClick={() => {
                            setOpen(true), setSelectedOffer(offer);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:underline cursor-pointer"
                          onClick={() => deleteOffer(offer._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !isLoading && <p>No offers found.</p>
            )}
            <Pagination
              currentPage={response?.pagination?.currentPage}
              totalPage={response?.pagination?.totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
      {open && (
        <OfferEditModal offer={selectedOffer} onClose={() => setOpen(false)} />
      )}
    </div>
  );
};

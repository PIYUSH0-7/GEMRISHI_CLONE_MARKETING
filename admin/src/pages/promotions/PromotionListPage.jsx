import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Stone1 from "../../assets/Stone1.svg";
import {
  useDeleteBannerMutation,
  useGetBannersQuery,
  useUpdateBannerMutation,
} from "../../features/api/apiSlice";
import { DeleteIcon, Edit2Icon } from "lucide-react";
import { MdDeleteForever } from "react-icons/md";
import PromotionEditCard from "../../components/PromotionEditCard";
import { toast } from "react-toastify";
import BannerSkeleton from "../../skeletons/BannerSkeleton";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200 p-1 rounded-lg",
  InProgress: "bg-blue-100 text-blue-800 border-blue-200 p-1 rounded-lg",
  Completed: "bg-purple-100 text-purple-800 border-purple-200 p-1 rounded-lg",
  Cancelled: "bg-red-100 text-red-800 border-red-200 p-1 rounded-lg",
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

function PromotionListPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: banners,
    isLoading: bannersLoading,
    error: bannerError,
  } = useGetBannersQuery();
  const [recentBanners, setRecentBanners] = useState([]);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (banners && banners.length > 0) {
      // Sort banners by createdAt descending (newest first)
      const sorted = [...banners].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Take the first 2 or any number you want as "recent"
      setRecentBanners(sorted.slice(0, 2));
    }
  }, [banners]);

  const [deleteBanner, { isLoading: bannerLoading, error: deleteBannerError }] =
    useDeleteBannerMutation();

  const handleDeleteBanner = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <p className="text-md font-medium text-gray-800">
            Delete this banner?
          </p>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              onClick={async () => {
                try {
                  await deleteBanner(id).unwrap();
                  toast.success("Banner Deleted Successfully");
                } catch (error) {
                  toast.error(
                    error?.data?.msg ||
                      error?.data?.message ||
                      error?.error ||
                      "Something went wrong"
                  );
                }
                closeToast();
              }}
            >
              Yes
            </button>

            <button
              className="px-3 py-1.5 rounded bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300"
              onClick={closeToast}
            >
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
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
          <div className="bg-white w-full rounded-2xl h-auto p-8 shadow-md">
            {/*Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-2xl text-gray-800">
                  Promotion Management
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage promotion for website
                </p>
              </div>
              <Button
                className="cursor-pointer"
                onClick={() => navigate("/promotions")}
              >
                Add New Banner
              </Button>
            </div>

            {/* LIST */}
            <div>
              <h2 className="font-semibold text-lg text-gray-700 mb-4">
                Recently created promotions
              </h2>
              {bannersLoading ? (
                <BannerSkeleton />
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {recentBanners?.map((promo) => (
                    <div
                      key={promo._id} // use _id if that's what your DB provides
                      className="relative flex justify-center bg-gray-50 p-2 rounded-lg hover:shadow-lg transition-shadow duration-200"
                    >
                      <img
                        src={promo?.image?.url}
                        alt={`promotion-${promo.name}`}
                        className="max-h-40 object-contain rounded"
                      />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                        {promo.name}
                      </div>
                      <button
                        className="absolute top-2 right-12 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                        onClick={() => {
                          setOpen(true);
                          setBanner(promo);
                        }}
                      >
                        <Edit2Icon className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                        onClick={() => handleDeleteBanner(promo._id)}
                      >
                        <MdDeleteForever className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="font-semibold text-lg text-gray-700 mt-8 mb-4">
                All Promotions
              </h2>
              {bannersLoading ? (
                <BannerSkeleton />
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {banners?.map((promo) => (
                    <div
                      key={promo._id} // use _id if that's what your DB provides
                      className="relative flex justify-center bg-gray-50 p-2 rounded-lg hover:shadow-lg transition-shadow duration-200"
                    >
                      <img
                        src={promo?.image?.url}
                        alt={`promotion-${promo.name}`}
                        className="max-h-40 object-contain rounded"
                      />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                        {promo.name}
                      </div>
                      <button
                        className="absolute top-2 right-12 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                        onClick={() => {
                          setOpen(true);
                          setBanner(promo);
                        }}
                      >
                        <Edit2Icon className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                        onClick={() => handleDeleteBanner(promo._id)}
                      >
                        <MdDeleteForever className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {open && (
        <PromotionEditCard setOpen={setOpen} open={open} banner={banner} />
      )}
    </div>
  );
}

export default PromotionListPage;

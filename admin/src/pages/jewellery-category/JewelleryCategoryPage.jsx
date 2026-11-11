import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import DashboardTable from "../../components/DashboardTable";
import Stone1 from "../../assets/Stone1.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  useDeleteSingleJewelleryCategoryMutation,
  useGetCategoryQuery,
  useGetJewelryCategoryQuery,
} from "../../features/api/apiSlice";
import deletebtn from "../../assets/DeleteIcon.svg";
import CategorySkeleton from "../../skeletons/CategorySkeleton";
import { toast } from "react-toastify";
import { getImageUrl, onImageError } from "../../utils/imageUtils";

function JewelleryCategoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const { data: categories, isLoading: categoriesLoading } =
    useGetJewelryCategoryQuery();

  const [
    deleteCategory,
    { isLoading: deleteCategoryLoading, error: deleteCategoryError },
  ] = useDeleteSingleJewelleryCategoryMutation();

const handleDelete = (categoryId) => {
  toast(
    ({ closeToast }) => (
      <div className="flex flex-col gap-3">
        <p className="text-md font-medium text-gray-800">
          Delete this category?
        </p>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            onClick={async () => {
              try {
                await deleteCategory(categoryId).unwrap();
                toast.success("Category with subcategories deleted Successfully");
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
          <div className="mb-4">
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/")}
            >
              Dashboard
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-700 text-sm font-medium">
              Gemstone Categories
            </span>
          </div>
          <div className="bg-white w-full h-auto rounded-lg p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                All Jewellery Parent Categories
              </h2>
              <div className="flex gap-4">
                <Button
                  className="cursor-pointer bg-[#264A3F] text-white"
                  onClick={() => navigate("/add-jewellery-category")}
                >
                  + Add New Jewellery Parent Category
                </Button>
              </div>
            </div>

            <br />

            {categoriesLoading ? (
              <CategorySkeleton />
            ) : (
              <div className="p-4">
                {categories?.jewelryCategories?.map((cat) => (
                  <div key={cat._id} className="mb-6">
                    {/* Parent Category */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-md font-semibold text-gray-900 mb-2 p-2">
                        {cat.name}
                      </h2>
                      <Button onClick={() => handleDelete(cat._id)}>
                        <img src={deletebtn} alt="deletebtn" />
                      </Button>
                    </div>
                    {/* Subcategories */}
                    <div className="grid grid-cols-6 gap-3">
                      {cat.jewelrySubCategories.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex justify-center gap-4 p-2 items-center border rounded-2xl cursor-pointer"
                          onClick={() =>
                            navigate(`/jewellery-category/${sub.slug}`)
                          }
                        >
                          <img
                            src={getImageUrl(sub.image?.url, Stone1)}
                            onError={onImageError(Stone1)}
                            className="h-12 w-12 object-cover rounded-full"
                            alt={sub.name}
                          />
                          <p className="text-gray-800">{sub.name}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="cursor-pointer bg-[#264A3F] text-white mt-4"
                      onClick={() => navigate("/add-jewellery-category")}
                    >
                      + Add New Category
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JewelleryCategoryPage;

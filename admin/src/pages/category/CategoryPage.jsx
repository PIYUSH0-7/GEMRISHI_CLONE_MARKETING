import { useCallback, useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import DashboardTable from "../../components/DashboardTable";
import Stone1 from "../../assets/Stone1.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  useDeleteSingleCategoryMutation,
  useGetCategoryQuery,
} from "../../features/api/apiSlice";
import deletebtn from "../../assets/DeleteIcon.svg";
import { toast } from "react-toastify";
import CategorySkeleton from "../../skeletons/CategorySkeleton";
import { getImageUrl, onImageError } from "../../utils/imageUtils";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200 p-1 rounded-lg",
  InProgress: "bg-blue-100 text-blue-800 border-blue-200 p-1 rounded-lg",
  Completed: "bg-purple-100 text-purple-800 border-purple-200 p-1 rounded-lg",
  Cancelled: "bg-red-100 text-red-800 border-red-200 p-1 rounded-lg",
};

function CategoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoryQuery();

  const [
    deleteCategory,
    { isLoading: deleteCategoryLoading, error: deleteCategoryError },
  ] = useDeleteSingleCategoryMutation();

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
                  toast.success("Category deleted successfully");
                } catch (err) {
                  toast.error(
                    err?.data?.msg ||
                      err?.data?.message ||
                      err?.error ||
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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

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
          {/* Breadcrumb */}
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
                All Gemstone Parent Categories
              </h2>
              <div className="flex gap-4">
                <Button
                  className="cursor-pointer bg-[#264A3F] text-white"
                  onClick={() => navigate("/category-order")}
                >
                  <div className="p-1">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
									</div>
                  Change Order Of Category
                </Button>
                <Button
                  className="cursor-pointer bg-[#264A3F] text-white"
                  onClick={() => navigate("/addcategory")}
                >
                  + Add New Gemstone Parent Category
                </Button>
              </div>
            </div>

            <br />

            {categoriesLoading ? (
              <CategorySkeleton />
            ) : (
              <div className="p-4">
                {categories?.categories?.map((cat) => (
                  <div key={cat._id} className="mb-6">
                    {/* Parent Category */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 p-2">
                        {cat.name}
                      </h2>
                      <Button onClick={() => handleDelete(cat._id)}>
                        <img src={deletebtn} alt="deletebtn" />
                      </Button>
                    </div>

                    {/* Subcategories */}
                    <div className="grid grid-cols-6 gap-3">
                      {cat.subCategories.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex p-2 items-center gap-2 border rounded-2xl cursor-pointer"
                          onClick={() => navigate(`/category/${sub.slug}`)}
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
                      onClick={() => navigate("/addcategory")}
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

export default CategoryPage;

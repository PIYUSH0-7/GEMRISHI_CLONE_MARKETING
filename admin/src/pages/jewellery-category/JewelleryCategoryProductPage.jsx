import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import Stone1 from "../../assets/Stone1.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteJewellerySubCategoryMutation,
  useGetSingleJewellerySubCategoryQuery,
  useGetSingleSubCategoryQuery,
} from "../../features/api/apiSlice";
import securityShield from "../../assets/green-shield-25859.svg";
import { ChevronDown, ChevronUp } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import JewelleryCard from "../../components/JewelleryCard";
import { toast } from "react-toastify";
import editLogo from "../../assets/edit.svg";
import deleteLogo from "../../assets/delete.svg";
import Pagination from "../../components/Pagination";
import CategoryPageSkeleton from "../../skeletons/CategoryPageSkeleton";
import { getImageUrl, onImageError } from "../../utils/imageUtils";

function JewelleryCategoryProductPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState("About");
  const tabs = ["About", "Meaning", "Buyer Guide", "Quality & Price", "FAQ"];
  const [page, setPage] = useState(1);
  const { data: subcategory, isLoading: subcategoryLoading } =
    useGetSingleJewellerySubCategoryQuery({ slug, page, limit: 10 });
  const [openIndex, setOpenIndex] = useState(null);

  const handlePageChange = (page) => {
    setPage(page); // triggers API refetch with ?page=page
  };

  const [
    deleteSubcategory,
    { isLoading: deleteSubcategoryLoading, error: deleteSubcategoryError },
  ] = useDeleteJewellerySubCategoryMutation();

  const handleDelete = async () => {
    try {
      await deleteSubcategory(subcategory?.subcategory?._id).unwrap();
      toast.success("Category Deleted Successfully");
      navigate("/jewellery-category");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
    }
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const handleProductClick = (slug) => {
    navigate(`/jewellery-details/${slug}`);
  };

  const renderContent = () => {
    if (!subcategory) return null;

    switch (activeTab) {
      case "About":
        return (
          <div className="py-8">
            <p className="text-base sm:text-[18px] font-serif text-gray-700 leading-relaxed">
              {subcategory?.subcategory?.about}
            </p>
          </div>
        );
      case "Meaning":
        return (
          <div className="py-8">
            <h2 className="text-xl sm:text-2xl font-serif text-gray-800 font-bold mb-4">
              Meaning
            </h2>
            <p className="text-base sm:text-[18px] font-serif text-gray-700 leading-relaxed">
              {subcategory?.subcategory?.meaning}
            </p>
          </div>
        );
      case "Buyer Guide":
        return (
          <div className="py-8">
            <h2 className="text-xl sm:text-2xl font-serif text-gray-800 font-bold mb-4">
              Buyer Guide
            </h2>
            <p className="text-base sm:text-[18px] font-serif text-gray-700 leading-relaxed">
              {subcategory?.subcategory?.buyerGuide}
            </p>
          </div>
        );
      case "Quality & Price":
        return (
          <div className="py-8">
            <h2 className="text-xl sm:text-2xl font-serif text-gray-800 font-bold mb-4">
              Price Information
            </h2>
            <p className="text-base sm:text-[18px] font-serif text-gray-700 leading-relaxed">
              {subcategory?.subcategory?.qualityAndPrice}
            </p>
          </div>
        );
      case "FAQ":
        return (
          <div className="py-8">
            <h2 className="text-xl sm:text-2xl font-serif text-gray-800 font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {subcategory?.subcategory?.faqs?.map((faq, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center px-4 py-3 text-left text-blue-600 font-medium hover:bg-gray-50"
                  >
                    {faq.question}
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-4 py-3 text-gray-700 bg-gray-50 border-t">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

        {subcategoryLoading ? (
          <CategoryPageSkeleton />
        ) : (
          <div className="p-6">
            <div className="mb-4">
              <span
                className="text-gray-500 text-sm cursor-pointer"
                onClick={() => navigate("/")}
              >
                Dashboard
              </span>
              <span className="text-gray-400 mx-2">{">"}</span>
              <span
                className="text-gray-700 text-sm font-medium cursor-pointer"
                onClick={() => navigate("/jewellery-category")}
              >
                Jewellery Categories
              </span>
              <span className="text-gray-400 mx-2">{">"}</span>
              <span className="text-gray-700 text-sm font-medium">
                Jewellery Category
              </span>
            </div>
            <div className="w-full flex flex-col lg:flex-row px-4">
              <div className="w-full h-auto lg:w-[30%] flex flex-col items-center gap-4 mt-8 lg:mt-0">
                <div>
                  {/* Using subcategory image. If it's null, BlueSapphire will be used. */}
                  <img
                    src={getImageUrl(subcategory?.subcategory?.image?.url, Stone1)}
                    alt={subcategory?.subcategory?.name || "Jewellery Category"}
                    onError={onImageError(Stone1)}
                    className="w-auto max-w-full h-auto transition-transform duration-300 transform hover:scale-110"
                  />
                </div>
              </div>
              <div className="w-full lg:w-[60%] flex flex-col pt-4">
                <h1 className="text-2xl sm:text-4xl text-black font-serif">
                  {subcategory?.subcategory?.name}
                </h1>
                <p className="text-lg sm:text-[20px] font-serif text-gray-700 leading-[1.2] mt-4">
                  {subcategory?.subcategory?.description}
                </p>

                {/* Tags Section */}
                <div className="w-full mt-4">
                  <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-16">
                    {subcategory?.subcategory?.tags &&
                      subcategory?.subcategory?.tags
                        .slice(0, 2)
                        .map((tag, index) => (
                          <div
                            key={index}
                            className="flex flex-row items-center gap-3"
                          >
                            <img
                              src={securityShield}
                              alt="Security Shield"
                              className="w-5 h-5 sm:w-6 sm:h-6"
                            />
                            <p className="text-[14px] sm:text-[16px] font-serif text-gray-700 font-bold">
                              {tag}
                            </p>
                          </div>
                        ))}
                  </div>
                  <div className="w-full flex flex-col sm:flex-row gap-4 mt-2">
                    {subcategory?.subcategory?.tags &&
                      subcategory?.subcategory?.tags
                        .slice(2, 4)
                        .map((tag, index) => (
                          <div
                            key={index}
                            className="flex flex-row items-center gap-3"
                          >
                            <img
                              src={securityShield}
                              alt="Security Shield"
                              className="w-5 h-5 sm:w-6 sm:h-6"
                            />
                            <p className="text-[14px] sm:text-[16px] font-serif text-gray-700 font-bold">
                              {tag}
                            </p>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[10%] flex justify-end items-start mt-4 lg:mt-0 gap-2">
                <div
                  onClick={() =>
                    navigate(`/jewellery-category-edit-details/${slug}`)
                  }
                >
                  <img src={editLogo} className="h-8 w-8" alt="" />
                </div>
                <div onClick={handleDelete}>
                  <img src={deleteLogo} className="h-8 w-8" alt="" />
                </div>
              </div>
            </div>

            {/* Tab Section */}
            <div className="w-full mt-8">
              <div className="flex flex-col px-4">
                <div className="flex items-end border-b-3 border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide gap-8">
                  {tabs.map((tab) => (
                    <div
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`cursor-pointer py-3 text-[20px] font-serif transition-colors duration-200 font-bold text-[#02498FB2] px-4 sm:px-8 lg:px-0 lg:gap-14
                                                ${
                                                  activeTab === tab
                                                    ? "border-b-[3px] border-[#02498FB2]"
                                                    : ""
                                                }
                                            `}
                    >
                      <span>{tab}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full">{renderContent()}</div>
              </div>
            </div>
            {/* Product List */}
            <div className="p-4">
              <h2 className="text-xl text-black font-serif mb-6">
                Products in {subcategory?.subcategory?.name}
              </h2>
              <div className="grid grid-cols-6 gap-8">
                {subcategory?.jewelleries?.map((prod) => (
                  <JewelleryCard
                    key={prod._id}
                    item={prod}
                    onClick={handleProductClick}
                  />
                ))}
              </div>
            </div>

            {/* <Pagination /> */}
            <Pagination
              currentPage={subcategory?.currentPage}
              totalPage={subcategory?.totalPage}
              onPageChange={(page) => setPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default JewelleryCategoryProductPage;

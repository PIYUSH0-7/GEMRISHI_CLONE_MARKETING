import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateBannerMutation } from "../../features/api/apiSlice";
import { toast } from "react-toastify";
import { FaUpload } from "react-icons/fa";
import IsActiveSwitch from "../../components/IsActiveSwitch";
import { useNavigate } from "react-router-dom";

function PromotionPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
    image: "",
    imagePreview: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [createBanner, { isLoading: bannerLoading, error: bannerError }] =
    useCreateBannerMutation();

  const handleSave = async () => {
    // Basic validation
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
   
    if (!formData.image) newErrors.image = "Image is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const data = new FormData();
      data.append("name", formData.name);
      // data.append("pramotionId", formData.promotionId);
      data.append("isActive", formData.isActive.toString());
      data.append("image", formData.image);

      await createBanner(data).unwrap();
      navigate("/promotions-list");
      toast.success("Promotion banner created successfully");
    } catch (error) {
      toast.error(error?.data?.msg || error?.data?.message || error?.error || "Could not create promotion banner");
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
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

        <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
           <div className="mb-6">
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/promotions-list")}
            >
              Promotions
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-500 text-sm mx-2">Add Promotion Banner</span>
          </div>
          {/* Promotion/Banner Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between p-2">
              <h2 className="text-gray-700 font-semibold mb-4">
                Promotion/Banner :
              </h2>

              <button
                className="px-6 py-2 bg-[#214436] text-white rounded  transition"
                onClick={handleSave}
              >
                Publish
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center mb-4 h-40 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="imageUpload"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData((prev) => ({
                      ...prev,
                      image: file,
                      imagePreview: URL.createObjectURL(file), // 👈 preview URL
                    }));
                  }
                }}
              />

              <label
                htmlFor="imageUpload"
                className="w-full h-full flex flex-col justify-center items-center cursor-pointer"
              >
                {!formData.imagePreview ? (
                  <>
                    <div className="mb-2 text-gray-400">
                      <FaUpload size={24} />
                    </div>
                    <span className="text-sm text-gray-400">
                      Upload Thumbnails
                    </span>
                  </>
                ) : (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-md"
                  />
                )}

                {formData.image && (
                  <p className="text-xs mt-2 text-green-500">
                    {formData.image.name} selected
                  </p>
                )}
              </label>
            </div>
            {errors.image && (
              <span className="text-red-500 text-xs">{errors.image}</span>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Promotion/Banner Name :
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  name="name"
                  value={formData.name}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">{errors.name}</span>
                )}
              </div>
              {/* <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Promotion ID :
                </label>
                <input
                  type="text"
                  name="promotionId"
                  value={formData.promotionId}
                  onChange={handleInputChange}
                  placeholder="Select category"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {errors.promotionId && (
                  <span className="text-red-500 text-xs">
                    {errors.promotionId}
                  </span>
                )}
              </div> */}
             
            </div>
             <IsActiveSwitch
                isActive={formData.isActive}
                setFormData={setFormData}
              />
          </div>

          {/* Discount Section */}
          {/* <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-gray-700 font-semibold mb-4">Discount :</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Discount Name :
                </label>
                <input
                  type="text"
                  placeholder="Select category"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Expiry Date :
                </label>
                <input
                  type="date"
                  placeholder="Select category"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Description :
              </label>
              <textarea
                placeholder="Select category"
                rows="4"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
                Publish
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default PromotionPage;

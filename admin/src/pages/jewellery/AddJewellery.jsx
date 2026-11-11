"use client";
import { useState, useRef, useEffect } from "react";
import { FaImage, FaVideo, FaPlus, FaTimes } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useCreateJewelleryMutation,
  useGetJewellerySubCategoryQuery,
  useGetSubCategoryQuery,
  useLazySearchProductsQuery,
  useGetLatestMetalRateQuery,
} from "../../features/api/apiSlice";
import { toast } from "react-toastify";

// Framer Motion variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const formVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const sizeSystemData = [
  {
    sizeType: "IN",
    sizeNumbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
  {
    sizeType: "US",
    sizeNumbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
  {
    sizeType: "UK",
    sizeNumbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
];

function AddJewellery() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    jewelryType: "",
    jewelryName: "",
    // sizeSystem: [{ sizeType: "", sizeNumbers: "" }],
    sizeSystem: sizeSystemData,
    jewelryDesc: "",
    metal: "",
    stock: "",
    jewelryPrice: "",
    jewelryMetalWeight: "",
    makingChargePercent: "10",
    deliveryDays: "",
    isDiamondSubstitute: false,
    diamondSubstitute: [{ name: "", price: "" }],
    gemstoneWeightTypes: [{ weight: "", price: "" }],
    certificateTypes: [{ type: "", price: "" }],
    images: [],
    videos: [],
    isAvailable: true,
    isFeatured: false,
    upSellingProducts: [""],
  });
  const [categoryId, setCategoryId] = useState("");
  const [productSubCategoryId, setProductSubCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [productId, setProductId] = useState("");
  const [errors, setErrors] = useState({});

  const { data: latestRatesData } = useGetLatestMetalRateQuery();

  const getRateForMetal = (ratesDoc, metalName) => {
    if (!ratesDoc || !metalName) return 0;
    const m = metalName.toLowerCase();
    if (m.includes("18k")) return Number(ratesDoc?.gold?.gold18k?.withoutGSTRate || 0);
    if (m.includes("24k")) return Number(ratesDoc?.gold?.gold24k?.withoutGSTRate || 0);
    if (m.includes("gold") || m.includes("22k")) return Number(ratesDoc?.gold?.gold22k?.withoutGSTRate || 0);
    if (m.includes("silver")) return Number(ratesDoc?.silver?.withoutGSTRate || 0);
    if (m.includes("platinum")) return Number(ratesDoc?.platinum?.withoutGSTRate || 0);
    if (m.includes("panchadhatu") || m.includes("brass") || m.includes("panchdhatu"))
      return Number(ratesDoc?.panchadhatu?.withoutGSTRate || 0);
    return 0;
  };

  const {
    data: jewelrySubcategories,
    isLoading,
    error,
  } = useGetJewellerySubCategoryQuery();
  const [
    triggerSearch,
    { data, isLoading: productsLoading, error: productError },
  ] = useLazySearchProductsQuery();

  const [
    createJewellery,
    { isLoading: jewelleryLoading, error: jewelleryError },
  ] = useCreateJewelleryMutation();

  const { data: prodSubcategories } = useGetSubCategoryQuery();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    triggerSearch(value); // fetch from API
  };

  const handleDynamic = (index, masterField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [masterField]: prev[masterField].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      const key = `${masterField}_${index}`;

      if (Array.isArray(value)) {
        // ✅ For sizeNumbers (array input)
        if (value.length === 0 || value.some((v) => v === "")) {
          newErrors[key] = "Sizes cannot be empty";
        } else {
          delete newErrors[key];
        }
      } else if (typeof value === "string") {
        // ✅ For text fields like sizeType
        if (!value.trim()) {
          newErrors[key] = "This field is required";
        } else {
          delete newErrors[key];
        }
      }

      return newErrors;
    });
  };

  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  const navigate = useNavigate();
  const imagesInputRef = useRef(null);
  const videosInputRef = useRef(null);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews, videoPreviews]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const nextMetal = name === "metal" ? value : formData.metal;
    const nextWeight =
      name === "jewelryMetalWeight" ? value : formData.jewelryMetalWeight;
    const nextPercent =
      name === "makingChargePercent" ? value : formData.makingChargePercent;

    const rate = getRateForMetal(latestRatesData?.latestRate, nextMetal);
    const wt = Number(nextWeight) || 0;
    const pct = Number(nextPercent) || 0;

    let autoPrice = formData.jewelryPrice;
    if (
      rate > 0 &&
      wt > 0 &&
      ["metal", "jewelryMetalWeight", "makingChargePercent"].includes(name)
    ) {
      const total = (rate + (rate * pct) / 100) * wt;
      autoPrice = Math.round(total * 1.03);
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(rate > 0 &&
      wt > 0 &&
      ["metal", "jewelryMetalWeight", "makingChargePercent"].includes(name)
        ? { jewelryPrice: autoPrice }
        : {}),
    }));

    // Live validation
    setErrors((prev) => {
      const newErrors = { ...prev };

      if (name === "makingChargePercent") {
        const numVal = Number(value);
        if (value === "") {
          newErrors.makingChargePercent = "Making charge % is required";
        } else if (numVal < 0 || numVal > 100) {
          newErrors.makingChargePercent =
            "Making charge % must be between 0% and 100%";
        } else {
          delete newErrors.makingChargePercent;
        }
        return newErrors;
      }

      // Numeric fields validation
      const numericFields = [
        "ratti",
        "stock",
        "price",
        "weight",
        "carat",
        "jewelryPrice",
        "jewelryMetalWeight",
      ];
      if (numericFields.includes(name)) {
        if (value === "") {
          newErrors[name] = `${name} is required`;
        } else if (Number(value) < 0) {
          newErrors[name] = `${name} cannot be negative`;
        } else {
          delete newErrors[name];
        }
      } else {
        // Text fields validation
        if (!value.trim()) {
          newErrors[name] = `${name} is required`;
        } else {
          delete newErrors[name];
        }
      }
      return newErrors;
    });
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    const existingFiles = formData[type];
    const totalFiles = existingFiles.length + files.length;

    if (totalFiles > 10) {
      alert(`You can only upload a maximum of 5 ${type}.`);
      return;
    }

    const newFiles = [...existingFiles, ...files];
    setFormData((prev) => ({ ...prev, [type]: newFiles }));

    if (type === "images") {
      const newImagePreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newImagePreviews]);
    } else if (type === "videos") {
      const newVideoPreviews = files.map((file) => URL.createObjectURL(file));
      setVideoPreviews((prev) => [...prev, ...newVideoPreviews]);
    }
    e.target.value = null;
    if (type === "images") {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const handleRemoveFile = (index, type) => {
    setFormData((prev) => {
      const newFiles = [...prev[type]];
      newFiles.splice(index, 1);

      if (type === "images") {
        const newImagePreviews = [...imagePreviews];
        URL.revokeObjectURL(newImagePreviews[index]);
        newImagePreviews.splice(index, 1);
        setImagePreviews(newImagePreviews);
      } else if (type === "videos") {
        const newVideoPreviews = [...videoPreviews];
        URL.revokeObjectURL(newVideoPreviews[index]);
        newVideoPreviews.splice(index, 1);
        setVideoPreviews(newVideoPreviews);
      }

      return {
        ...prev,
        [type]: newFiles,
      };
    });
  };

  const handleAddDynamicField = (section, initialData) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], initialData],
    }));
  };

  const handleRemoveDynamicField = (index, section) => {
    const newArr = formData[section].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [section]: newArr }));
  };


  {/*new function to add and delete upsellingproducts*/}
  // Adding New UpSelling Product SKU field
  // const handleAddUpSellingSKU = () =>{
  //   setFormData((prev) => ({
  //     ...prev,
  //     upSellingProducts: [...prev.upSellingProducts, ""],
  //       }));
  // };


  // Updating value here for upsellingProducts
  const handleUpSellingSKUChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.upSellingProducts];
      updated[index]= value;
      return {
        ...prev,
        upSellingProducts : updated,
      };
    });
  };

  {/*--------------------------------------------------------*/}

  const handleSave = async () => {
    const newErrors = {};

    if (!categoryId) newErrors.categoryId = "Please fill the subcategory";
    if (!productSubCategoryId)
      newErrors.productSubCategoryId = "Please fill the Product Category";

    // Validate normal fields
    for (const [key, value] of Object.entries(formData)) {
      if (
        ![
          "sizeSystem",
          "diamondSubstitute",
          "gemstoneWeightTypes",
          "certificateTypes",
          "images",
          "videos",
          "isDiamondSubstitute",
          "isAvailable",
          "isFeatured",
        ].includes(key) &&
        (!value || value.toString().trim() === "")
      ) {
        newErrors[key] = `Please fill the ${key} field`;
      }

      if (
        ["stock", "jewelryMetalWeight", "jewelryPrice"].includes(key) &&
        Number(value) < 0
      ) {
        newErrors[key] = `${key} cannot be negative`;
      }
    }

    // sizeSystem
    formData.sizeSystem.forEach((item, i) => {
      if (!item.sizeType.trim() || !item.sizeNumbers?.toString().trim()) {
        newErrors[`sizeSystem_${i}`] = `Please fill size system at row ${
          i + 1
        }`;
      }
    });

    // diamondSubstitute
    if (formData.isDiamondSubstitute == true) {
      formData.diamondSubstitute.forEach((item, i) => {
        if (!item.name.trim()) {
          newErrors[
            `diamondSubstitute_name_${i}`
          ] = `Please fill Jewelry Diamond Substitute Name at row ${i + 1}`;
        }
        if (!item.price?.toString().trim()) {
          newErrors[
            `diamondSubstitute_price_${i}`
          ] = `Please fill Jewelry Diamond Substitute Price at row ${i + 1}`;
        } else if (Number(item.price) < 0) {
          newErrors[
            `diamondSubstitute_price_${i}`
          ] = `Price cannot be negative at row ${i + 1}`;
        }
      });
    }

    // gemstoneWeightTypes
    formData.gemstoneWeightTypes.forEach((item, i) => {
      if (!item.weight.trim()) {
        newErrors[
          `gemstoneWeightTypes_weight_${i}`
        ] = `Please fill weight at row ${i + 1}`;
      }
      if (!item.price?.toString().trim()) {
        newErrors[
          `gemstoneWeightTypes_price_${i}`
        ] = `Please fill price at row ${i + 1}`;
      } else if (Number(item.price) < 0) {
        newErrors[
          `gemstoneWeightTypes_price_${i}`
        ] = `Price cannot be negative at row ${i + 1}`;
      }
    });

    // certificateTypes
    // Example validation
    formData.certificateTypes.forEach((item, i) => {
      if (!item.type.trim()) {
        newErrors[
          `certificateTypes_type_${i}`
        ] = `Please fill certificate type at row ${i + 1}`;
      }
      if (!item.price?.toString().trim()) {
        newErrors[
          `certificateTypes_price_${i}`
        ] = `Please fill certificate price at row ${i + 1}`;
      } else if (Number(item.price) < 0) {
        newErrors[`certificateTypes_price_${i}`] = `Certificate price at row ${
          i + 1
        } cannot be negative`;
      }
    });

    // images
    if (formData.images.length === 0) {
      newErrors.images = "Please upload at least one image";
    }
    // set errors and stop submission if any
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // validate videos (optional, only if required)
    // if (formData.videos.length === 0) {
    //   return toast.error("Please upload at least one video");
    // }

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "images" && key !== "videos" && typeof value !== "object") {
        data.append(key, value);
      }
    });

    data.append("sizeSystem", JSON.stringify(formData.sizeSystem));
    // data.append("isDiamondSubstitute", JSON.stringify(formData.isDiamondSubstitute));
    data.append(
      "diamondSubstitute",
      JSON.stringify(formData.diamondSubstitute)
    );
    data.append(
      "gemstoneWeightTypes",
      JSON.stringify(formData.gemstoneWeightTypes)
    );
    data.append("certificateTypes", JSON.stringify(formData.certificateTypes));

    //append upSellingProduct
    data.append("upSellingProducts", JSON.stringify(formData.upSellingProducts));

   

    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((file) => {
        data.append("images", file);
      });
    }

    if (formData.videos && formData.videos.length > 0) {
      formData.videos.forEach((file) => {
        data.append("videos", file);
      });

    //
    }
    try {
      await createJewellery({
        productSubCategoryId: productSubCategoryId,
        jewellerySubcategoryId: categoryId,
        jewelleryData: data,
      }).unwrap();

      toast.success("Jewellery added successfully!");
      setFormData({
        sku: "",
        jewelryType: "",
        jewelryName: "",
        // sizeSystem: [{ sizeType: "", sizeNumbers: "" }],
        sizeSystem: sizeSystemData,
        jewelryDesc: "",
        metal: "",
        stock: "",
        jewelryPrice: "",
        jewelryMetalWeight: "",
        makingChargePercent: "10",
        isDiamondSubstitute: false,
        deliveryDays: "",
        diamondSubstitute: [{ name: "", price: "" }],
        gemstoneWeightTypes: [{ weight: "", price: "" }],
        certificateTypes: [{ type: "", price: "" }],
        images: [],
        videos: [],
        isAvailable: true,
        isFeatured: false,
        upSellingProducts: [""],
      });
      setImagePreviews([]);
      setVideoPreviews([]);
    } catch (err) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
    }
  };

  const handleGemstoneClick = () => {
    navigate("/addproduct");
  };

  return (
    // मुख्य कंटेनर में overflow-x-hidden जोड़ा गया है ताकि हॉरिजॉन्टल स्क्रोलिंग को रोका जा सके
    <div className="w-full flex flex-row min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <Navbar
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
        <Navbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col">
        <div className="w-full sticky top-0 z-30">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>

        {/* Add Product Content with Framer Motion */}
        <motion.div
          className="flex-1 p-6 overflow-y-auto"
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          {/* Breadcrumb */}
          <motion.div variants={itemVariants} className="mb-6">
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/")}
            >
              Dashboard
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/products")}
            >
              Products
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-700 text-sm font-medium">
              Add New Product
            </span>
          </motion.div>

          {/* Category Toggle Buttons */}
          <motion.div
            variants={itemVariants}
            className="max-w-6xl mx-auto mb-6"
          >
            <div className="flex gap-4">
              <button
                onClick={handleGemstoneClick}
                className="w-[200px] px-8 py-3 rounded-md font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
              >
                Gemstone
              </button>
              <button className="w-[200px] px-8 py-3 rounded-md font-medium transition-colors bg-[#214436] text-white cursor-pointer">
                Jewellery
              </button>
            </div>
          </motion.div>

          {/* Form Container */}
          <motion.div
            className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-6"
            variants={formVariants}
            initial="initial"
            animate="animate"
          >
            <motion.h2
              variants={itemVariants}
              className="text-xl font-semibold text-[#214436] mb-6"
            >
              Add New Jewellery
            </motion.h2>

            {/* Image Upload Section */}
            <motion.div variants={itemVariants} className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Pick Jewellery images and videos :
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Images */}
                <div
                  className={`border-2 border-dashed rounded-lg p-4 flex flex-wrap gap-2 items-center justify-center min-h-[150px] transition-colors ${
                    imagePreviews.length > 0
                      ? "border-green-400"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {/* Image Thumbnails */}
                  {imagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="relative w-20 h-20 group"
                    >
                      <img
                        src={preview}
                        alt={`preview ${index}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(index, "images");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </button>
                    </motion.div>
                  ))}

                  {/* Add Image Button */}
                  {imagePreviews.length < 5 && (
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center border-2 border-gray-300 cursor-pointer hover:border-[#214436] transition-colors"
                      onClick={() => imagesInputRef.current.click()}
                    >
                      <FaPlus className="text-gray-400" />
                    </div>
                  )}

                  <input
                    type="file"
                    ref={imagesInputRef}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "images")}
                    accept="image/*"
                    multiple
                  />
                </div>

                {/* Upload Videos */}
                <div
                  className={`border-2 border-dashed rounded-lg p-4 flex flex-wrap gap-2 items-center justify-center min-h-[150px] transition-colors ${
                    videoPreviews.length > 0
                      ? "border-green-400"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {/* Video Thumbnails */}
                  {videoPreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="relative w-20 h-20 group"
                    >
                      <video
                        src={preview}
                        className="w-full h-full object-cover rounded"
                      ></video>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(index, "videos");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </button>
                    </motion.div>
                  ))}

                  {/* Add Video Button */}
                  {videoPreviews.length < 5 && (
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center border-2 border-gray-300 cursor-pointer hover:border-[#214436] transition-colors"
                      onClick={() => videosInputRef.current.click()}
                    >
                      <FaPlus className="text-gray-400" />
                    </div>
                  )}

                  <input
                    type="file"
                    ref={videosInputRef}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "videos")}
                    accept="video/*"
                    multiple
                  />
                </div>
              </div>
            </motion.div>
            {errors.images && (
              <p className="text-red-500 text-xs mt-1">{errors.images}</p>
            )}

            {/* Jewellery Details Section */}
            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Jewellery Details :
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Jewellery Type */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jewellery Type :
                  </label>
                  <select
                    name="jewelryType"
                    value={formData.jewelryType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    {[
                      "Ring",
                      "Pendant",
                      "Bracelet",
                      "Brooch",
                      "Necklace",
                      "Earrings",
                    ].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.jewelryType && (
                    <p className="text-red-500 text-xs mt-1">
                      Please fill the Jewellery type
                    </p>
                  )}
                </motion.div>

                {/* Category Type */}
                <div>
                  <label
                    htmlFor="categoryName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subcategory :
                  </label>
                  <select
                    id="categoryName"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    onChange={(e) => {
                      const selectedCategory =
                        jewelrySubcategories?.subcategories.find(
                          (cat) => cat.name === e.target.value
                        );
                      setCategoryId(selectedCategory._id);

                      setErrors((prev) => ({ ...prev, categoryId: "" }));
                    }}
                  >
                    <option>Select a Subcategory</option>
                    {jewelrySubcategories?.subcategories?.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* <div>
                  <label
                    htmlFor="categoryName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gemstone Name :
                  </label>

                  <input
                    type="text"
                    placeholder="Search gemstone..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />

                  <select
                    className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    onChange={(e) => {
                      setProductId(e.target.value);
                    }}
                  >
                    <option value="">Select a gemstone you want to link</option>

                    {productsLoading && <option>Loading...</option>}
                    {productError && <option>Error loading gemstones</option>}

                    {data?.products?.length > 0
                      ? data.products.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))
                      : !productsLoading &&
                        searchTerm && <option>No matches found</option>}
                  </select>
                </div> */}

                {/* Product Subcategory */}
                <div>
                  <label
                    htmlFor="categoryName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Product Subcategory:
                  </label>
                  <select
                    id="categoryName"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    onChange={(e) => {
                      const selectedCategory =
                        prodSubcategories?.subcategories.find(
                          (cat) => cat.name === e.target.value
                        );
                      setProductSubCategoryId(selectedCategory._id);

                      setErrors((prev) => ({
                        ...prev,
                        productSubCategoryId: "",
                      }));
                    }}
                  >
                    <option>Select a Subcategory</option>
                    {prodSubcategories?.subcategories?.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.productSubCategoryId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.productSubCategoryId}
                    </p>
                  )}
                </div>

                {/* Metal */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metal
                  </label>
                  <select
                    name="metal"
                    value={formData.metal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Metal</option>
                    <option value="silver">Silver</option>
                    <option value="panchadhatu">Panchdhatu (Brass)</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                  {errors.metal && (
                    <p className="text-red-500 text-xs mt-1">{errors.metal}</p>
                  )}
                </motion.div>

                {/* Jewellery Name */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jewellery Name :
                  </label>
                  <input
                    type="text"
                    name="jewelryName"
                    value={formData.jewelryName}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.jewelryName && (
                    <p className="text-red-500 text-xs mt-1">
                      Please fill the name
                    </p>
                  )}
                </motion.div>

                {/* SKU */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU :
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Enter SKU"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-xs mt-1">
                      Please fill the SKU
                    </p>
                  )}
                </motion.div>

                {/* Stock */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock :
                  </label>
                  <input
                    type="number"
                    name="stock"
                    onWheel={(e) => e.target.blur()}
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Enter stock count"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                  )}
                </motion.div>

                {/* Jewelry Metal Weight */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jewelry Metal Weight (in grams) :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="jewelryMetalWeight"
                    onWheel={(e) => e.target.blur()}
                    value={formData.jewelryMetalWeight}
                    onChange={handleInputChange}
                    placeholder="Enter Metal Weight (e.g. 4)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.jewelryMetalWeight && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.jewelryMetalWeight}
                    </p>
                  )}
                </motion.div>

                {/* Making Charge Percent */}
                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Making Charge Percent (0% to 100%) :
                    </label>
                    <span className="text-xs text-gray-500 font-medium">
                      Standard: 10%
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      name="makingChargePercent"
                      onWheel={(e) => e.target.blur()}
                      value={formData.makingChargePercent}
                      onChange={handleInputChange}
                      placeholder="Enter 0 to 100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm font-medium">
                      %
                    </span>
                  </div>
                  {errors.makingChargePercent && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.makingChargePercent}
                    </p>
                  )}
                </motion.div>

                {/* jewelry Price */}
                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jewelry Making Price (₹) :
                    </label>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                      Dynamic (+3% GST)
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    name="jewelryPrice"
                    onWheel={(e) => e.target.blur()}
                    value={formData.jewelryPrice}
                    onChange={handleInputChange}
                    placeholder="Auto-calculated price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-semibold text-gray-800"
                  />
                  {errors.jewelryPrice && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.jewelryPrice}
                    </p>
                  )}
                  {formData.metal && (
                    <p className="text-xs text-gray-500 mt-1">
                      Rate: ₹{getRateForMetal(latestRatesData?.latestRate, formData.metal)}/g (
                      {formData.metal})
                    </p>
                  )}
                </motion.div>

                {/* Jewelry Metal Weight */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Period :
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="deliveryDays"
                    onWheel={(e) => e.target.blur()}
                    value={formData.deliveryDays}
                    onChange={handleInputChange}
                    placeholder="Enter Delivery Period in Days"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.deliveryDays && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.deliveryDays}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Jewellery Description */}
              <motion.div variants={itemVariants} className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jewellery Description :
                </label>
                <textarea
                  name="jewelryDesc"
                  value={formData.jewelryDesc}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {errors.jewelryDesc && (
                  <p className="text-red-500 text-xs mt-1">
                    Jewellery Description is required
                  </p>
                )}
              </motion.div>
            </motion.div>

            {/* Dynamic Sections */}
            <motion.div variants={itemVariants} className="mb-8">
              {/* Size System */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Size System :
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddDynamicField("sizeSystem", {
                        sizeType: "",
                        sizeNumbers: "",
                      })
                    }
                    className="p-1 rounded-full text-white bg-[#214436] hover:bg-[#3a6655] transition-colors cursor-pointer"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>

                {formData.sizeSystem.map((system, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex gap-4 mb-2 items-center"
                  >
                    <div className="w-1/2">
                      <input
                        type="text"
                        name="sizeType"
                        value={system.sizeType}
                        onChange={(e) =>
                          handleDynamic(
                            index,
                            "sizeSystem",
                            "sizeType",
                            e.target.value
                          )
                        }
                        placeholder="e.g. US, UK"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors[`sizeSystem_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`sizeSystem_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="w-1/2">
                      <input
                        type="text"
                        name="sizeNumbers"
                        value={system.sizeNumbers}
                        onChange={(e) =>
                          handleDynamic(
                            index,
                            "sizeSystem",
                            "sizeNumbers",
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        placeholder="e.g. 6, 7, 8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors[`sizeSystem_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`sizeSystem_${index}`]}
                        </p>
                      )}
                    </div>

                    {formData.sizeSystem.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveDynamicField(index, "sizeSystem")
                        }
                        className="p-1 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Gemstone Weight Types */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gemstone Weight & Prices :
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddDynamicField("gemstoneWeightTypes", {
                        weight: "",
                        price: "",
                      })
                    }
                    className="p-1 rounded-full text-white bg-[#214436] hover:bg-[#3a6655] transition-colors cursor-pointer"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
                {formData.gemstoneWeightTypes.map((gemstone, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex gap-4 mb-2 items-center"
                  >
                    <div className="w-1/2">
                      <input
                        type="number"
                        name="weight"
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        value={gemstone.weight}
                        onChange={(e) =>
                          handleDynamic(
                            index,
                            "gemstoneWeightTypes",
                            "weight",
                            e.target.value
                          )
                        }
                        placeholder="Enter weight (e.g., 0.5)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      <p className="text-red-500 text-sm">
                        {errors?.[`gemstoneWeightTypes_weight_${index}`]}
                      </p>
                    </div>
                    <div className="w-1/2">
                      <input
                        type="number"
                        name="price"
                        min="0"
                        onWheel={(e) => e.target.blur()}
                        value={gemstone.price}
                        onChange={(e) =>
                          handleDynamic(
                            index,
                            "gemstoneWeightTypes",
                            "price",
                            e.target.value
                          )
                        }
                        placeholder="Enter price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-red-500 text-sm">
                        {errors?.[`gemstoneWeightTypes_price_${index}`]}
                      </p>
                    </div>
                    {formData.gemstoneWeightTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveDynamicField(index, "gemstoneWeightTypes")
                        }
                        className="p-1 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Certificate Types */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Certificate Types & Prices :
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddDynamicField("certificateTypes", {
                        type: "",
                        price: "",
                      })
                    }
                    className="p-1 rounded-full text-white bg-[#214436] hover:bg-[#3a6655] transition-colors cursor-pointer"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
                {formData.certificateTypes.map((certificate, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex gap-4 mb-2 items-center"
                  >
                    <div className="w-1/2">
                      <input
                        type="text"
                        value={certificate.type}
                        onChange={(e) =>
                          handleDynamic(
                            index,
                            "certificateTypes",
                            "type",
                            e.target.value
                          )
                        }
                        placeholder="e.g. GIA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors?.[`certificateTypes_type_${index}`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`certificateTypes_type_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="w-1/2">
                      <input
                        type="number"
                        min="0"
                        onWheel={(e) => e.target.blur()}
                        value={certificate.price}
                        onChange={(e) =>
                          handleDynamic(
                            index,
                            "certificateTypes",
                            "price",
                            e.target.value
                          )
                        }
                        placeholder="Enter price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors?.[`certificateTypes_price_${index}`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`certificateTypes_price_${index}`]}
                        </p>
                      )}
                    </div>

                    {formData.certificateTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveDynamicField(index, "certificateTypes")
                        }
                        className="p-1 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

{/* ########################################################################################################## */}
            {/* UP SELLING PRODUCTS SECTION*/}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
              Up Selling Products SKU :
              </label>

              <button
              type="button"
              onClick = {() => handleAddDynamicField("upSellingProducts","")}
            className="p-1 mr-130 rounded-full text-white bg-[#214436] hover:bg-[#3a6655] transition-colors cursor-pointer"
            >
              <FaPlus size={12}/>
              </button>
            </div>
          </div>

            {/*Input box for each sku*/}
            {formData.upSellingProducts.map((sku, index) => (
              <div key={index} className="flex item-center gap-4 mb-2">
                <div className="w-1/2">
                <input
                type="text"
                value={sku}
                onChange={(e) =>
                  handleUpSellingSKUChange(index, e.target.value)
                }
                placeholder="Dummy_sku"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                </div>
                {formData.upSellingProducts.length > 1 && (
                  <button
                  type="button"
                  onClick={() =>
                    handleRemoveDynamicField(index, "upSellingProducts")
                  }
                  className="w-6 h-6 mr-20 flex items-center justify-center rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
//need change here change there
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
            ))}


{/* ########################################################################################################## */}
            {/* Dynamic Sections */}
            <motion.div variants={itemVariants} className="mb-8">
              {/* Diamond Substitute Check Box */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Diamond Substitute
                    <input
                      type="checkbox"
                      name="isDiamondSubstitute"
                      checked={formData.isDiamondSubstitute}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isDiamondSubstitute: e.target.checked,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Diamond Substitute Name and Price */}
              {formData.isDiamondSubstitute ? (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jewelry Diamond Substitute & Prices :
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddDynamicField("diamondSubstitute", {
                          name: "",
                          price: "",
                        })
                      }
                      className="p-1 rounded-full text-white bg-[#214436] hover:bg-[#3a6655] transition-colors cursor-pointer"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  {formData.diamondSubstitute.map((substitute, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex flex-col gap-1 mb-2"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-1/2">
                          <input
                            type="text"
                            name="name"
                            value={substitute.name}
                            onChange={(e) =>
                              handleDynamic(
                                index,
                                "diamondSubstitute",
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Enter Diamond Substitute Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors?.[`diamondSubstitute_name_${index}`] && (
                            <p className="text-red-500 text-xs">
                              {errors[`diamondSubstitute_name_${index}`]}
                            </p>
                          )}
                        </div>

                        <div className="w-1/2">
                          <input
                            type="number"
                            name="price"
                            min="0"
                            onWheel={(e) => e.target.blur()}
                            value={substitute.price}
                            onChange={(e) =>
                              handleDynamic(
                                index,
                                "diamondSubstitute",
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="Enter price"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors?.[`diamondSubstitute_price_${index}`] && (
                            <p className="text-red-500 text-xs">
                              {errors[`diamondSubstitute_price_${index}`]}
                            </p>
                          )}
                        </div>

                        {formData.diamondSubstitute.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveDynamicField(
                                index,
                                "diamondSubstitute"
                              )
                            }
                            className="p-1 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
                          >
                            <FaTimes size={12} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                ""
              )}

              {/* isAvailable Check Box and isFeatured Check Box */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-1/2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Available
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isAvailable: e.target.checked,
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="w-1/2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Featured
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isFeatured: e.target.checked,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
{/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/}
            {/* Save Button */}
            {jewelleryLoading ? (<motion.div variants={itemVariants} className="flex justify-center">
              <button
                onClick={handleSave}
                className="px-16 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#214436" }}
              >
                Saving...
              </button>
            </motion.div>):(
            <motion.div variants={itemVariants} className="flex justify-center">
              <button
                onClick={handleSave}
                className="px-16 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#214436" }}
              >
                Save
              </button>
            </motion.div> )}


{/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default AddJewellery;

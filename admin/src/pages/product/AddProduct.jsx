import { useState, useRef, useEffect } from "react";
import { FaImage, FaVideo, FaPlus, FaTimes } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useCreateProductMutation,
  useGetSubCategoryQuery,
} from "../../features/api/apiSlice";
import { toast } from "react-toastify";

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};
import countriesData from "../../JSON/countries.json";

function AddProduct() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState("");
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    origin: "",
    carat: "",
    ratti: "",
    price: "",
    certificateTypes: [{ type: "", price: "" }],
    weight: "",
    treatment: "",
    shape: "",
    color: "",
    cut: "",
    stock: "",
    isAvailable: "",
    isFeatured: "",
    description: "",
    sellPrice: "",
    deliveryDays: "",
    images: [],
    videos: [],
    upSellingProductSKU: [""],
  });
  const [errors, setErrors] = useState({});

  const [addProduct, { isLoading: productLoading, error: productError }] =
    useCreateProductMutation();
  const {
    data: subcategories,
    isLoading: subcategoryLoading,
    error: subcategoryError,
  } = useGetSubCategoryQuery();

  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  const imagesInputRef = useRef(null);
  const videosInputRef = useRef(null);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews, videoPreviews]);

  useEffect(() => {
    setCountries(countriesData);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Live validation
    setErrors((prev) => {
      const newErrors = { ...prev };

      // Numeric fields validation
      const numericFields = ["ratti", "stock", "price", "weight", "carat"];
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

  const handleDynamic = (index, masterField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [masterField]: prev[masterField].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      let key = "";

      // consistent keys for certificateTypes
      if (masterField === "certificateTypes") {
        key = field === "type" ? `cert_type_${index}` : `cert_price_${index}`;
      } else {
        key = `${masterField}_${field}_${index}`;
      }

      // Live validation
      if (field === "price") {
        if (value === "" || isNaN(value)) {
          newErrors[key] = "Price is required";
        } else if (Number(value) < 0) {
          newErrors[key] = "Price cannot be negative";
        } else {
          delete newErrors[key];
        }
      } else if (field === "type") {
        if (!value.trim()) {
          newErrors[key] = "Type is required";
        } else {
          delete newErrors[key];
        }
      } else {
        // For other fields
        if (value.trim() !== "") delete newErrors[key];
      }

      return newErrors;
    });
  };




  const handleAddDynamicField = (section,initialData) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], initialData],
    }));


  };
  const handleRemoveDynamicField = (index, section) => {
    setFormData((prev) => {
      const newArr = prev[section].filter((_, i) => i !== index);
      return { ...prev, [section]: newArr };
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(prev).forEach((key) => {
        if (key.startsWith(`${section}_`) && key.endsWith(`_${index}`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Adding New UpSelling Product SKU field
  const handleAddUpSellingSKU = () =>{
    setFormData((prev) => ({
      ...prev,
      upSellingProductSKU: [...prev.upSellingProductSKU, ""],
        }));
  };


  // Updating value here for upSellingProductSKU
  const handleUpSellingSKUChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.upSellingProductSKU];
      updated[index]= value;
      return {
        ...prev,
        upSellingProductSKU : updated,
      };
    });
  };


  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    const existingFiles = formData[type];

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
    setErrors((prev) => ({ ...prev, images: "" }));
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

  const handleSave = async () => {
    const newErrors = {};
    if (!subCategoryId) {
      newErrors.subCategoryId = "Please select a subcategory";
    }

    // validate simple fields
    for (const [key, value] of Object.entries(formData)) {
      if (
        key !== "certificateTypes" &&
        key !== "sellPrice" &&
        key !== "images" &&
        key !== "videos" &&
        (!value || value.toString().trim() === "")
      ) {
        newErrors[key] = `Please fill the ${key} field`;
      }
    }

    // validate stock and price positivity
    if (isNaN(formData.stock) || Number(formData.stock) <= 0) {
      newErrors.stock = "Stock must be a positive number";
    }

    if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    // validate certificateTypes array
    formData.certificateTypes.forEach((cert, index) => {
      if (!cert.type.trim())
        newErrors[`cert_type_${index}`] = "Type is required";
      if (!cert.price?.toString().trim())
        newErrors[`cert_price_${index}`] = "Price is required";
      if (cert.price && (isNaN(cert.price) || Number(cert.price) < 0))
        newErrors[`cert_price_${index}`] = "Price must be positive";
    });

    // validate images
    if (formData.images.length === 0) {
      newErrors.images = "Please upload at least one image";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // stop saving
    }

    // validate videos (optional, only if required)
    // if (formData.videos.length === 0) {
    //   return toast.error("Please upload at least one video");
    // }

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("sku", formData.sku);
      data.append("origin", formData.origin);
      data.append("carat", formData.carat);
      data.append("ratti", formData.ratti);
      data.append("price", formData.price);
      data.append("sellPrice", formData.sellPrice);
      data.append(
        "certificateTypes",
        JSON.stringify(formData.certificateTypes)
      );

      data.append("weight", formData.weight);
      data.append("treatment", formData.treatment);
      data.append("shape", formData.shape);
      data.append("color", formData.color);
      data.append("cut", formData.cut);
      data.append("stock", formData.stock);
      data.append("isAvailable", formData.isAvailable);
      data.append("isFeatured", formData.isFeatured);
      data.append("description", formData.description);
      data.append("subCateogory", subCategoryId);
      data.append("deliveryDays", formData.deliveryDays);
      data.append("upSellingProductSKU", JSON.stringify(formData.upSellingProductSKU));


      // Append images (assuming array of File objects)
      formData.images.forEach((img, index) => {
        data.append("images", img);
      });

      // Append videos (assuming array of File objects)
      formData.videos.forEach((vid, index) => {
        data.append("videos", vid);
      });

      const res = await addProduct({ subCategoryId, data }).unwrap();

      toast.success("Product Added successfully");

      setFormData({
        name: "",
        sku: "",
        origin: "",
        carat: "",
        ratti: "",
        price: "",
        certificateTypes: [{ type: "", price: "" }],
        weight: "",
        treatment: "",
        shape: "",
        color: "",
        cut: "",
        stock: "",
        isAvailable: "",
        isFeatured: "",
        description: "",
        sellPrice: "",
        deliveryDays: "",
        images: [],
        videos: [],
        upSellingProductSKU: [""],
      });
      setImagePreviews([]);
      setVideoPreviews([]);
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
    }
  };



  const handleJewelleryClick = () => {
    navigate("/add-jewellery");
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const mainContentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  const formContainerVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, delay: 0.4 },
    },
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-50">
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={closeSidebar}
        ></motion.div>
      )}

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 w-[230px] bg-white border-r border-gray-200 lg:hidden"
      >
        <Navbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col"
        variants={mainContentVariants}
        initial="initial"
        animate="animate"
      >
        <div className="w-full sticky top-0 z-30">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>

        {/* Add Product Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
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
          </div>

          {/* Category Toggle Buttons - Outside the container */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-[200px] px-8 py-3 rounded-md font-medium transition-colors bg-[#214436] text-white cursor-pointer"
              >
                Gemstone
              </motion.button>
              <motion.button
                onClick={handleJewelleryClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-[200px] px-8 py-3 rounded-md font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
              >
                Jewellery
              </motion.button>
            </div>
          </div>

          {/* Form Container */}
          <motion.div
            className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-6"
            variants={formContainerVariants}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-xl font-semibold text-[#214436] mb-6">
              Add New Gemstone
            </h2>

            {/* Image Upload Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Pick Gemstone images and videos :
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
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative w-20 h-20 group"
                    >
                      <img
                        src={preview}
                        alt={`preview ${index}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(index, "images");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </motion.button>
                    </motion.div>
                  ))}

                  {/* Add Image Button */}
                  {formData.images.length < 5 && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-20 h-20 rounded-lg flex items-center justify-center border-2 border-gray-300 cursor-pointer hover:border-[#214436] transition-colors"
                      onClick={() => imagesInputRef.current.click()}
                    >
                      <FaPlus className="text-gray-400" />
                    </motion.div>
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
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative w-20 h-20 group"
                    >
                      <video
                        src={preview}
                        className="w-full h-full object-cover rounded"
                      ></video>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(index, "videos");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </motion.button>
                    </motion.div>
                  ))}

                  {/* Add Video Button */}
                  {formData.videos.length < 5 && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-20 h-20 rounded-lg flex items-center justify-center border-2 border-gray-300 cursor-pointer hover:border-[#214436] transition-colors"
                      onClick={() => videosInputRef.current.click()}
                    >
                      <FaPlus className="text-gray-400" />
                    </motion.div>
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
              {errors.images && (
                <p className="text-red-500 text-xs mt-1">{errors.images}</p>
              )}
            </div>

            {/* Gemstone Details Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Gemstone Details :
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="subCategoryName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subcategory Name :
                  </label>
                  <select
                    id="subCategoryName"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    onChange={(e) => {
                      const selectedSubCat = subcategories?.subcategories?.find(
                        (subcat) => subcat.name === e.target.value
                      );
                      setSubCategoryId(selectedSubCat._id);

                      setErrors((prev) => {
                        const newErr = { ...prev };
                        delete newErr.subCategoryId;
                        return newErr;
                      });
                    }}
                  >
                    <option value="" disabled selected>
                      -- Select Subcategory --
                    </option>
                    {subcategories?.subcategories?.map((subcat) => (
                      <option key={subcat._id} value={subcat.name}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                  {errors.subCategoryId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.subCategoryId}
                    </p>
                  )}
                </div>
                {/* Gemstone Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Gemstone Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="sku"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Gemstone SKU :
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                  )}
                </div>

                {/* Origin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin :
                  </label>
                  <select
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select origin</option>
                    {countries.map((c, i) => (
                      <option key={i} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.origin && (
                    <p className="text-red-500 text-xs mt-1">{errors.origin}</p>
                  )}
                </div>

                {/* Carat */}
                <div>
                  <label
                    htmlFor="carat"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Carat :
                  </label>
                  <input
                    type="number"
                    id="carat"
                    name="carat"
                    onWheel={(e) => e.target.blur()}
                    value={formData.carat}
                    onChange={handleInputChange}
                    placeholder="Enter carat"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.carat && (
                    <p className="text-red-500 text-xs mt-1">{errors.carat}</p>
                  )}
                </div>

                {/* Ratti */}
                <div>
                  <label
                    htmlFor="ratti"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ratti :
                  </label>
                  <input
                    type="number"
                    id="ratti"
                    name="ratti"
                    onWheel={(e) => e.target.blur()}
                    value={formData.ratti}
                    onChange={handleInputChange}
                    placeholder="Enter ratti"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.ratti && (
                    <p className="text-red-500 text-xs mt-1">{errors.ratti}</p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Weight :
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    onWheel={(e) => e.target.blur()}
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Enter weight"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price :
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    onWheel={(e) => e.target.blur()}
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="sellPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price Before Discount :
                  </label>
                  <input
                    type="number"
                    name="sellPrice"
                    id="sellPrice"
                    onWheel={(e) => e.target.blur()}
                    value={formData.sellPrice}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                      <input
                        type="text"
                        name="type"
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
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors[`cert_type_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`cert_type_${index}`]}
                        </p>
                      )}
                      <input
                        type="number"
                        name="price"
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
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors[`cert_price_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`cert_price_${index}`]}
                        </p>
                      )}
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

                {/* Treatment */}
                <div>
                  <label
                    htmlFor="treatment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Treatment :
                  </label>
                  <input
                    type="text"
                    name="treatment"
                    id="treatment"
                    value={formData.treatment}
                    onChange={handleInputChange}
                    placeholder="Enter treatment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.treatment && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.treatment}
                    </p>
                  )}
                </div>

                {/* Shape */}
                <div>
                  <label
                    htmlFor="shape"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Shape :
                  </label>
                  <input
                    type="text"
                    name="shape"
                    id="shape"
                    value={formData.shape}
                    onChange={handleInputChange}
                    placeholder="Enter shape"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.shape && (
                    <p className="text-red-500 text-xs mt-1">{errors.shape}</p>
                  )}
                </div>

                {/* Color */}
                <div>
                  <label
                    htmlFor="color"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Color :
                  </label>
                  <input
                    type="text"
                    name="color"
                    id="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Enter color"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.color && (
                    <p className="text-red-500 text-xs mt-1">{errors.color}</p>
                  )}
                </div>

                {/* Cut */}
                <div>
                  <label
                    htmlFor="cut"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Cut :
                  </label>
                  <input
                    type="text"
                    name="cut"
                    id="cut"
                    value={formData.cut}
                    onChange={handleInputChange}
                    placeholder="Enter cut"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.cut && (
                    <p className="text-red-500 text-xs mt-1">{errors.cut}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Stock :
                  </label>
                  <input
                    type="number"
                    name="stock"
                    id="stock"
                    onWheel={(e) => e.target.blur()}
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Enter stock"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                  )}
                </div>

                {/* Is Available */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is Available :
                  </label>
                  <select
                    name="isAvailable"
                    value={formData.isAvailable}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Choose</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                  {errors.isAvailable && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.isAvailable}
                    </p>
                  )}
                </div>

                {/* Is Featured */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is Featured :
                  </label>
                  <select
                    name="isFeatured"
                    value={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Choose</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                  {errors.isFeatured && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.isFeatured}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="deliveryDays"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Delivery Period :
                  </label>
                  <input
                    type="number"
                    name="deliveryDays"
                    id="deliveryDays"
                    onWheel={(e) => e.target.blur()}
                    value={formData.deliveryDays}
                    onChange={handleInputChange}
                    placeholder="Enter Delivery period in days"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.deliveryDays && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.deliveryDays}
                    </p>
                  )}
                </div>
              </div>
{/* ######################################################################## */}

              {/* Up Selling Products SKU */}
                <div className="mb-6">
                  <div className=" flex  mb-2  mt-3 ">
                    <label className="block text-sm font-medium text-gray-700 mr-70">
                      Up Selling Products SKU :
                    </label>
                    <button
                      type="button"
                      onClick={handleAddUpSellingSKU} // it take no args
                      className="p-1 ml-22 rounded-full text-white bg-[#214436] hover:bg-[#3a6655] transition-colors cursor-pointer"
                    >
                      <FaPlus size={12} />
                    </button>

                  </div>
                  {formData.upSellingProductSKU.map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex gap-4 mb-2 items-center"
                    >
                      <input
                        type="text"
                        name="sku"
                        value={item}
                        onChange={(e) =>
                          handleUpSellingSKUChange(
                            index,
                            e.target.value
                          )
                        }
                        placeholder="EXm12324"
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors[`cert_type_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`cert_type_${index}`]}
                        </p>
                      )}

                      {errors[`cert_price_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`cert_price_${index}`]}
                        </p>
                      )}
                      {formData.upSellingProductSKU.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveDynamicField(index, "upSellingProductSKU")
                          }
                          className="p-1 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
{/* ######################################################################## */}

              {/* Gemstone Description - moved to last */}
              <div className="mt-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gemstone Description :
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Save Button */}
            {productLoading ? (<div className="flex justify-center">
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#214436" }}
              >
                Saving...
              </motion.button>
            </div>) : (
            <div className="flex justify-center">
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#214436" }}
              >
                Save
              </motion.button>
            </div>)}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default AddProduct;

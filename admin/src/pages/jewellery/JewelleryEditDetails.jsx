import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import Stone1 from "../../assets/Stone1.svg";
import {
  useDeleteSingleJewelleryImageMutation,
  useDeleteSingleJewelleryVideoMutation,
  useEditJewelleryMutation,
  useEditSingleJewelleryImageMutation,
  useEditSingleJewelleryVideoMutation,
  useEditSingleProductMutation,
  useGetJewellerySubCategoryQuery,
  useGetProductsQuery,
  useGetSingleJewelleryQuery,
  useGetSingleProductQuery,
  useGetSubCategoryQuery,
  useLazySearchProductsQuery,
  useGetLatestMetalRateQuery,
} from "../../features/api/apiSlice";
import { FaCamera, FaVideo } from "react-icons/fa";
import { toast } from "react-toastify";
import ProductDetailsSkeleton from "../../skeletons/ProductDetailsSkeleton";

// Custom Components
const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`rounded-lg bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
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
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    green: "text-white hover:opacity-90 focus:ring-green-500",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
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

const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  );
};

const Textarea = ({ className = "", ...props }) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${className}`}
      {...props}
    />
  );
};

function JewelleryEditDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productId, setProductId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedProductSubCategoryId, setSelectedProductSubCategoryId] =
    useState("");
  const [errors, setErrors] = useState({});

  const {
    data,
    isLoading: productLoading,
    error: productError,
  } = useGetSingleJewelleryQuery(slug);

  const [
    editProduct,
    { isLoading: editProductLoading, error: editProductError },
  ] = useEditJewelleryMutation();

  const [
    triggerSearch,
    { data: productIds, isLoading: productIdLoading, error },
  ] = useLazySearchProductsQuery();

  const {
    data: jewellerySubCategories,
    isLoading: subcategoryLoading,
    error: subcategory,
  } = useGetJewellerySubCategoryQuery();

  const { data: prodSubcategories } = useGetSubCategoryQuery();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    triggerSearch(value);
  };

  const [editImage, { isLoading: editImageLoading, error: editImageError }] =
    useEditSingleJewelleryImageMutation();

  const [
    deleteImage,
    { isLoading: deleteImageLoading, error: deleteImageError },
  ] = useDeleteSingleJewelleryImageMutation();

  const [editVideo, { isLoading: editVideoLoading, error: editVideoError }] =
    useEditSingleJewelleryVideoMutation();

  const [
    deleteVideo,
    { isLoading: deleteVideoLoading, error: deleteVideoError },
  ] = useDeleteSingleJewelleryVideoMutation();

  const product = data?.jewelry;

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

  const [formData, setFormData] = useState({
    jewelryName: "",
    sku: "",
    slug: "",
    jewelryDesc: "",
    jewelryType: "",
    metal: "",
    jewelryPrice: 0,
    jewelryMetalWeight: 0,
    makingChargePercent: 10,
    price: 0,
    stock: 0,
    sellPrice: "",
    isAvailable: false,
    isFeatured: false,
    certificate: [],
    gemstoneWeight: [],
    quality: [],
    isDiamondSubstitute: false,
    diamondSubstitute: [],
    sizeSystem: [],
    deliveryDays: "",
    weight: "",
    upSellingProductsku : [""], //added by tejas
  });

  const addField = (field) => {
    let newItem = {};

    switch (field) {
      case "certificate":
        newItem = { certificateType: "", price: 0 };
        break;
      case "gemstoneWeight":
        newItem = { weight: "", price: 0 };
        break;
      case "quality":
        newItem = { qualityType: "", price: 0 };
        break;
      case "sizeSystem":
        newItem = { sizeType: "", sizeNumbers: [] };
        break;
      default:
        newItem = {};
    }

    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], newItem],
    }));
  };

  const removeField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (product) {
      setFormData({
        jewelryName: product.jewelryName || "",
        sku: product.sku || "",
        slug: product.slug || "",
        jewelryDesc: product.jewelryDesc || "",
        jewelryType: product.jewelryType || "",
        metal: product.metal || "",
        jewelryPrice: product.jewelryPrice || 0,
        stock: product.stock || 0,
        isAvailable: product.isAvailable ?? false,
        isFeatured: product.isFeatured ?? false,
        deliveryDays: product.deliveryDays || "",
        certificate: product.certificate ? [...product.certificate] : [],
        gemstoneWeight: product.gemstoneWeight
          ? [...product.gemstoneWeight]
          : [],
        isDiamondSubstitute: product.isDiamondSubstitute ?? false,
        diamondSubstitute: product.diamondSubstitute
          ? [...product.diamondSubstitute]
          : [],
        sizeSystem: product.sizeSystem ? [...product.sizeSystem] : [],
        jewelryMetalWeight: product.jewelryMetalWeight || 0,
        makingChargePercent: product.makingChargePercent || 10,
        upSellingProductsku: product.upSellingProductsku?.length ? [...product.upSellingProductsku] : [""], // added by tejas
      });
    }
  }, [product]);

  useEffect(() => {
    if (product?.subCategory?._id) {
      setSelectedSubCategoryId(product.subCategory._id);
    }
    if (product?.productId?.name) {
      setProductId(product.productId._id);
    }
    if (product?.productSubCategory?._id) {
      setSelectedProductSubCategoryId(product.productSubCategory._id);
    }
  }, [product]);


    const handleRemoveVideo = (i) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleRemoveImage = (i) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!selectedProductSubCategoryId) {
      newErrors.productSubCategory = "Please select a product subcategory";
    }
    if (!selectedSubCategoryId) {
      newErrors.subCategory = "Please select a subcategory";
    }

    if (
      formData.makingChargePercent !== undefined &&
      formData.makingChargePercent !== "" &&
      (Number(formData.makingChargePercent) < 0 ||
        Number(formData.makingChargePercent) > 100)
    ) {
      newErrors.makingChargePercent =
        "Making charge percent must be between 0% and 100%";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return; // Stop if error exists

    try {
      const data = new FormData();
      data.append("jewelryName", formData.jewelryName);
      data.append("sku", formData.sku);
      data.append("slug", formData.slug);
      data.append("jewelryDesc", formData.jewelryDesc);
      data.append("jewelryType", formData.jewelryType);
      data.append("metal", formData.metal);
      data.append("jewelryPrice", formData.jewelryPrice.toString());
      data.append("jewelryMetalWeight", (formData.jewelryMetalWeight || 0).toString());
      data.append(
        "makingChargePercent",
        (formData.makingChargePercent || 10).toString()
      );
      data.append("stock", formData.stock.toString());
      data.append("isAvailable", formData.isAvailable.toString());
      data.append("isFeatured", formData.isFeatured.toString());
      data.append("deliveryDays", formData.deliveryDays);

      data.append("certificate", JSON.stringify(formData.certificate));
      data.append("gemstoneWeight", JSON.stringify(formData.gemstoneWeight));
      data.append("quality", JSON.stringify(formData.quality));
      data.append(
        "isDiamondSubstitute",
        formData.isDiamondSubstitute.toString()
      );
      data.append(
        "diamondSubstitute",
        JSON.stringify(formData.diamondSubstitute)
      );
      data.append("sizeSystem", JSON.stringify(formData.sizeSystem));
      data.append("subCategory", selectedSubCategoryId);
      data.append("productSubCategory", selectedProductSubCategoryId);
      data.append('upSellingProductsku',JSON.stringify(formData.upSellingProductsku));

      uploadedImages
        .filter((item) => item.file.type.startsWith("image/"))
        .forEach((img) => {
          data.append("images", img.file);
        });

      // Append videos
      uploadedImages
        .filter((item) => item.file.type.startsWith("video/"))
        .forEach((video) => {
          data.append("videos", video.file);
        });

      // Call API mutation
      const res = await editProduct({ formData: data, jewelryId: product._id })
        .unwrap()
        .then((res) => {
          navigate(`/jewellery-details/${res.newSlug}`, { replace: true });
        });

      toast.success("Product Edited Successfully");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
    }
  };

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(rate > 0 &&
      wt > 0 &&
      ["metal", "jewelryMetalWeight", "makingChargePercent"].includes(name)
        ? { jewelryPrice: autoPrice }
        : {}),
    }));

    if (name === "makingChargePercent") {
      const num = Number(value);
      if (value !== "" && (num < 0 || num > 100)) {
        setErrors((prev) => ({
          ...prev,
          makingChargePercent: "Making charge % must be between 0% and 100%",
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.makingChargePercent;
          return next;
        });
      }
    }
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      files.forEach((file) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          const newImage = {
            file,
            src: event.target.result,
            type: file.type.startsWith("image/") ? "image" : "video",
          };
          setUploadedImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleEditImage = async (image, index) => {
    // create file input dynamically
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("images", file);

      try {
        await editImage({
          jewelryId: product._id,
          imageId: index,
          file: formData,
        }).unwrap();

        toast.success("Image updated successfully");
      } catch (error) {
        toast.error(
          error?.data?.msg ||
            error?.data?.message ||
            error?.error ||
            "Something went wrong"
        );
      }
    };

    input.click(); // open file picker
  };

  const handleDeleteImage = async (id) => {
    try {
      await deleteImage({
        jewelryId: product._id,
        imageId: id,
      }).unwrap();

      toast.success("Image Deleted Successfully");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
    }
  };

  const handleEditVideo = (vid, index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();

      formData.append("videos", file);

      try {
        await editVideo({
          jewelryId: product._id,
          videoId: index,
          file: formData,
        }).unwrap();

        toast.success("Video edited successfully");
      } catch (error) {
        toast.error(
          error?.data?.msg ||
            error?.data?.message ||
            error?.error ||
            "Something went wrong"
        );
      }
    };
    input.click();
  };

  const handleDeleteVideo = async (id) => {
    try {
      await deleteVideo({
        jewelryId: product._id,
        videoId: id,
      }).unwrap();

      toast.success("Video Deleted successfully");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
    }
  };


  {/*####################################*/}

  //here i will add code for UpSellingProducts

  const addUpSellSku = () =>{
    setFormData((prev) => {
      console.log("adding sku row");
      return {
        ...prev,
      upSellingProductsku : [...prev.upSellingProductsku, ""],
      };
    });
  };

  // to update
  const updateUpSellSku = (index,value) => {
    setFormData((prev) => {
      const arr = [...prev.upSellingProductsku];
      arr[index]= value;
      return {...prev, upSellingProductsku: arr};
    });
  };

  // to delete UpSellingProducts
  const removeUpSellingSku = (index) => {
    setFormData((prev) => ({
      ...prev,
      upSellingProductsku : prev.upSellingProductsku.filter((_,i) => i !== index),

    }));
  };
{/**********************************************************************************************************/}


  if (!product) return <p>No Product found</p>;

  if (productLoading || subcategoryLoading) return <ProductDetailsSkeleton />;

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

        {/* Edit Details Content */}
        <div className="flex-1 p-3 sm:p-6 pt-6 sm:pt-8 overflow-y-auto">
          {/* Edit Details Card - Increased width */}
          <Card className="bg-white max-w-6xl mx-auto">
            <CardContent>
              <div className="space-y-6">
                {/* Header */}
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 mt-2 sm:mt-4">
                  Edit Details
                </h1>

                {/* Image Upload Section - Horizontal Scroll on Mobile */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-3 sm:gap-4 min-w-max">
                      {product?.images.map((image, index) => (
                        <div key={image.id} className="relative flex-shrink-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {/* Edit & Delete buttons */}
                          <div className="flex gap-2 mt-1 text-xs">
                            <button
                              onClick={() => handleEditImage(image, image._id)}
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteImage(image._id)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      <br />
                      <br />

                      {product?.videos.map((vid, index) => (
                        <div key={vid.id} className="relative flex-shrink-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                            <video
                              src={vid.url || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {/* Edit & Delete buttons */}
                          <div className="flex gap-2 mt-1 text-xs">
                            <button
                              onClick={() => handleEditVideo(vid, vid._id)}
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(vid._id)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}

                      {uploadedImages
                        ?.filter((file) => file.type === "image")
                        .map((image, index) => (
                          <div
                            key={image.id}
                            className="relative flex-shrink-0"
                          >
                                <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow hover:bg-red-600"
                            >
                              ✕
                            </button>
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                              <img
                                src={image.src || "/placeholder.svg"}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        ))}

                      {/* Add New Image Button */}
                      <div className="relative flex-shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded-full flex items-center justify-center">
                            <FaCamera className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                          </div>
                        </div>
                      </div>

                      {uploadedImages
                        ?.filter((file) => file.type === "video")
                        .map((vid, index) => (
                          <div key={index} className="relative flex-shrink-0">
                              <button
                              onClick={() => handleRemoveVideo(index)}
                              className="absolute -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow hover:bg-red-600"
                            >
                              ✕
                            </button>
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                              <video
                                src={vid.src || "/placeholder.svg"}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-contain"
                              ></video>
                            </div>
                          </div>
                        ))}

                      <div className="relative flex-shrink-0">
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded-full flex items-center justify-center">
                            <FaVideo className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Product Details :
                  </h3>

                  {/* First Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                      </label>
                      <Input
                        name="jewelryName"
                        value={formData.jewelryName}
                        onChange={handleInputChange}
                        placeholder="Blue Sapphire (Premium Stone)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Gemstone Subcategory:
                      </label>
                      <select
                        id="subcategory"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={selectedProductSubCategoryId}
                        onChange={(e) => {
                          setSelectedProductSubCategoryId(e.target.value);
                          // remove error on change
                          setErrors((prev) => ({
                            ...prev,
                            productSubCategory: "",
                          }));
                        }}
                      >
                        <option value="">-- Select Subcategory --</option>
                        {prodSubcategories?.subcategories?.map((subcat) => (
                          <option key={subcat._id} value={subcat._id}>
                            {subcat.name}
                          </option>
                        ))}
                      </select>
                      {errors.productSubCategory && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.productSubCategory}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SKU & Slug (URL) Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product SKU
                      </label>
                      <Input
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="e.g. JWL-101"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Slug (URL)
                      </label>
                      <Input
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="e.g. 18k-gold-diamond-ring-jwl-101"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-md border border-gray-200">
                    <span className="font-semibold text-[#077B8A]">Live Canonical URL:</span> https://gemrishi.com/products/
                    <span className="text-emerald-700 font-mono font-medium">
                      {(formData.jewelryName || "jewelry-name").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                    </span>/
                    <span className="text-blue-700 font-mono font-medium">
                      {(formData.sku || "sku").toLowerCase().replace(/[^a-z0-9-]+/g, "-")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Subcategory:
                      </label>
                      <select
                        id="subcategory"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={selectedSubCategoryId}
                        onChange={(e) => {
                          setSelectedSubCategoryId(e.target.value);
                          // remove error on change
                          setErrors((prev) => ({ ...prev, subCategory: "" }));
                        }}
                      >
                        <option value="">-- Select Subcategory --</option>
                        {jewellerySubCategories?.subcategories?.map(
                          (subcat) => (
                            <option key={subcat._id} value={subcat._id}>
                              {subcat.name}
                            </option>
                          )
                        )}
                      </select>
                      {errors.subCategory && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.subCategory}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Metal
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
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jewelry Metal Weight (grams)
                      </label>
                      <Input
                        name="jewelryMetalWeight"
                        type="Number"
                        step="0.01"
                        value={formData.jewelryMetalWeight}
                        onChange={handleInputChange}
                        placeholder="e.g. 4"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Making Charge % (0 - 100%)
                        </label>
                      </div>
                      <div className="relative">
                        <Input
                          name="makingChargePercent"
                          type="Number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.makingChargePercent}
                          onChange={handleInputChange}
                          placeholder="e.g. 10"
                          className="pr-8"
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
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Jewelry Making Price (₹)
                        </label>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                          Dynamic (+3% GST)
                        </span>
                      </div>
                      <Input
                        name="jewelryPrice"
                        type="Number"
                        value={formData.jewelryPrice}
                        onChange={handleInputChange}
                        placeholder="Auto-calculated price"
                        className="bg-gray-50 font-semibold text-gray-800"
                      />
                      {formData.metal && (
                        <p className="text-xs text-gray-500 mt-1">
                          Rate: ₹{getRateForMetal(latestRatesData?.latestRate, formData.metal)}/g (
                          {formData.metal})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Third Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        name="jewelryType"
                        value={formData.jewelryType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select type</option>
                        <option value="Ring">Ring</option>
                        <option value="Pendant">Pendant</option>
                        <option value="Bracelet">Bracelet</option>
                        <option value="Brooch">Brooch</option>
                        <option value="Necklace">Necklace</option>
                        <option value="Earrings">Earrings</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock
                      </label>
                      <Input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Seventh Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
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
                        Available
                      </label>
                      <label className="flex items-center gap-2">
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
                        Featured
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Days
                      </label>
                      <Input
                        type="number"
                        name="deliveryDays"
                        value={formData.deliveryDays}
                        onChange={handleInputChange}
                        placeholder="e.g. 4"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description
                    </label>
                    <Textarea
                      name="jewelryDesc"
                      value={formData.jewelryDesc}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Enter product description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificates
                    </label>
                    {formData.certificate.map((cert, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          name={`certType-${index}`}
                          value={cert.certificateType}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const updated = prev.certificate.map((cert, i) =>
                                i === index
                                  ? { ...cert, certificateType: e.target.value } // ✅ new object
                                  : cert
                              );
                              return { ...prev, certificate: updated };
                            });
                          }}
                          placeholder="Certificate Type"
                        />
                        <Input
                          type="number"
                          name={`certPrice-${index}`}
                          value={cert.price}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const updated = prev.certificate.map((cert, i) =>
                                i === index
                                  ? { ...cert, price: Number(e.target.value) }
                                  : cert
                              );
                              return { ...prev, certificate: updated };
                            });
                          }}
                          placeholder="Price"
                        />
                        <Button
                          onClick={() => removeField("certificate", index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => addField("certificate")}>Add</Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gemstone Weight & Price
                    </label>
                    {formData.gemstoneWeight.map((gemstone, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          name={`certType-${index}`}
                          value={gemstone.weight}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const updated = prev.gemstoneWeight.map(
                                (gemstone, i) =>
                                  i === index
                                    ? { ...gemstone, weight: e.target.value } // ✅ new object
                                    : gemstone
                              );
                              return { ...prev, gemstoneWeight: updated };
                            });
                          }}
                          placeholder="Weight Type"
                        />
                        <Input
                          type="number"
                          name={`certPrice-${index}`}
                          value={gemstone.price}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const updated = prev.gemstoneWeight.map(
                                (gemstone, i) =>
                                  i === index
                                    ? {
                                        ...gemstone,
                                        price: Number(e.target.value),
                                      }
                                    : gemstone
                              );
                              return { ...prev, gemstoneWeight: updated };
                            });
                          }}
                          placeholder="Price"
                        />
                        <Button
                          onClick={() => removeField("gemstoneWeight", index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => addField("gemstoneWeight")}>
                      Add
                    </Button>
                  </div>

                  {/* Diamond Substitute */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jewelry Diamond Substitute & Price
                    </label>
                    {formData.diamondSubstitute.map((substitute, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          name={`certType-${index}`}
                          value={substitute.name}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const updated = prev.diamondSubstitute.map(
                                (substitute, i) =>
                                  i === index
                                    ? { ...substitute, name: e.target.value } // ✅ new object
                                    : substitute
                              );
                              return { ...prev, diamondSubstitute: updated };
                            });
                          }}
                          placeholder="Diamond Substitute Name"
                        />
                        <Input
                          type="number"
                          name={`certPrice-${index}`}
                          value={substitute.price}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const updated = prev.diamondSubstitute.map(
                                (substitute, i) =>
                                  i === index
                                    ? {
                                        ...substitute,
                                        price: Number(e.target.value),
                                      }
                                    : substitute
                              );
                              return { ...prev, diamondSubstitute: updated };
                            });
                          }}
                          placeholder="Price"
                        />
                        <Button
                          onClick={() =>
                            removeField("diamondSubstitute", index)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => addField("diamondSubstitute")}>
                      Add
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jewelry Size System
                    </label>
                    {formData.sizeSystem.map((size, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          name={`certType-${index}`}
                          value={size.sizeType}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const updated = prev.sizeSystem.map((size, i) =>
                                i === index
                                  ? { ...size, sizeType: e.target.value } // ✅ new object
                                  : size
                              );
                              return { ...prev, sizeSystem: updated };
                            });
                          }}
                          placeholder="Size System Type"
                        />
                        <Input
                          type="text"
                          name={`certPrice-${index}`}
                          value={size.sizeNumbers}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const updated = prev.sizeSystem.map((size, i) =>
                                i === index
                                  ? {
                                      ...size,
                                      sizeNumbers: e.target.value
                                        .split(",")
                                        .map((val) => val.trim()),
                                    }
                                  : size
                              );
                              return { ...prev, sizeSystem: updated };
                            });
                          }}
                          placeholder="Price"
                        />
                        <Button
                          onClick={() => removeField("sizeSystem", index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => addField("sizeSystem")}>Add</Button>
                  </div>

{/*3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333*/}

                 <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Up Selling Products:
  </label>

  {formData?.upSellingProductsku?.map((sku, index) => (
    <div key={index} className="flex gap-2 mb-2 items-center">
      {/* Single text input for SKU */}
      <Input
        value={sku}
        onChange={(e) => updateUpSellSku(index, e.target.value)}
        placeholder="Enter SKU (e.g. DUMMY_SKU_1)"
      />

      {/* Remove button, only if more than 1 row */}
      {formData.upSellingProductsku.length > 1 && (
        <Button
          type="button"
          variant="destructive"
          onClick={() => removeUpSellingSku(index)}
        >
          Remove
        </Button>
      )}
    </div>
  ))}

  {/* Add new SKU row */}
  <Button
    type="button"
    onClick={addUpSellSku}
    className="mt-2"
  >
    Add SKU
  </Button>
</div>


{/*3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333*/}

                  {/* Save Button */}
                  <div className="flex justify-center pt-4 sm:pt-6">
                    <Button
                      onClick={handleSave}
                      className="w-full sm:w-auto px-8 sm:px-12 py-3 text-white"
                      style={{ backgroundColor: "#214436" }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default JewelleryEditDetails;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import {
  useDeleteSingleProductImageMutation,
  useDeleteSingleProductVideoMutation,
  useEditSingleProductImageMutation,
  useEditSingleProductMutation,
  useEditSingleProductVideoMutation,
  useGetSingleProductQuery,
  useGetSubCategoryQuery,
} from "../../features/api/apiSlice";
import { FaCamera, FaVideo } from "react-icons/fa";
import { toast } from "react-toastify";
import countriesData from "../../JSON/countries.json";
import ProductDetailsSkeleton from "../../skeletons/ProductDetailsSkeleton";
import { getImageUrl, onImageError } from "../../utils/imageUtils";

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
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

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

function EditDetailsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    setCountries(countriesData);
  }, []);

  const {
    data,
    isLoading: productLoading,
    error: productError,
  } = useGetSingleProductQuery(slug);

  const [
    editProduct,
    { isLoading: editProductLoading, error: editProductError },
  ] = useEditSingleProductMutation();

  const {
    data: subCategories,
    isLoading: subCategoriesLoading,
    error: subCategoryError,
  } = useGetSubCategoryQuery();

  const [editImage, { isLoading: editImageLoading, error: editImageError }] =
    useEditSingleProductImageMutation();

  const [
    deleteImage,
    { isLoading: deleteImageLoading, error: deleteImageError },
  ] = useDeleteSingleProductImageMutation();

  const [editVideo, { isLoading: editVideoLoading, error: editVideoError }] =
    useEditSingleProductVideoMutation();

  const [
    deleteVideo,
    { isLoading: deleteVideoLoading, error: deleteVideoError },
  ] = useDeleteSingleProductVideoMutation();

  const product = data?.product;

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    slug: "",
    origin: "",
    price: "",
    carat: "",
    category: "",
    ratti: "",
    description: "",
    color: "",
    shape: "",
    stock: 0,
    weight: 0,
    treatment: "",
    isAvailable: false,
    isFeatured: false,
    deliveryDays: "",
    certificate: [],
    cut: "",
    sellPrice: "",
    upSellingProductSKU: [""], // it was apsent so due to which button was not working
  });

  const addCertificate = () => {
    setFormData((prev) => ({
      ...prev,
      certificate: [
        ...prev.certificate,
        { certificateType: "", price: 0 }, // default structure
      ],
    }));
  };

  const removeCertificate = (index) => {
    setFormData((prev) => ({
      ...prev,
      certificate: prev.certificate.filter((_, i) => i !== index),
    }));
  };


  //here i will add code for upSellingProductSKU

  const addUpSellSku = () =>{
    setFormData((prev) => {
      console.log("adding sku row");
      return {
        ...prev,
      upSellingProductSKU : [...prev.upSellingProductSKU, ""],
      };
    });
  };

  // to update
  const updateUpSellSku = (index,value) => {
    setFormData((prev) => {
      const arr = [...prev.upSellingProductSKU];
      arr[index]= value;
      return {...prev, upSellingProductSKU: arr};
    });
  };

  // to delete upSellingProductSKU
  const removeUpSellingSku = (index) => {
    setFormData((prev) => ({
      ...prev,
      upSellingProductSKU : prev.upSellingProductSKU.filter((_,i) => i !== index),

    }));
  };


  // ###########################################################################################################
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        slug: product.slug || "",
        origin: product.origin || "",
        price: product.price || "",
        carat: product.carat || "",
        category: product.category || "",
        ratti: product.ratti || "",
        description: product.description || "",
        color: product.color || "",
        shape: product.shape || "",
        stock: product.stock || 0,
        weight: product.weight || 0,
        treatment: product.treatment || "",
        isAvailable: product.isAvailable || false,
        isFeatured: product.isFeatured || false,
        certificate: product.certificate ? [...product.certificate] : [],
        cut: product.cut || "",
        sellPrice: product.sellPrice || "",
        deliveryDays: product.deliveryDays || "",
        upSellingProductSKU: product.upSellingProductSKU?.length ? [...product.upSellingProductSKU]: [""],     //added new field
      });
    }
  }, [product]);

  useEffect(() => {
    if (product?.subCategory?._id) {
      setSelectedSubCategoryId(product.subCategory._id);
    }
  }, [product]);

  const handleSave = async () => {
    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("sku", formData.sku);
      data.append("slug", formData.slug);
      data.append("origin", formData.origin);
      data.append("carat", formData.carat);
      data.append("ratti", formData.ratti);
      data.append("price", formData.price);
      data.append("sellPrice", formData.sellPrice);
      data.append("weight", formData.weight);
      data.append("treatment", formData.treatment);
      data.append("shape", formData.shape);
      data.append("color", formData.color);
      data.append("stock", formData.stock);
      data.append("isAvailable", formData.isAvailable);
      data.append("isFeatured", formData.isFeatured);
      data.append("description", formData.description);
      data.append("cut", formData.cut);
      data.append("deliveryDays", formData.deliveryDays);
      data.append("certificate", JSON.stringify(formData.certificate));
      data.append("subCategory", selectedSubCategoryId);
      data.append("upSellingProductSKU", JSON.stringify(formData.upSellingProductSKU)); // added new append for upSellingProductSKU
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
      const res = await editProduct({ productId: product._id, formData: data })
        .unwrap()
        .then((res) => {
          navigate(`/product-details/${res.newSlug}`, { replace: true });
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

  const handleRemoveVideo = (i) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleRemoveImage = (i) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== i));
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
        const res = await editImage({
          productId: product._id,
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
        productId: product._id,
        imageId: id,
      }).unwrap();

      toast.success("Image Deleted Successfully");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "error in product image delete"
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
          productId: product._id,
          videoId: index,
          file: formData,
        }).unwrap();

        toast.success("Video edited successfully");
      } catch (error) {
        toast.error(
          error?.data?.msg ||
            error?.data?.message ||
            error?.error ||
            "Could not edit video try again"
        );
      }
    };
    input.click();
  };

  const handleDeleteVideo = async (id) => {
    try {
      await deleteVideo({
        productId: product._id,
        videoId: id,
      }).unwrap();

      toast.success("Video Deleted successfully");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "error deleting product video"
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  if (!product) return <p>No Product found</p>;

  if (productLoading || subCategoriesLoading) return <ProductDetailsSkeleton />;

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
          {/* Breadcrumb */}
          <div className="mb-4">
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
              Product Details
            </span>
          </div>
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
                        <div key={image.id || image._id || index} className="relative flex-shrink-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img
                              src={getImageUrl(image.url)}
                              alt={`Product ${index + 1}`}
                              onError={onImageError()}
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
                        <div key={vid.id || vid._id || index} className="relative flex-shrink-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                            <video
                              src={getImageUrl(vid.url, "")}
                              className="w-full h-full object-contain"
                              controls={false}
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
                            {/* Remove button */}
                            <button
                              onClick={() => handleRemoveVideo(index)}
                              className="absolute -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow hover:bg-red-600"
                            >
                              ✕
                            </button>

                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                              <video
                                src={vid.src || "/placeholder.svg"}
                                className="w-full h-full object-contain"
                              />
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
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Blue Sapphire (Premium Stone)"
                      />
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label
                        htmlFor="subcategory"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Update Subcategory
                      </label>
                      <select
                        id="subcategory"
                        name="subcategory"
                        value={selectedSubCategoryId}
                        onChange={(e) =>
                          setSelectedSubCategoryId(e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      >
                        <option value="">Select Subcategory</option>
                        {subCategories?.subcategories?.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
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
                        placeholder="e.g. YS-101"
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
                        placeholder="e.g. yellow-sapphire-5-65-carats-ys-101"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-md border border-gray-200">
                    <span className="font-semibold text-[#077B8A]">Live Canonical URL:</span> https://gemrishi.com/products/
                    <span className="text-emerald-700 font-mono font-medium">
                      {(formData.name || "product-name").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                    </span>/
                    <span className="text-blue-700 font-mono font-medium">
                      {(formData.sku || "sku").toLowerCase().replace(/[^a-z0-9-]+/g, "-")}
                    </span>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Price
                      </label>
                      <Input
                        name="price"
                        type="Number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="₹ 62,000.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Before Discount
                      </label>
                      <Input
                        name="sellPrice"
                        type="Number"
                        value={formData.sellPrice}
                        onChange={handleInputChange}
                        placeholder="e.g 100000"
                      />
                    </div>
                  </div>

                  {/* Third Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ratti :
                      </label>
                      <Input
                        name="ratti"
                        type="Number"
                        value={formData.ratti}
                        onChange={handleInputChange}
                        placeholder="5 ratti"
                      />
                    </div>

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
                    </div>
                  </div>

                  {/* Fifth Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <Input
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        placeholder="Red"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shape
                      </label>
                      <Input
                        name="shape"
                        value={formData.shape}
                        onChange={handleInputChange}
                        placeholder="Oval"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        cut
                      </label>
                      <Input
                        name="cut"
                        value={formData.cut}
                        onChange={handleInputChange}
                        placeholder="Sharp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Carat :
                      </label>
                      <Input
                        name="carat"
                        type="Number"
                        value={formData.carat}
                        onChange={handleInputChange}
                        placeholder="3 carats"
                      />
                    </div>
                  </div>

                  {/* Sixth Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <Input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Seventh Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Treatment
                      </label>
                      <Input
                        name="treatment"
                        value={formData.treatment}
                        onChange={handleInputChange}
                        placeholder="Good"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Days
                      </label>
                      <Input
                        name="deliveryDays"
                        value={formData.deliveryDays}
                        onChange={handleInputChange}
                        placeholder="e.g. 4"
                      />
                    </div>
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
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
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
                        <Button onClick={() => removeCertificate(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={addCertificate}>Add</Button>
                  </div>

{/* ########################################################################################################################################### */}
                  <div>
                    <label className="block text-sm  font-medium text-grey-700 mb-2">
                      UpSelling Products SKU's
                    </label>

                    {formData.upSellingProductSKU.map((sku, index) => (
                      <div key={index} className = "flex gap-2 mb-2">
                        <input
                        value={sku}
                        onChange ={(e) => {
                          updateUpSellSku(index, e.target.value)
                        }}
                        placeholder="Emdse2323"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        ></input>
                        {formData.upSellingProductSKU.length > 1 && (
                          <Button
                          varient ="secondary"
                          type="button"
                          onClick ={() => removeUpSellingSku(index)}
                          >
                          Remove
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button variant="secondary" type="button" onClick={addUpSellSku}>
                    Add SKU
                    </Button>
                  </div>

{/* //############################################################################################################################################ */}

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

export default EditDetailsPage;

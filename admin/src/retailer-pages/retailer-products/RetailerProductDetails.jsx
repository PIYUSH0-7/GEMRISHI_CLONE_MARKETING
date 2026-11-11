import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { FaChevronLeft, FaChevronRight, FaCheck } from "react-icons/fa";
import Stone1 from "../../assets/Stone1.svg";
import DeleteIcon from "../../assets/DeleteIcon.svg";
import Delete0 from "../../assets/Delete0.svg";
import EditLogo from "../../assets/EditLogo.svg";
import {
  useAddInCartMutation,
  useDeleteSingleProductMutation,
  useGetSingleProductQuery,
} from "../../features/api/apiSlice";
import { toast } from "react-toastify";
import RetailerNavbar from "../../components/RetailerNavbar";
import RetailerUpperBar from "../../components/RetailerUpperBar";
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
    <div className={`p-6 ${className}`} {...props}>
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
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
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

function RetailerProductDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customization, setCustomization] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { slug } = useParams();

  const {
    data,
    isLoading: productLoading,
    error: productError,
  } = useGetSingleProductQuery(slug);

  const product = data?.product;

  const handleCustomization = (e) => {
    const selectedType = e.target.value;
    const selectedCert = product.certificate.find(
      (c) => c.certificateType === selectedType
    );
    setCustomization((prev) => ({
      certificate: {
        certificateType: selectedCert.certificateType,
        price: selectedCert.price,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      customization: ""
    }))
  };

  const [addItemInCart, { isLoading: cartLoading, error: cartError }] =
    useAddInCartMutation();

  const handleAddCart = async () => {
    const newErrors = {};
    if (!customization) newErrors.customization = "Please Select Certificate";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      await addItemInCart({
        itemId: product._id,
        quantity: 1,
        customization: customization,
      }).unwrap();

      toast.success("Product added in cart successfully");
      navigate("/retailer/cart")
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.msg ||
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

  // Combine media
  const media = [
    ...(product?.images || []).map((img) => ({ type: "image", url: img.url })),
    ...(product?.videos || []).map((vid) => ({ type: "video", url: vid.url })),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const keyLabelMap = {
    isAvailable: "Status",
    name: "Product Name",
    isFeatured: "Featured",
  };

  const valueMap = {
    isAvailable: (val) => (val ? "Active" : "Inactive"),
    isFeatured: (val) => (val ? "Active" : "Inactive"),
  };

  const [
    deleteProduct,
    { isLoading: productDeleteLoading, error: productDeleteError },
  ] = useDeleteSingleProductMutation();

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteProduct(product._id).unwrap();

      setShowDeleteModal(false);
      setIsDeleting(false);
      setShowSuccessAlert(true);

      // Hide success alert after 3 seconds and navigate
      setTimeout(() => {
        setShowSuccessAlert(false);
        setTimeout(() => {
          navigate("/products");
        }, 300);
      }, 1000);
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Product deleted successfully"
      );
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (productLoading) return <ProductDetailsSkeleton />
  if (!product) return <p>No product found.</p>;

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200`}
      >
        <RetailerNavbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden`}
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
        <RetailerNavbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Main Content */}
      <div
        className={`w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col`}
      >
        <div className="w-full sticky top-0 z-30">
          <RetailerUpperBar toggleSidebar={toggleSidebar} />
        </div>

        {/* Product Details Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="mb-4">
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/retailer/dashboard")}
            >
              Dashboard
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/retailer/products")}
            >
              Products
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-700 text-sm font-medium">
              Product Details
            </span>
          </div>

          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Product Detail :
            </h1>
          </div>

          {/* Product Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white">
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Side - Images */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative bg-gray-50 rounded-lg p-8 flex justify-center items-center">
                      {media[currentIndex]?.type === "image" ? (
                        <motion.img
                          key={currentIndex}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          src={media[currentIndex]?.url || "/placeholder.svg"}
                          alt={product?.name}
                          className="w-48 h-48 object-contain"
                        />
                      ) : (
                        <motion.video
                          key={currentIndex}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          src={media[currentIndex]?.url}
                          controls
                          className="w-48 h-48 object-contain"
                        />
                      )}

                      {/* Navigation arrows */}
                      <motion.button
                        onClick={prevMedia}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-70 rounded-full"
                      >
                        <FaChevronLeft className="w-4 h-4 text-gray-600" />
                      </motion.button>
                      <motion.button
                        onClick={nextMedia}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-70 rounded-full"
                      >
                        <FaChevronRight className="w-4 h-4 text-gray-600" />
                      </motion.button>
                    </div>

                    {/* Thumbnail Images */}
                    <div className="flex gap-2 justify-center">
                      {media.map((item, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                            currentIndex === index
                              ? "border-blue-500 shadow-md"
                              : "border-gray-200"
                          }`}
                          onClick={() => setCurrentIndex(index)}
                        >
                          {item.type === "image" ? (
                            <img
                              src={item.url || "/placeholder.svg"}
                              className="w-full h-full object-contain bg-gray-50"
                            />
                          ) : (
                            <video
                              src={item.url || "/placeholder.svg"}
                              className="w-full h-full object-contain bg-gray-50"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - Product Info */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Product Title and Price */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        {product.name}
                      </h2>
                      <p className="text-lg text-gray-600 mb-2">
                        Subcategory: {product?.subCategory?.name}
                      </p>
                      <p>
                        {product?.stock === 0 ? <span>Out Of Stock</span> : ""}
                      </p>
                      
                      <p className="text-3xl font-bold text-gray-800">
                        Rs. {product.price.toLocaleString() || 0}
                      </p>
                    </div>

                    {/* Product Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Product Description :
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4 p-6 mt-6">
                    {Object.entries(product)
                      .filter(
                        ([key, value]) =>
                          ![
                            "createdAt",
                            "updatedAt",
                            "__v",
                            "slug",
                            "sellPrice",
                            "subCategory",
                            "description",
                            "stock",
                            "orderCount",
                            "deliveryDays",
                            "isAvailable",
                            "isFeatured",
                            "_id",

                          ].includes(key) &&
                          (typeof value !== "object" ||
                            Array.isArray(value) === false)
                      )
                      .map(([key, value], index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                          }}
                          className="flex justify-between py-2 border-b border-gray-100"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {keyLabelMap[key] || key}
                          </span>
                          <span className="text-sm text-gray-600">
                            {valueMap[key]
                              ? valueMap[key](value)
                              : String(value)}
                          </span>
                        </motion.div>
                      ))}
                  </div>

                  <div className="p-6 border-t border-gray-100">
                    <label
                      htmlFor="cert"
                      className="block text-gray-800 font-medium mb-2"
                    >
                      Certificates:
                    </label>

                    {product.certificate && product.certificate.length > 0 ? (
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        defaultValue=""
                        id="cert"
                        onChange={handleCustomization}
                      >
                        <option value="" disabled>
                          Select Certificate
                        </option>
                        {product.certificate.map((cert, idx) => (
                          <option key={idx} value={cert.certificateType}>
                            {cert.certificateType} - ₹{cert.price}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No certificates available.
                      </p>
                    )}
                    {errors.customization ? (
                      <span className="text-sm text-red-500">{errors.customization}</span>
                    ) : (
                      ""
                    )}
                  </div>

                  <Button
                    onClick={handleAddCart}
                    className="w-full cursor-pointer"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                  }}
                  className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
                >
                  <img
                    src={DeleteIcon || "/placeholder.svg"}
                    alt=""
                    className="h-7 w-7 text-red-600"
                  />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  Delete Product
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-600 mb-6"
                >
                  Are you sure you want to delete this product ?
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 justify-center"
                >
                  <Button
                    variant="secondary"
                    onClick={cancelDelete}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-6"
                  >
                    {isDeleting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Alert */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-6 right-6 z-[70] bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                damping: 20,
                stiffness: 300,
              }}
              className="bg-white bg-opacity-20 rounded-full p-1"
            >
              <FaCheck className="w-4 h-4" />
            </motion.div>
            <div>
              <p className="font-semibold">Successfully Deleted!</p>
              <p className="text-sm opacity-90">Product has been removed</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RetailerProductDetails;

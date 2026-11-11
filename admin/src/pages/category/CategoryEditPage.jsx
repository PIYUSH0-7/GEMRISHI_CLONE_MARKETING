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
  useGetCategoryQuery,
  useGetSingleProductQuery,
  useGetSingleSubCategoryQuery,
  useGetSubCategoryQuery,
  useUpdateSubCategoryMutation,
} from "../../features/api/apiSlice";
import { FaCamera, FaVideo } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRef } from "react";

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

function CategoryEditPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  

  const handleEditClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      setPreview(URL.createObjectURL(file));
    }
  };

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

  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetCategoryQuery();


  const { data: subcategory, isLoading: subcategoryLoading } =
    useGetSingleSubCategoryQuery({ slug, page: 1, limit: 10 });

  const [
    updateCategory,
    { isLoading: updateCategoryLoading, error: updateCategoryError },
  ] = useUpdateSubCategoryMutation();

  const product = subcategory?.subcategory;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAudience: "",
    benefits: [""],
    qualityLevel: "",
    pricingDetails: "",
    faqs: [
      {
        question: "",
        answer: "",
      },
    ],
    tags: [""],
  });


  useEffect(() => {
    if (subcategory?.subcategory) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        targetAudience: product.targetAudience || "",
        benefits: product.benefits?.length ? [...product.benefits] : [""],
        qualityLevel: product.qualityLevel || "",
        pricingDetails: product.pricingDetails || "",
        faqs: product.faqs?.length
          ? product.faqs.map((f) => ({
              question: f.question || "",
              answer: f.answer || "",
            }))
          : [{ question: "", answer: "" }],
        tags: product.tags?.length ? [...product.tags] : [""],
      });
    }
  }, [product]);

  useEffect(() => {
    if (product?.category) {
      setSelectedCategoryId(product.category);
    }
  }, [product]);

  const handleSave = async () => {
    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("targetAudience", formData.targetAudience);
      data.append("benefits", JSON.stringify(formData.benefits));
      data.append("qualityLevel", formData.qualityLevel);
      data.append("pricingDetails", formData.pricingDetails);
      data.append("tags", JSON.stringify(formData.tags));
      data.append("faqs", JSON.stringify(formData.faqs));
      data.append("category", selectedCategoryId);

      data.append("subCategoryImg", img);

      // Call API mutation
      const res = await updateCategory({ subcategoryId: product._id, formData: data })
        .unwrap()
        .then((res) => {
          navigate(`/category/${res.newSlug}`, { replace: true });
        });

      toast.success("Product Edited Successfully");
    } catch (error) {
      toast.error(error?.data?.msg || error?.data?.message || error?.error || "Something went wrong");
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

  if (!product) return <p>No Product found</p>;

  if (productLoading || subCategoriesLoading) return <p>Loading...</p>;

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
              onClick={() => navigate("/category")}
            >
              Category
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-700 text-sm font-medium">
              Category Details
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

                <div className="mb-6 sm:mb-8">
                  <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-3 sm:gap-4 min-w-max">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={
                              preview || product.image.url || "/placeholder.svg"
                            }
                            alt={`Product ${1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex gap-2 mt-1 text-xs">
                          <button
                            onClick={handleEditClick}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                          />
                          <button
                            onClick={handleSave}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Category Details :
                  </h3>

                  {/* First Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name
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
                        Update Parent Category
                      </label>
                      <select
                        id="subcategory"
                        name="subcategory"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      >
                        <option value="">Select Subcategory</option>
                        {category?.categories?.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Who Should Wear ?
                      </label>
                      <Textarea
                        name="targetAudience"
                        type="text"
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        placeholder="Target Audience"
                        rows={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality Level Description
                      </label>
                      <Textarea
                        name="qualityLevel"
                        type="text"
                        value={formData.qualityLevel}
                        onChange={handleInputChange}
                        placeholder="Quality Level"
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* Third Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pricing Details:
                      </label>
                      <Textarea
                        name="pricingDetails"
                        type="Number"
                        value={formData.pricingDetails}
                        onChange={handleInputChange}
                        placeholder="Pricing Details"
                        rows={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags :
                      </label>
                      {formData.tags.map((tag, index) => (
                        <div className="flex gap-4 mb-2">
                          <Input
                            key={index}
                            value={tag}
                            onChange={(e) => {
                              const newTags = [...formData.tags];
                              newTags[index] = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                tags: newTags,
                              }));
                            }}
                            placeholder={`Tag ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                tags: prev.tags.filter(
                                  (_, i) => i !== index
                                ),
                              }))
                            }
                            className="px-2 bg-red-500 text-white rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            tags: [...prev.tags, ""],
                          }))
                        }
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Fifth Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        FAQs :
                      </label>

                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="mb-4 p-3 rounded ">
                          <label className="block text-sm font-medium text-gray-600">
                            Question:
                          </label>
                          <Input
                            value={faq.question}
                            onChange={(e) => {
                              const updatedFaqs = [...formData.faqs];
                              updatedFaqs[index].question = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                faqs: updatedFaqs,
                              }));
                            }}
                            placeholder={`Question ${index + 1}`}
                            className="mb-2"
                          />

                          <label className="block text-sm font-medium text-gray-600">
                            Answer:
                          </label>
                          <Input
                            value={faq.answer}
                            onChange={(e) => {
                              const updatedFaqs = [...formData.faqs];
                              updatedFaqs[index].answer = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                faqs: updatedFaqs,
                              }));
                            }}
                            placeholder={`Answer ${index + 1}`}
                            className="mb-2"
                          />

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                faqs: prev.faqs.filter((_, i) => i !== index),
                              }))
                            }
                            className="mt-2 px-2 py-1 bg-red-500 text-white rounded"
                          >
                            Remove FAQ
                          </button>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              faqs: [
                                ...prev.faqs,
                                { question: "", answer: "" },
                              ],
                            }))
                          }
                          className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                        >
                          + Add FAQ
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benefits :
                      </label>
                      {formData.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={benefit}
                            onChange={(e) => {
                              const newBenefits = [...formData.benefits];
                              newBenefits[index] = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                benefits: newBenefits,
                              }));
                            }}
                            placeholder={`Benefit ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                benefits: prev.benefits.filter(
                                  (_, i) => i !== index
                                ),
                              }))
                            }
                            className="px-2 bg-red-500 text-white rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            benefits: [...prev.benefits, ""],
                          }))
                        }
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        + Add Benefit
                      </button>
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

export default CategoryEditPage;

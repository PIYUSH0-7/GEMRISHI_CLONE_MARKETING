import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { FaPlus, FaTrash, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCreateJewelleryCategoryMutation,
  useCreateJewellerySubCategoryMutation,
  useGetJewelryCategoryQuery,
} from "../../features/api/apiSlice";
import { toast } from "react-toastify";
import { Textarea } from "../../ui/textarea";

// Custom Button Component
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

function JewelleryCategory() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jewelleryCategoryName, setJewelleryCategoryName] = useState("");
  const [jewelleryCategoryDescription, setJewelleryCategoryDescription] =
    useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [name, setName] = useState(""); // New state for 'name'
  const [description, setDescription] = useState(""); // New state for 'description'
  const [about, setAbout] = useState("");
  const [meaning, setMeaning] = useState("");
  const [buyerGuide, setBuyerGuide] = useState("");
  const [qualityAndPrice, setQualityAndPrice] = useState(""); // Corrected state for key
  const [categoryId, setCategoryId] = useState("");
  const [errors, setErrors] = useState({});
  const [catErrors, setCatErrors] = useState({});

  const [
    createJewelleryCategory,
    { idLoading: jewelleryCategoryLoading, error: jewelleryCategoryError },
  ] = useCreateJewelleryCategoryMutation();

  const [
    createJewellerySubcategory,
    {
      isLoading: jewellerySubcategoryLoading,
      error: jewellerySubCategoryError,
    },
  ] = useCreateJewellerySubCategoryMutation();

  const { data: categories } = useGetJewelryCategoryQuery();

  const [category, setCategory] = useState({
    name: "",
    description: "",
  });

  const handleCategoryChange = (e) => {
    const { id, value } = e.target;
    setCategory((prev) => ({ ...prev, [id]: value }));

    setCatErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSaveJewelleryCategory = async () => {
    const newErrors = {};

    // Validate name
    if (!category.name.trim()) {
      newErrors.name = "Please enter category name.";
    }

    setCatErrors(newErrors);

    // Stop if there are errors
    if (Object.keys(newErrors).length > 0) return;

    try {
      await createJewelleryCategory({
        name: category.name,
        description: category.description,
      }).unwrap();

      toast.success("Category added successfully");
      setCategory({
        name: "",
        description: "",
      });
    } catch (error) {
      toast.error(error?.data?.msg || error?.data?.message || error?.error || "Category could not be added");
    }
  };

  // State for Sub-Category Details
  const [subCategory, setSubCategory] = useState({
    name: "",
    description: "",
    about: "",
    meaning: "",
    buyerGuide: "",
    qualityAndPrice: "",
    faqs: [
      {
        question: "",
        answer: "",
      },
    ],
    image: {
      fileName: "",
      url: "",
    },
  });

  const removeFaq = (index) => {
    setSubCategory((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSubCategoryChange = (e) => {
    const { id, value } = e.target;
    setSubCategory((prev) => ({ ...prev, [id]: value }));

    setErrors((prev) => ({ ...prev, [id]: "" }))
  };

  const handleFQS = (index, field, value) => {
    setSubCategory((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      ),
    }));

    setErrors((prev) => ({ ...prev, [`faqs_${field}_${index}`]: "" }))
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  const [imageFile, setImageFile] = useState("");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImageFile(file); // Store the file object
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result); // Store base64 string for preview
      };
      reader.readAsDataURL(file);
    }
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const addFaq = () => {
    setSubCategory((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const handleSaveSubcategory = async () => {
    const newErrors = {};

    // Validate image
    if (!uploadedImage) {
      newErrors.image = "Please upload an image.";
    }

    if (!categoryId) {
      newErrors.category = "Plesae fill the category field";
    }

    // Validate main fields (except FAQs and image)
    for (const [key, value] of Object.entries(subCategory)) {
      if (
        key !== "faqs" &&
        key !== "image" &&
        (!value || value.toString().trim() === "")
      ) {
        newErrors[key] = `Please fill the ${key} field`;
      }
    }

    // Validate FAQs
    subCategory.faqs.forEach((faq, index) => {
      if (!faq.question?.trim()) {
        newErrors[
          `faqs_question_${index}`
        ] = `Please fill the question at row ${index + 1}`;
      }
      if (!faq.answer?.trim()) {
        newErrors[`faqs_answer_${index}`] = `Please fill the answer at row ${
          index + 1
        }`;
      }
    });

    setErrors(newErrors);

    // Stop submission if there are errors
    if (Object.keys(newErrors).length > 0) return;

    try {
      const formData = new FormData();
      formData.append("subCategoryImg", imageFile);
      formData.append("name", subCategory.name);
      formData.append("about", subCategory.about);
      formData.append("buyerGuide", subCategory.buyerGuide);
      formData.append("description", subCategory.description);
      formData.append("qualityAndPrice", subCategory.qualityAndPrice);
      formData.append("meaning", subCategory.meaning);
      formData.append("faqs", JSON.stringify(subCategory.faqs));

      await createJewellerySubcategory({ categoryId, data: formData }).unwrap()
      toast.success("Subcategory added successfully");

      setSubCategory({
        name: "",
        about: "",
        buyerGuide: "",
        description: "",
        meaning: "",
        faqs: [
          {
            question: "",
            answer: "",
          },
        ],
        qualityAndPrice: "",
        benefits: [""],
        image: {
          fileName: "",
          url: "",
        },
      });
      setImageFile("");
      setUploadedImage("");
    } catch (error) {
      toast.error(error?.data?.msg || error?.data?.message || error?.error || "An error occurred while saving.");
    }
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
      <AnimatePresence>
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

      {/* Main Content */}
      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col">
        <div className="w-full sticky top-0 z-30">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>

        {/* Add Category Content */}
        <div className="flex-1 p-6 overflow-y-auto">
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
              Add Jewellery Category
            </span>
          </div>

          {/* Add New Jewellery Category Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "#214436" }}
            >
              Add New Jewellery Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="jewelleryCategoryName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name :
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Category Name"
                  value={category.name}
                  onChange={handleCategoryChange}
                />
                {catErrors.name && (
                  <p className="text-red-500 text-xs">{catErrors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="jewelleryCategoryDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description :
                </label>
                <input
                  type="text"
                  id="description"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Description"
                  value={category.description}
                  onChange={handleCategoryChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                className="text-white cursor-pointer px-6 py-2 rounded-md"
                style={{ backgroundColor: "#214436" }}
                onClick={handleSaveJewelleryCategory}
              >
                Save
              </Button>
            </div>
          </motion.div>

          {/* Add New Sub-Category Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-6"
          >
            <h2
              className="text-xl font-semibold text-gray-800 mb-4"
              style={{ color: "#214436" }}
            >
              Add New Jewellery Sub-Category
            </h2>
            {/* Image Upload Area */}
            <h3 className="text-lg font-semibold mb-4">Pick Image :</h3>
            <div
              className={`w-84 h-26 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center mb-2 cursor-pointer
  ${
    uploadedImage
      ? "border-green-500 bg-green-50"
      : "border-gray-300 bg-gray-100"
  }`}
              onClick={() =>
                document.getElementById("imageUploadInput").click()
              }
            >
              <input
                type="file"
                id="imageUploadInput"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="h-16 object-contain mb-1"
                />
              ) : (
                <FaUpload className="w-6 h-6 text-gray-400 mb-1" />
              )}
            </div>
            {errors.image && (
              <p className="text-red-500 text-xs">{errors.image}</p>
            )}

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Category Details :
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="productCategoryName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name :
                </label>
                <select
                  id="productCategoryName"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  onChange={(e) => {
                    const selectedCategory = categories?.jewelryCategories.find(
                      (cat) => cat.name === e.target.value
                    );
                    setCategoryId(selectedCategory._id);
                    
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                >
                  <option value="">Select a category</option>
                  {categories?.jewelryCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mb-4">{errors.category}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sub-Category Name :
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Sub-Category Name"
                  value={subCategory.name}
                  onChange={handleSubCategoryChange}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="about"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  About :
                </label>
                <Textarea
                  type="text"
                  id="about"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="About"
                  value={subCategory.about}
                  onChange={handleSubCategoryChange}
                />
                {errors.about && (
                  <p className="text-red-500 text-xs">{errors.about}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="meaning"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Meaning :
                </label>
                <Textarea
                  type="text"
                  id="meaning"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Meaning"
                  value={subCategory.meaning}
                  onChange={handleSubCategoryChange}
                />
                {errors.meaning && (
                  <p className="text-red-500 text-xs">{errors.meaning}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="buyerGuide"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Buyer Guide :
                </label>
                <Textarea
                  type="text"
                  id="buyerGuide"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Buyer Guide"
                  value={subCategory.buyerGuide}
                  onChange={handleSubCategoryChange}
                />
                {errors.buyerGuide && (
                  <p className="text-red-500 text-xs">
                    Please fill the Buyer guide field
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="qualityAndPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quality & Price:
                </label>
                <Textarea
                  type="text"
                  id="qualityAndPrice"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Quality & Price"
                  value={subCategory.qualityAndPrice}
                  onChange={handleSubCategoryChange}
                />
                {errors.qualityAndPrice && (
                  <p className="text-red-500 text-xs">
                    Please fill the Quality and Price field
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description :
              </label>
              <textarea
                id="description"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Description"
                value={subCategory.description}
                onChange={handleSubCategoryChange}
              />
              {errors.description && (
                <p className="text-red-500 text-xs">
                  Please fill the Description field
                </p>
              )}
            </div>
            <div className="mb-4 mt-4">
              <label
                htmlFor="faq"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                FAQ :
              </label>
              {subCategory.faqs.map((faq, index) => (
                <div key={index} className="flex flex-col gap-1 mb-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) =>
                      handleFQS(index, "question", e.target.value)
                    }
                    placeholder="Add Question"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {errors[`faqs_question_${index}`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`faqs_question_${index}`]}
                    </p>
                  )}

                  <input
                    type="text"
                    value={faq.answer}
                    onChange={(e) => handleFQS(index, "answer", e.target.value)}
                    placeholder="Add Answer"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {errors[`faqs_answer_${index}`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`faqs_answer_${index}`]}
                    </p>
                  )}

                  <div className="flex gap-2 mt-1">
                    {subCategory.faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        <FaTrash />
                      </button>
                    )}
                    {index === subCategory.faqs.length - 1 && (
                      <button
                        type="button"
                        onClick={addFaq}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        <FaPlus />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button
                className="w-[200px] h-[40px] text-white cursor-pointer px-6 py-2 rounded-md"
                style={{ backgroundColor: "#214436" }}
                onClick={handleSaveSubcategory}
              >
                Save
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default JewelleryCategory;

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar"; // Import Navbar
import UpperBar from "../../components/UpperBar"; // Import UpperBar
import { FaPlus, FaTrash, FaUpload } from "react-icons/fa"; // Added FaUpload icon
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import {
  useCreateCategoryMutation,
  useCreateSubCategoryMutation,
  useGetCategoryQuery,
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

function AddNewCategory() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded image
  const [imageFile, setImageFile] = useState(null); // State to hold the actual image file
  const [errors, setErrors] = useState({});
  const [catErrors, setCatErrors] = useState({});

  // category section
  const [category, setCategory] = useState({
    name: "",
    description: "",
  });

  const handleCategoryChange = (e) => {
    const { id, value } = e.target;
    setCategory((prev) => ({ ...prev, [id]: value }));

    setCatErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[id];
      return newErr;
    });
  };

  const [addCategory, { isLoading, error }] = useCreateCategoryMutation();
  const [
    addSubCategory,
    { isLoading: subCategoryLoading, error: subcategoryError },
  ] = useCreateSubCategoryMutation();

  const handleSaveCategory = async () => {
    const newErrors = {};

    // Validate name
    if (!category.name.trim()) {
      newErrors.name = "Please enter category name.";
    }

    setCatErrors(newErrors);

    // Stop if there are errors
    if (Object.keys(newErrors).length > 0) return;
    try {
      await addCategory({
        name: category.name,
        description: category.description,
      }).unwrap();

      toast.success("Category added succesfully");
      setCategory({
        name: "",
        description: "",
      });
    } catch (error) {
      toast.error(error?.data?.msg || error?.data?.message || error?.error || "category could not be added try again");
    }
  };

  const {
    data: categories,
    error: categoryError,
    isLoading: categoryLoading,
  } = useGetCategoryQuery();

  // State for Sub-Category Details
  const [subCategory, setSubCategory] = useState({
    name: "",
    description: "",
    targetAudience: "",
    qualityLevel: "",
    pricingDetails: "",
    benefits: [""],
    tags: [""],
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

  const { benefits, tags, faqs } = subCategory;

  const handleBenefitsChange = (index, value) => {
    const newbenefits = [...subCategory.benefits];
    newbenefits[index] = value;
    setSubCategory({
      ...subCategory,
      benefits: newbenefits,
    });

    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[`benefits_${index}`];
      return newErr;
    });
  };

  const removeField = (field, index) => {
    setSubCategory((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const removeFaq = (index) => {
    setSubCategory((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleTagsChange = (index, value) => {
    const newTags = [...subCategory.tags];
    newTags[index] = value;
    setSubCategory({ ...subCategory, tags: newTags });

    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[`tags_${index}`];
      return newErr;
    });
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...subCategory.faqs];
    newFaqs[index][field] = value; // field is either 'question' or 'answer'
    setSubCategory({ ...subCategory, faqs: newFaqs });

    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[`faqs_${field}_${index}`];
      return newErr;
    });
  };

  const handleAddBenefit = (e) => {
    e.preventDefault();
    setSubCategory({ ...subCategory, benefits: [...subCategory.benefits, ""] });
  };
  const handleAddTags = (e) => {
    e.preventDefault();
    setSubCategory({ ...subCategory, tags: [...subCategory.tags, ""] });
  };

  const handleSubCategory = (e) => {
    const { id, value } = e.target;
    setSubCategory((prev) => ({ ...prev, [id]: value }));

    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[id];
      return newErr;
    });
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    setSubCategory({
      ...subCategory,
      faqs: [...subCategory.faqs, { question: "", answer: "" }],
    });
  };

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

  const validateSubCategory = () => {
    const newErrors = {};

    if (!categoryId) newErrors.category = "Please pick the category.";

    // Simple string fields
    Object.entries(subCategory).forEach(([key, value]) => {
      if (
        !["benefits", "tags", "faqs", "image"].includes(key) &&
        (!value || value.toString().trim() === "")
      ) {
        newErrors[key] = `Please fill the ${key} field`;
      }
    });

    // Validate benefits array
    benefits.forEach((b, i) => {
      if (!b?.trim()) {
        newErrors[`benefits_${i}`] = `Please fill benefit at row ${i + 1}`;
      }
    });

    // Tags
    tags.forEach((t, i) => {
      if (!t?.trim()) {
        newErrors[`tags_${i}`] = `Please fill tag at row ${i + 1}`;
      }
    });

    // FAQs
    faqs.forEach((f, i) => {
      if (!f.question?.trim()) {
        newErrors[`faqs_question_${i}`] = `Please fill question at row ${
          i + 1
        }`;
      }
      if (!f.answer?.trim()) {
        newErrors[`faqs_answer_${i}`] = `Please fill answer at row ${i + 1}`;
      }
    });

    // Image
    if (!uploadedImage) newErrors.image = "Please upload an image";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSubCategory = async () => {
    if (validateSubCategory()) {
      try {
        const formData = new FormData();
        // Simple string fields
        formData.append("name", subCategory.name);
        formData.append("description", subCategory.description);
        formData.append("targetAudience", subCategory.targetAudience);
        formData.append("qualityLevel", subCategory.qualityLevel);
        formData.append("pricingDetails", subCategory.pricingDetails);

        // Arrays (convert to JSON)
        formData.append("benefits", JSON.stringify(subCategory.benefits));
        formData.append("tags", JSON.stringify(subCategory.tags));
        formData.append("faqs", JSON.stringify(subCategory.faqs));
        formData.append("subCategoryImg", imageFile);

       

        await addSubCategory({ categoryId, formData }).unwrap();
        toast.success("Subcategory added succesfully");
        setSubCategory({
          name: "",
          description: "",
          targetAudience: "",
          qualityLevel: "",
          pricingDetails: "",
          benefits: [""],
          tags: [""],
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
        setImageFile("");
        setUploadedImage("");
      } catch (error) {
        toast.error(error?.data?.msg || error?.data?.message || error?.error || "Something went wrong");
      }
    }
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
              Add Gemstone Category
            </span>
          </div>

          {/* Add New Category Section */}
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
              Add New Gemstone Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name :
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter category name"
                  value={category.name}
                  onChange={handleCategoryChange}
                />
                {catErrors.name && (
                  <p className="text-red-500 text-xs">{catErrors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="categoryDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description :
                </label>
                <input
                  type="text"
                  id="description"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter description"
                  value={category.description}
                  onChange={handleCategoryChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                className="text-white cursor-pointer px-6 py-2 rounded-md"
                style={{ backgroundColor: "#214436" }}
                onClick={handleSaveCategory}
              >
                Save
              </Button>
            </div>
          </motion.div>

          {/* Add New Product Section (as per screenshot) */}
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
              Add New Sub-Category
            </h2>
            {/* Image Upload Area */}
            <h3 className="text-lg font-semibold mb-4">Pick Image :</h3>
            <div
              className={`w-84 h-26 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center mb-6 cursor-pointer
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
                <div className="flex flex-col items-center justify-center">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="h-16 object-contain mb-1"
                  />
                  <span className="text-green-700 text-xs font-medium">
                    Uploaded!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <FaUpload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-gray-500 text-xs">
                    Upload Thumbnails
                  </span>
                </div>
              )}
            </div>
            {errors?.image && (
              <p className="text-red-500 text-xs mb-4">{errors.image}</p>
            )}

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Category Details :
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name :
                </label>
                <select
                  id="categoryName"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  onChange={(e) => {
                    const selectedCategory = categories?.categories.find(
                      (cat) => cat.name === e.target.value
                    );
                    setCategoryId(selectedCategory._id);

                    setErrors((prev) => {
                      const newErr = { ...prev };
                      delete newErr.category;
                      return newErr;
                    });
                  }}
                >
                  <option>Select a category</option>
                  {categories?.categories?.map((cat) => (
                    <option key={cat._id} value={cat.name}>
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
                  Name :
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter Sub-category Name"
                  value={subCategory.name}
                  onChange={handleSubCategory}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="targetAudience"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Target Audience :
                </label>
                <Textarea
                  type="text"
                  id="targetAudience"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter target audience"
                  value={subCategory.targetAudience}
                  onChange={handleSubCategory}
                />
                {errors.targetAudience && (
                  <p className="text-red-500 text-xs">
                    Please fill the Target Audience field
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="qualityLevel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quality Level :
                </label>
                <Textarea
                  type="text"
                  id="qualityLevel"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter quality level"
                  value={subCategory.qualityLevel}
                  onChange={handleSubCategory}
                />
                {errors.qualityLevel && (
                  <p className="text-red-500 text-xs">
                    Please fill the Quality Level field
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="pricingDetails"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pricing Details :
                </label>
                <Textarea
                  type="text"
                  id="pricingDetails"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter pricing details"
                  value={subCategory.pricingDetails}
                  onChange={handleSubCategory}
                />
                {errors.pricingDetails && (
                  <p className="text-red-500 text-xs">
                    Please fill the Pricing Details field
                  </p>
                )}
              </div>
            </div>

            {/* New Description Textarea */}
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description :
              </label>
              <textarea
                id="description"
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter a detailed description"
                value={subCategory.description}
                onChange={handleSubCategory}
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-xs">
                  Please fill the Description field
                </p>
              )}
            </div>

            {/* Benefits section with dynamic input */}
            <div className="mb-4">
              <label
                htmlFor="benefits"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Benefits :
              </label>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col gap-1 mb-2">
                  <div className="flex gap-2 items-end">
                    <Textarea
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Add benefit"
                      value={benefit}
                      onChange={(e) =>
                        handleBenefitsChange(index, e.target.value)
                      }
                    />

                    <div className="flex gap-2">
                      {index === benefits.length - 1 && (
                        <button
                          type="button"
                          className="text-white p-2 rounded-md w-10 h-10 flex items-center justify-center"
                          style={{ backgroundColor: "#214436" }}
                          onClick={handleAddBenefit}
                        >
                          <FaPlus />
                        </button>
                      )}
                      {benefits.length > 1 && (
                        <button
                          type="button"
                          className="bg-red-600 text-white p-2 rounded-md w-10 h-10 flex items-center justify-center"
                          onClick={() => removeField("benefits", index)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Error below input */}
                  {errors?.[`benefits_${index}`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`benefits_${index}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Tags section with dynamic input */}
            <div className="mb-6">
              <label
                htmlFor="addTags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Add Tags :
              </label>
              {tags.map((tag, index) => (
                <div key={index} className="flex flex-col gap-1 mb-2">
                  <div className="flex gap-2 items-end">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Add tag"
                      value={tag}
                      onChange={(e) => handleTagsChange(index, e.target.value)}
                    />

                    <div className="flex gap-2">
                      {index === tags.length - 1 && (
                        <button
                          type="button"
                          className="text-white p-2 rounded-md w-10 h-10 flex items-center justify-center"
                          style={{ backgroundColor: "#214436" }}
                          onClick={handleAddTags}
                        >
                          <FaPlus />
                        </button>
                      )}

                      {tags.length > 1 && (
                        <button
                          type="button"
                          className="bg-red-600 text-white p-2 rounded-md w-10 h-10 flex items-center justify-center"
                          onClick={() => removeField("tags", index)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Error below input */}
                  {errors?.[`tags_${index}`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`tags_${index}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* FAQ section with dynamic input */}
            <div className="mb-4">
              <label
                htmlFor="faq"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                FAQ :
              </label>
              {faqs.map((faq, index) => (
                <div key={index} className="flex flex-col gap-1 mb-2">
                  <div className="flex gap-2 items-end">
                    {/* Question input */}
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 md:flex-1"
                      placeholder="Add Question"
                      value={faq.question}
                      onChange={(e) =>
                        handleFaqChange(index, "question", e.target.value)
                      }
                    />

                    {/* Answer input */}
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 md:flex-1"
                      placeholder="Add Answer"
                      value={faq.answer}
                      onChange={(e) =>
                        handleFaqChange(index, "answer", e.target.value)
                      }
                    />

                    <div className="flex gap-2">
                      {index === faqs.length - 1 && (
                        <button
                          type="button"
                          className="text-white p-2 rounded-md w-10 h-10 flex items-center justify-center"
                          style={{ backgroundColor: "#214436" }}
                          onClick={handleAddFaq}
                        >
                          <FaPlus />
                        </button>
                      )}

                      {faqs.length > 1 && (
                        <button
                          type="button"
                          className="bg-red-600 text-white p-2 rounded-md w-10 h-10 flex items-center justify-center"
                          onClick={() => removeFaq(index)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Errors below inputs */}
                  {errors?.[`faqs_question_${index}`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`faqs_question_${index}`]}
                    </p>
                  )}
                  {errors?.[`faqs_answer_${index}`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`faqs_answer_${index}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                className="w-[200px] h-[40px] text-white cursor-pointer px-6 py-2 rounded-md"
                style={{ backgroundColor: "#214436" }}
                onClick={handleSaveSubCategory}
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

export default AddNewCategory;

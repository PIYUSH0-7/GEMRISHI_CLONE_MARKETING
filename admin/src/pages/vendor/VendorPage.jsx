import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Users, Plus } from "lucide-react";
import { Textarea } from "../../ui/textarea";
import {
  useCreateRetailerMutation,
  useGetAllRetailerQuery,
} from "../../features/api/apiSlice";
import { toast } from "react-toastify";
import { Input } from "../../ui/input";
import Pagination from "../../components/Pagination";
import VendorSkeleton from "../../skeletons/VendorSkeleton";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200 p-1 rounded-lg",
  InProgress: "bg-blue-100 text-blue-800 border-blue-200 p-1 rounded-lg",
  Completed: "bg-purple-100 text-purple-800 border-purple-200 p-1 rounded-lg",
  Cancelled: "bg-red-100 text-red-800 border-red-200 p-1 rounded-lg",
};

function VendorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    country: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  const {
    data: retailers,
    isLoading: retailersLoading,
    error: retailersError,
  } = useGetAllRetailerQuery({ page, limit: 8 });

  const handlePageChange = (page) => {
    setPage(page); // triggers API refetch with ?page=page
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Only allow digits for mobileNo
    if (name === "mobileNo" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };

      // Live validation rules
      if (!value.trim()) {
        newErrors[name] = `Please fill ${name}`;
      } else {
        delete newErrors[name];
      }

      if (name === "mobileNo") {
        if (value.length < 10) {
          newErrors[name] = "Mobile number must be at least 10 digits";
        } else {
          delete newErrors[name];
        }
      }

      return newErrors;
    });
  };

  const [createRetailer, { isLoading: retailerLoading, error: retailerError }] =
    useCreateRetailerMutation();

  const handleSave = async () => {
    // Final check
    const newErrors = {};
    for (const [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        newErrors[key] = `Please fill the ${key} field`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createRetailer({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        mobileNo: formData.mobileNo,
        country: formData.country,
        address: formData.address,
      }).unwrap();
      setOpen(false);
      toast.success("Retailer Added Successfully");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Failed to add retailer"
      );
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!value.trim()) {
        newErrors.email = "Please fill email";
      } else if (!emailRegex.test(value)) {
        newErrors.email = "Invalid email address";
      } else {
        delete newErrors.email;
      }
      return newErrors;
    });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      const alphaNumRegex = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

      if (!value.trim()) {
        newErrors.password = "Please fill password";
      } else if (!alphaNumRegex.test(value)) {
        newErrors.password = "Password must contain letters and numbers";
      } else if (value.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      } else {
        delete newErrors.password;
      }

      return newErrors;
    });
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
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Retailer Management
            </h1>
            <p className="text-gray-600">
              Manage gemstone retailers and suppliers
            </p>
          </div>

          {/* All Vendors Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Retailers
              </h2>
              <button
                className="bg-[#264A3F] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Retailer
              </button>
            </div>

            {/* Vendor Grid */}
            {retailersLoading ? (
              <VendorSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {retailers?.retailers?.map((vendor) => (
                  <div
                    key={vendor._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                    onClick={() => navigate(`/vendor/${vendor._id}`)}
                  >
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                        {vendor.fullName
                          ?.split(" ")
                          .map((n) => n[0].toUpperCase())
                          .join("")}
                      </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {vendor.name}
                      </h3>

                      <p className="text-sm text-gray-500 mb-3">Retailer</p>
                      <div className="flex items-center justify-center text-gray-600 text-sm hover:text-blue-600 transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State / Add More */}
            <div className="mt-8 text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Need to add more retailers?</p>
              <button
                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                onClick={() => setOpen(true)}
              >
                Add New Retailer
              </button>
            </div>

            <Pagination
              currentPage={retailers?.currentPage}
              totalPage={retailers?.totalPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-1/2 shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">Add New Retailer</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-2">
              <div>
                <label htmlFor="">Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Retailer Name"
                  onChange={(e) => handleInputChange(e)}
                  value={formData.name}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">{errors.name}</span>
                )}
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <Input
                  type="email"
                  name="email"
                  onChange={handleEmailChange}
                  value={formData.email}
                  placeholder="Retailer Email"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">{errors.email}</span>
                )}
              </div>
              <div>
                <label htmlFor="email">Password</label>
                <Input
                  type="text"
                  name="password"
                  onChange={handlePasswordChange}
                  value={formData.password}
                  placeholder="Retailer Password"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                {errors.password && (
                  <span className="text-red-500 text-xs">
                    {errors.password}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="email">Mobile Number</label>
                <Input
                  type="text"
                  name="mobileNo"
                  onChange={(e) => handleInputChange(e)}
                  value={formData.mobileNo}
                  placeholder="Mobile Number "
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                {errors.mobileNo && (
                  <span className="text-red-500 text-xs">
                    {errors.mobileNo}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="email">Country</label>
                <Input
                  type="text"
                  name="country"
                  onChange={(e) => handleInputChange(e)}
                  value={formData.country}
                  placeholder="Country"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                {errors.country && (
                  <span className="text-red-500 text-xs">{errors.country}</span>
                )}
              </div>
            </div>
            <div className="p-2">
              <label htmlFor="address">Address</label>
              <Textarea
                type="address"
                name="address"
                onChange={(e) => handleInputChange(e)}
                value={formData.address}
                placeholder="address"
                className="w-full border border-gray-300 rounded-md p-2"
              />
              {errors.address && (
                <span className="text-red-500 text-xs">{errors.address}</span>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorPage;

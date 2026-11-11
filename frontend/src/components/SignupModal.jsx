"use client";

import { useState, useEffect } from "react";
// useNavigate अब भी Home Page पर Redirect करने के लिए ज़रूरी है
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useRegisterMutation } from "../features/api/apiSlice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Country } from "country-state-city"; // ✅ Imported the package

// Skeleton loader (कोई बदलाव नहीं)
const FormSkeleton = () => (
  <div className="space-y-4 sm:space-y-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 sm:mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {[...Array(6)].map((_, index) => (
        <div key={index}>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      ))}
    </div>
    <div className="space-y-2 mt-4 sm:mt-6">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-2/4"></div>
      </div>
    </div>
    <div className="flex flex-col items-center mt-6 space-y-4">
      <div className="w-full md:w-1/2 h-10 sm:h-12 bg-gray-300 rounded-[10px]"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mt-4"></div>
    </div>
  </div>
);

export default function SignupModal({ onClose, onSwitchToLogin }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    address: "",
    country: "",
    termsAndConditions: false,
    subscribeNewsletter: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [register, { isLoading, isError, error }] = useRegisterMutation();

  // ✅ Get all countries from the package
  const allCountries = Country.getAllCountries();

  useEffect(() => {
    const shouldOpenSignup = sessionStorage.getItem("openSignupOnReturn");
    if (shouldOpenSignup) {
      openSignupModal(); // your function that opens the modal
      sessionStorage.removeItem("openSignupOnReturn");
    }
  }, []);

  // Validation functions (कोई बदलाव नहीं)
  const validateFullName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.length < 3) return "Full name must be at least 3 characters";
    if (!/^[a-zA-Z\s]+$/.test(name))
      return "Full name must only contain letters and spaces";
    return "";
  };

  const validateMobile = (mobile) => {
    if (!mobile.trim()) return "Mobile number is required";
    if (!/^[0-9]{10}$/.test(mobile))
      return "Enter a valid 10-digit mobile number";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) return "Enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Password must contain at least one special character (!@#$%^&*)";
    return "";
  };

  const validateAddress = (address) => {
    if (!address.trim()) return "Address is required";
    if (address.length < 4) return "Address must be at least 5 characters long";
    return "";
  };

  const validateCountry = (country) => {
    if (!country) return "Please select a country";
    return "";
  };

  const validateTerms = (checked) => {
    if (!checked) return "You must agree to the terms & conditions";
    return "";
  };

  // Handle Input Change (कोई बदलाव नहीं)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "mobileNumber") {
      const numericValue = value.replace(/\D/g, ""); // remove all non-numeric chars
      setFormData((prev) => ({ ...prev, [name]: numericValue }));

      const errorMsg = validateMobile(numericValue);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
      return; // stop further processing for this field
    }

    // Real-time validation
    let errorMsg = "";
    if (name === "fullName") errorMsg = validateFullName(value);
    if (name === "mobileNumber") errorMsg = validateMobile(value);
    if (name === "email") errorMsg = validateEmail(value);
    if (name === "password") errorMsg = validatePassword(value);
    if (name === "address") errorMsg = validateAddress(value);
    if (name === "country") errorMsg = validateCountry(value);
    if (name === "termsAndConditions") errorMsg = validateTerms(checked);

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // 🚀 Fix: Success Toast के बाद Modal बंद होगा और Login पर स्विच होगा
  const handleSignup = async (e) => {
    e.preventDefault();

    // Run all validations
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      mobileNumber: validateMobile(formData.mobileNumber),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      address: validateAddress(formData.address),
      country: validateCountry(formData.country),
      termsAndConditions: validateTerms(formData.termsAndConditions),
    };

    setErrors(newErrors);

    // अगर कोई error है तो submit रोक दो
    if (Object.values(newErrors).some((err) => err)) return;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        mobileNo: formData.mobileNumber,
        country: formData.country,
        address: formData.address,
      }).unwrap();

      // ✅ 1. Success Toast ट्रिगर करें
      toast.success("Account created successfully! Redirecting to Log In...", {
        position: "top-right",
        autoClose: 2000,
      });

      // ✅ 2. 50ms के छोटे अंतराल के बाद Modal बंद करें और Login पर स्विच करें
      setTimeout(() => {
        onClose();
        onSwitchToLogin();
      }, 50);
    } catch (err) {
      console.error("❌ Signup Failed:", err);

      // Error Toast
      toast.error(err?.data?.msg || "Signup failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Cross Button के लिए हैंडलर (Modal बंद और Home Page पर redirect)
  const handleCloseAndRedirect = () => {
    onClose(); // Modal को बंद करें
    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4 sm:px-6 ">
      <div
        className="  bg-white rounded-[20px] shadow-2xl w-full
    max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl
    max-h-[90vh]
    overflow-y-auto lg:overflow-hidden
    hide-scrollbar"
      >
        {/* Header */}
        <div className="w-full py-5 sm:py-6 rounded-t-[20px] bg-[#CBCCCB4D] flex items-center justify-center relative">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#264A3F]">
            Sign Up
          </h2>

          <button
            onClick={handleCloseAndRedirect}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <CloseIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 md:p-8">
          {isLoading ? (
            <FormSkeleton />
          ) : (
            <>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#264A3F] mb-6">
                Create an account
              </h3>

              {isError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">
                    {error?.data?.msg || "Signup failed"}
                  </p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-6">
                {/* GRID FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full rounded-md border p-3 focus:ring-[#264A3F] ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter Your Full Name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className={`w-full rounded-md border p-3 focus:ring-[#264A3F] ${
                        errors.mobileNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter Mobile Number"
                    />
                    {errors.mobileNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-md border p-3 focus:ring-[#264A3F] ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter Your Email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full rounded-md border p-3 pr-12 focus:ring-[#264A3F] ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter Strong Password"
                    />

                    {/* ✅ Fixed Eye Icon Position */}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-[48px] -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </button>

                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full rounded-md border p-3 focus:ring-[#264A3F] ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter Your Address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* ✅ Updated Country Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full rounded-md border p-3 focus:ring-[#264A3F] bg-white ${
                        errors.country ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Country</option>
                      {allCountries.map((country) => (
                        <option key={country.isoCode} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="termsAndConditions"
                      checked={formData.termsAndConditions}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#264A3F]"
                    />
                    <label className="ml-2 text-sm text-gray-900">
                      I have read and agree to the{" "}
                      <a
                        href="/terms"
                        className="text-blue-600 hover:underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          sessionStorage.setItem("openSignupOnReturn", "true");
                        }}
                      >
                        terms & conditions
                      </a>
                      .
                    </label>
                  </div>

                  {errors.termsAndConditions && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.termsAndConditions}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex flex-col items-center mt-6 space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-1/2 bg-[#264A3F] text-white py-3 rounded-[10px] font-semibold hover:bg-[#1e3a30] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? "Submitting..." : "Submit"}
                  </button>

                  <p className="text-center text-sm sm:text-base text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={onSwitchToLogin}
                      type="button"
                      className="text-[#264A3F] hover:underline"
                    >
                      Log In
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

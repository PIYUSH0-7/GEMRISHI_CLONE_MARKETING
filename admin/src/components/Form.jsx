"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TermsAndConditions from "./TermsAndConditions";

function Form() {
  const countryData = {
    countries: ["India"],
    state: [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Jammu and Kashmir",
    ],
  };

  const [data, setData] = useState(countryData);
  const [open, setOpen] = useState(false)

  // ✅ Form state keys now aligned
  const [formData, setFormData] = useState({
    addressType: "", // Mandatory
    fullName: "", // Mandatory
    email: "", // Mandatory
    mobileNo: "", // Mandatory
    addressLine1: "", // Mandatory
    addressLine2: "", // 
    landmark: "", // 
    city: "", // Mandatory
    pinCode: "", // Mandatory
    state: "Maharashtra", // Mandatory
    country: "India", // Mandatory
    note: "", // Optional
    terms: false, // Mandatory
    billingSame: false,
  });

  // ✅ Error state keys aligned with fields that need validation
  const [errors, setErrors] = useState({
    addressType: "", // Added
    fullName: "",
    email: "", // Added
    mobileNo: "",
    pinCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    landmark: "",
    country: "",
    state: "",
    terms: "",
    api: "",
  });
  const [isShaking, setIsShaking] = useState(false);

  const navigate = useNavigate();

  // ⭐ Load saved shipping details from localStorage on component mount
  useEffect(() => {
    const savedShippingDetails = localStorage.getItem("shippingDetails");
    if (savedShippingDetails) {
      try {
        const parsedData = JSON.parse(savedShippingDetails);
        setFormData(parsedData);
      } catch (error) {
        console.error(
          "❌ Error loading shipping details from localStorage:",
          error
        );
      }
    }
  }, []);

  // --- Validation Functions ---

  const validateAddressType = (type) => {
    if (!type.trim()) return "Address Type is required.";
    return "";
  };

  const validateFullName = (name) => {
    if (!name.trim()) return "Full Name is required.";
    if (name.length < 3) return "Name must be at least 3 characters.";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name should only contain letters.";
    return "";
  };
  
  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required.";
    // Basic email regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address.";
    return "";
  };

  const validateMobileNo = (mobile) => {
    if (!mobile.trim()) return "Mobile number is required.";
    if (!/^[0-9]{10}$/.test(mobile))
      return "Enter a valid 10-digit mobile number.";
    return "";
  };

  const validatePinCode = (code) => {
    if (!code.trim()) return "Postal Code is required.";
    if (!/^[0-9]{6}$/.test(code)) return "Enter a valid 6-digit postal code.";
    return "";
  };

  const validateAddressLine1 = (address) => {
    if (!address.trim()) return "Address Line 1 is required.";
    if (address.length < 10) return "Address must be at least 10 characters.";
    return "";
  };

    const validateAddressLine2 = (address) => {
    if (!address.trim()) return "Address Line 2 is required.";
    if (address.length < 10) return "Address must be at least 10 characters.";
    return "";
  };

  const validateCity = (city) => {
    if (!city.trim()) return "City/District is required.";
    return "";
  };

    const validateLandmark = (landmark) => {
    if (!landmark.trim()) return "Landmark is required.";
    return "";
  };

  const validateCountry = (country) => {
    if (!country) return "Country selection is required.";
    return "";
  };

  const validateState = (state) => {
    if (!state) return "State selection is required.";
    return "";
  };

  const validateTerms = (checked) => {
    if (!checked) return "You must agree to the Terms & Conditions to proceed.";
    return "";
  };

  // --- Change Handler ---

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    
    // Input restrictions
    if (id === "fullName" && type !== "checkbox" && !/^[a-zA-Z\s]*$/.test(value)) return;
    if (id === "mobileNo" && type !== "checkbox" && (!/^[0-9]*$/.test(value) || value.length > 10)) return;
    if (id === "pinCode" && type !== "checkbox" && (!/^[0-9]*$/.test(value) || value.length > 6)) return;
    
    setFormData((prevData) => ({ ...prevData, [id]: finalValue }));

    // Real-time validation check
    let errorMsg = "";
    if (id === "addressType") errorMsg = validateAddressType(finalValue);
    else if (id === "fullName") errorMsg = validateFullName(finalValue);
    else if (id === "email") errorMsg = validateEmail(finalValue);
    else if (id === "mobileNo") errorMsg = validateMobileNo(finalValue);
    else if (id === "pinCode") errorMsg = validatePinCode(finalValue);
    else if (id === "addressLine1") errorMsg = validateAddressLine1(finalValue);
    else if (id === "addressLine2") errorMsg = validateAddressLine2(finalValue);
    else if (id === "city") errorMsg = validateCity(finalValue);
    else if (id === "landmark") errorMsg = validateLandmark(finalValue);
    else if (id === "country") errorMsg = validateCountry(finalValue);
    else if (id === "state") errorMsg = validateState(finalValue);
    else if (id === "terms") errorMsg = validateTerms(finalValue);

    setErrors((prev) => ({ ...prev, [id]: errorMsg, api: "" }));
  };

  // --- Submit Handler ---

  const handleSubmit = () => {
    // 1. Run all specific validations for mandatory fields
    const newErrors = {
      addressType: validateAddressType(formData.addressType), // Added
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email), // Added
      mobileNo: validateMobileNo(formData.mobileNo),
      pinCode: validatePinCode(formData.pinCode),
      addressLine1: validateAddressLine1(formData.addressLine1),
      addressLine2: validateAddressLine2(formData.addressLine2),
      city: validateCity(formData.city),
      landmark: validateCity(formData.landmark),
      country: validateCountry(formData.country),
      state: validateState(formData.state),
      terms: validateTerms(formData.terms),
      api: "",
    };

    setErrors(newErrors);

    // 2. Check for overall form validity (only mandatory fields)
    const requiredValidationKeys = [
      "addressType", // Mandatory
      "fullName", // Mandatory
      "email", // Mandatory
      "mobileNo", // Mandatory
      "pinCode", // Mandatory
      "addressLine1", // Mandatory
      "addressLine2", // Mandatory
      "city", // Mandatory
      "landmark", // Mandatory
      "country", // Mandatory
      "state", // Mandatory
      "terms", // Mandatory
    ];

    const isFormValid = requiredValidationKeys.every(
      (key) => !newErrors[key]
    );

    if (!isFormValid) {
      setErrors((prev) => ({
        ...prev,
        api: "Please fill in all the required details and agree to the terms to proceed.",
      }));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    // ⭐ Save shipping details to localStorage
    localStorage.setItem("shippingDetails", JSON.stringify(formData));

    navigate("/retailer/review-confirm");
  };

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-0">
      <div className="w-full">
        <p className="text-xl sm:text-2xl ">Shipping Details</p>
      </div>

      {errors.api && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          {errors.api}
        </div>
      )}

      {/* --- Row 1: Address Type & Full Name --- */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="addressType" className="text-lg sm:text-xl text-[#666464]">
            Address Type *
          </label>
          {/* Address Type Select (Mandatory) */}
          <select
            id="addressType"
            value={formData.addressType}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.addressType ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          >
            <option value="">Select Address Type</option>
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
          {errors.addressType && (
            <p className="text-red-500 text-sm mt-1">{errors.addressType}</p>
          )}
        </div>
        
        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="fullName" className="text-lg sm:text-xl text-[#666464]">
            Full Name *
          </label>
          {/* Full Name Input (Mandatory) */}
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.fullName ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>
      </div>

      {/* --- Row 2: Email & Mobile Number --- */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="email" className="text-lg sm:text-xl text-[#666464]">
            Email *
          </label>
          {/* Email Input (Mandatory) */}
          <input
            type="email"
            id="email"
            value={formData.email}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.email ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="mobileNo" className="text-lg sm:text-xl text-[#666464]">
            Mobile Number *
          </label>
          {/* Mobile Number Input (Mandatory) */}
          <input
            type="tel"
            id="mobileNo"
            value={formData.mobileNo}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.mobileNo ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          />
          {errors.mobileNo && (
            <p className="text-red-500 text-sm mt-1">{errors.mobileNo}</p>
          )}
        </div>
      </div>

      {/* --- Row 3: Postal Code & Address Line 1 --- */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="pinCode" className="text-lg sm:text-xl text-[#666464]">
            Postal Code *
          </label>
          {/* Postal Code Input (Mandatory) */}
          <input
            type="text"
            id="pinCode"
            value={formData.pinCode}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.pinCode ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          />
          {errors.pinCode && (
            <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>
          )}
        </div>

        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="addressLine1" className="text-lg sm:text-xl text-[#666464]">
            Address Line 1 *
          </label>
          {/* Address Line 1 Input (Mandatory) */}
          <input
            type="text"
            id="addressLine1"
            value={formData.addressLine1}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.addressLine1 ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          />
          {errors.addressLine1 && (
            <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
          )}
        </div>
      </div>
      
      {/* --- Row 4: Address Line 2 & Landmark --- */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="addressLine2" className="text-lg sm:text-xl text-[#666464]">
            Address Line 2
          </label>
          {/* Address Line 2 Input (Optional) */}
          <input
            type="text"
            id="addressLine2"
            value={formData.addressLine2}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none border-[#AEABAB]`}
            onChange={handleChange}
          />
          {errors.addressLine2 && (
            <p className="text-red-500 text-sm mt-1">{errors.addressLine2}</p>
          )}
        </div>

        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="landmark" className="text-lg sm:text-xl text-[#666464]">
            Landmark 
          </label>
          {/* Landmark Input (Optional) */}
          <input
            type="text"
            id="landmark"
            value={formData.landmark}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none border-[#AEABAB]`}
            onChange={handleChange}
          />
          {errors.landmark && (
            <p className="text-red-500 text-sm mt-1">{errors.landmark}</p>
          )}
        </div>
      </div>

      {/* --- Row 5: City/District & Country --- */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="city" className="text-lg sm:text-xl text-[#666464]">
            City/District *
          </label>
          {/* City/District Input (Mandatory) */}
          <input
            type="text"
            id="city"
            value={formData.city}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.city ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="country" className="text-lg sm:text-xl text-[#666464]">
            Country *
          </label>
          {/* Country Select (Mandatory) */}
          <select
            id="country"
            value={formData.country}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.country ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          >
            {data.countries.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country}</p>
          )}
        </div>
      </div>

      {/* --- Row 6: State & Note --- */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="state" className="text-lg sm:text-xl text-[#666464]">
            State *
          </label>
          {/* State Select (Mandatory) */}
          <select
            id="state"
            value={formData.state}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none ${
              errors.state ? "border-red-500" : "border-[#AEABAB]"
            }`}
            onChange={handleChange}
          >
            {data.state.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>
        
        <div className="w-full sm:w-1/2 flex flex-col gap-1">
          <label htmlFor="note" className="text-lg sm:text-xl text-[#666464]">
            Note (e.g., Delivery Instructions)
          </label>
          {/* Note Input (Optional) */}
          <input
            type="text"
            id="note"
            value={formData.note}
            className={`w-full h-[53px] border rounded-[10px] pl-2 text-lg sm:text-xl focus:ring-2 focus:ring-[#264A3F] outline-none border-[#AEABAB]`}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* --- Terms & Conditions --- */}
      <div className="w-full mt-6">
        <div className="flex flex-col gap-1 pt-4">
          <div className="flex flex-row gap-2 sm:gap-4 items-start">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms}
              className="w-[25px] h-[25px] flex-shrink-0 accent-[#264A3F] cursor-pointer mt-1"
              onChange={handleChange}
            />
            <p className="text-[#666464] text-base sm:text-lg lg:text-[20px]">
              I have read and agree to the{" "}
              <span className="text-[#4960E4] cursor-pointer"
              onClick={() => setOpen(true)}
              >
                Terms & Condition
              </span> *
            </p>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-sm mt-1 ml-9">{errors.terms}</p>
          )}
        </div>
      </div>

      {/* --- Submit Button --- */}
      <div className="w-full flex items-center justify-center mt-8 pb-4">
        <motion.button
          onClick={handleSubmit}
          className="w-full max-w-[458px] h-[60px] bg-[#264A3F] rounded-[10px] text-lg sm:text-xl font-bold text-[#FFFFFF] cursor-pointer"
          variants={shakeVariants}
          animate={isShaking ? "shake" : ""}
        >
          Next
        </motion.button>
      </div>
      {open && <TermsAndConditions open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}

export default Form;
"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Country, State, City } from "country-state-city";
import { useSelector } from "react-redux";
// Make sure this path is correct based on your folder structure!
import { useProfileQuery } from "../../features/api/apiSlice";

function Form() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Check if user is logged in and fetch profile ---
  const user = useSelector((state) => state.auth.userInfo);
  const { data: profileData } = useProfileQuery(undefined, {
    skip: !user, // Only fetch if the user is logged in
  });
  //Add by pawan------------------------------------------------------------------------
  const cartItems = useSelector((state) => state.cart.items) || [];
  const hasTrackedFormStart = useRef(false);
  //Add by pawan-------------------------------------------------------------------------

  // ------------------ State Management ------------------
  const [formData, setFormData] = useState({
    address: {
      fullName: "",
      email: "",
      mobileNo: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      pinCode: "",
      district: "",
      state: "",
      country: "",
      note: "",
    },
    terms: false,
    billingSame: false,
  });

  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);

  // ------------------ Dynamic Country/State/City Data ------------------
  const allCountriesData = Country.getAllCountries();
  const allCountries = allCountriesData.map((c) => c.name);

  const selectedCountryObj = allCountriesData.find(
      (c) => c.name === formData.address.country
  );
  const countryIso = selectedCountryObj?.isoCode;

  const allStatesData = countryIso ? State.getStatesOfCountry(countryIso) : [];
  const availableStates = allStatesData.map((s) => s.name);

  const selectedStateObj = allStatesData.find(
      (s) => s.name === formData.address.state
  );
  const stateIso = selectedStateObj?.isoCode;

  const availableCities =
      countryIso && stateIso
          ? City.getCitiesOfState(countryIso, stateIso).map((c) => c.name)
          : [];

  if (formData.address.state && !availableStates.includes(formData.address.state)) {
    availableStates.unshift(formData.address.state);
  }
  if (formData.address.city && !availableCities.includes(formData.address.city)) {
    availableCities.unshift(formData.address.city);
  }

  // ------------------ Auto-Fill Logic (Profile -> LocalStorage) ------------------
  useEffect(() => {
    const saved = localStorage.getItem("shippingDetails");

    if (saved) {
      // 1. If user already started filling out the form, prioritize local storage
      try {
        setFormData(JSON.parse(saved));
      } catch (err) {
        console.error("❌ Error parsing localStorage data:", err);
      }
    } else if (profileData?.user) {
      // 2. If no local storage, but user is logged in, auto-fill from profile!
      const u = profileData.user;
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          fullName: u.fullName || "",
          email: u.email || "",
          mobileNo: u.mobileNo || "",
          addressLine1: u.address || "",
          city: u.city || "",
          pinCode: u.pinCode || "",
        }
      }));
    }
  }, [profileData]);

  // ------------------ Validators ------------------
  const validators = {
    fullName: (v) => {
      const val = v ? String(v) : "";
      if (!val.trim()) return "Full name is required.";
      if (val.length < 3) return "Name must be at least 3 characters.";
      if (!/^[a-zA-Z\s]+$/.test(val)) return "Name should only contain letters.";
      return "";
    },
    email: (v) => {
      const val = v ? String(v) : "";
      if (!val.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email address.";
      return "";
    },
    mobileNo: (v) => {
      const val = v ? String(v) : "";
      if (!val.trim()) return "Mobile number is required.";
      if (!/^[0-9]{10}$/.test(val)) return "Enter a valid 10-digit mobile number.";
      return "";
    },
    addressLine1: (v) => {
      const val = v ? String(v) : "";
      if (!val.trim()) return "Address Line 1 is required.";
      if (val.length < 10) return "Address must be at least 10 characters.";
      return "";
    },
    pinCode: (v) => {
      const val = v ? String(v) : "";
      if (!val.trim()) return "Postal Code is required.";
      if (!/^[0-9]{6}$/.test(val)) return "Enter a valid 6-digit postal code.";
      return "";
    },
    country: (v) => (!v ? "Country selection is required." : ""),
    state: (v) => (!v ? "State selection is required." : ""),
    city: (v) => (!v ? "City selection is required." : ""),
    district: (v) => {
      const val = v ? String(v) : "";
      if (!val.trim()) return "District is required.";
      return "";
    },
    terms: (v) => (!v ? "You must agree to the Terms & Conditions to proceed." : ""),
  };

  // ------------------ Handlers ------------------
  const handleChange = (e) => {
    //Add by pawan----------------------------------------------------------------
    if (!hasTrackedFormStart.current) {
      hasTrackedFormStart.current = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "form_start", form_name: "shipping_address" });
    }

    if (typeof window.clarity === "function") {
      window.clarity("set", "address_last_active_field", String(e.target.name || "").replace("address.", ""));
    }
    //Add by pawan----------------------------------------------------------------
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];

      setFormData((prev) => {
        const newAddress = { ...prev.address, [key]: value };

        if (key === "country" && prev.address.country !== value) {
          newAddress.state = "";
          newAddress.city = "";
        } else if (key === "state" && prev.address.state !== value) {
          newAddress.city = "";
        }

        return { ...prev, address: newAddress };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    for (const key in validators) {
      if (key === "terms") newErrors[key] = validators[key](formData.terms);
      else if (key in formData.address)
        newErrors[key] = validators[key](formData.address[key]);
    }

    setErrors(newErrors);
    const isValid = Object.values(newErrors).every((err) => !err);

    if (!isValid) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    localStorage.setItem("shippingDetails", JSON.stringify(formData));
        //Add by pawan----------------------------------------------------------------
    // this "form" is a div, not a real <form>, so GTM's native Form
    // Submission trigger can never see it — push both events manually.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: "add_shipping_info",
      ecommerce: {
        currency: "INR",
        value: cartItems.reduce(
          (sum, ci) => sum + (Number(ci.totalPrice) || 0),
          0
        ),
        shipping_tier: "Standard",
        items: cartItems.map((ci) => {
          const isJewelry = ci.itemType === "Jewelry";
          const hasJewelryCustomization = !!ci.customization?.jewelryId;
          const name = isJewelry
            ? ci.item?.jewelryName
            : hasJewelryCustomization
            ? ci.customization.jewelryId?.jewelryName
            : ci.item?.name;
          const qty = Number(ci.quantity) || 1;
          return {
           item_id: String(ci.item?.sku || ci.item?._id || ci._id || ""), // add by pawan
            item_name: name || "Unnamed Item",
            item_brand: "Gemrishi",
            item_category: ci.itemType || "",
            price: qty ? Number((ci.totalPrice / qty).toFixed(2)) : Number(ci.totalPrice) || 0,
            quantity: qty,
          };
        }),
      },
    });
 
    window.dataLayer.push({ event: "form_submit", form_name: "shipping_address" });
    //Add by pawan--------------------------------------------------------------------------
    navigate("/review_And/confirm/details", { state: { productId: location?.state?.productId } });
  };

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  };

  // ------------------ UI ------------------
  return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-0">
        <p className="text-xl sm:text-2xl font-medium mb-4">Shipping Details</p>

        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          <InputField label="Full Name" name="address.fullName" value={formData.address.fullName} onChange={handleChange} error={errors.fullName} />
          <InputField label="Mobile Number" type="tel" name="address.mobileNo" value={formData.address.mobileNo} onChange={handleChange} error={errors.mobileNo} />
        </div>

        <div className="mt-4">
          <InputField label="Email" type="email" name="address.email" value={formData.address.email} onChange={handleChange} error={errors.email} />
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-4 relative">
          <div className="w-full sm:w-2/3">
            <InputField label="Address Line 1" name="address.addressLine1" value={formData.address.addressLine1} onChange={handleChange} error={errors.addressLine1} />
          </div>
          <div className="w-full sm:w-1/3 relative">
            <InputField label="Postal Code (PIN)" name="address.pinCode" value={formData.address.pinCode} onChange={handleChange} error={errors.pinCode} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          <SelectField label="Country" name="address.country" value={formData.address.country} options={allCountries} onChange={handleChange} error={errors.country} />
          <SelectField label="State" name="address.state" value={formData.address.state} options={availableStates} onChange={handleChange} error={errors.state} />
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          <SelectField label="City" name="address.city" value={formData.address.city} options={availableCities} onChange={handleChange} error={errors.city} />
          <InputField label="District" name="address.district" value={formData.address.district} onChange={handleChange} error={errors.district} />
        </div>

        <div className="mt-6">
          <div className="flex items-start gap-3 pt-4">
            <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} className="w-[25px] h-[25px] accent-[#264A3F] cursor-pointer mt-1" />
            <p className="text-[#666464] text-base sm:text-lg">
              I have read and agree to the <a href="/terms" className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">terms & conditions</a>.
            </p>
          </div>
          {errors.terms && <p className="text-red-500 text-sm mt-1 ml-9">{errors.terms}</p>}
        </div>

        <div className="w-full flex justify-center mt-8 pb-4">
          <motion.button onClick={handleSubmit} className="w-full max-w-[458px] h-[60px] bg-[#264A3F] rounded-[10px] text-lg sm:text-xl font-bold text-white cursor-pointer hover:bg-[#1f3d34] transition-colors" variants={shakeVariants} animate={isShaking ? "shake" : ""}>
            Next
          </motion.button>
        </div>
      </div>
  );
}

// ------------------ Reusable Components ------------------
const InputField = ({ label, name, value, onChange, error, type = "text" }) => (
    <div className="w-full flex flex-col">
      <label className="text-lg text-[#666464] mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} className={`h-[53px] border rounded-[10px] pl-3 text-lg outline-none transition-shadow focus:ring-2 focus:ring-[#264A3F] ${error ? "border-red-500" : "border-[#AEABAB]"}`} />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

const SelectField = ({ label, name, value, options, onChange, error }) => (
    <div className="w-full flex flex-col">
      <label className="text-lg text-[#666464] mb-1">{label}</label>
      <select name={name} value={value} onChange={onChange} className={`h-[53px] border rounded-[10px] pl-3 text-lg outline-none transition-shadow focus:ring-2 focus:ring-[#264A3F] bg-white ${error ? "border-red-500" : "border-[#AEABAB]"}`}>
        <option value="">Select {label}</option>
        {options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

export default Form;
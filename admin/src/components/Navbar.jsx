"use client";
// --------add By Pawan--------------
import { useState, useEffect } from "react";
import Logo from "../assets/Logo.svg";
import order from "../assets/order.svg";
import dashboard from "../assets/dashboard.svg";
import product from "../assets/product.svg";
import stock from "../assets/promotion.svg";
import customers from "../assets/Customer.svg";
import report from "../assets/report (1).svg";
import setting from "../assets/setting.svg";
import logoutImg from "../assets/logout.svg";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import { useLogoutMutation } from "../features/api/apiSlice";
import { toast } from "react-toastify";
import gemstoneCategory from "../assets/carbon_gem.svg";
import jewelleryCategory from "../assets/jewelry.svg";
import retailer from "../assets/carbon_customer.svg";
import metalRatesLogo from "../assets/metalrate.svg";
import globalLogo from "../assets/icons8-global-50.png";
import offerLogo from "../assets/icons8-offer-50.png";
import contactLogo from "../assets/icons8-contact-50.png";
import subscribersLogo from "../assets/icons8-subscribers-64.png";
import feedbackLogo from "../assets/icons8-feedback-50.png";

function Navbar({ isSidebarOpen, toggleSidebar, closeSidebar }) {
  const [activeItem, setActiveItem] = useState("dashboard");
  const baseUrl = import.meta.env.VITE_BASE_SITE_URL;
  const menuMap = {
    dashboard: "/",
    products: "/products",
    orderLists: "/orders",
    abandonedCheckouts: "/abandoned-checkouts",
    productStock: "/promotions-list",
    customers: "/customers",
    reports: "/reports",
    settings: "/settings",
    metalRates: "/metal-rates",
    vendors: "/vendors",
    category: "/category",
    categoryOrder: "/category-order",
    jewelleryCategory: "/jewellery-category",
    countryOrigin: "/country-origin",
    offer: "/offer",
    contacts: "/contacts",
    subscribers: "/subscribers",
    feedbacks: "/feedbacks",
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    const activeEntry = Object.entries(menuMap).find(
      ([_, route]) => path === route || path === `${route}/`
    );
    if (activeEntry) {
      setActiveItem(activeEntry[0]);
    }
  }, [location.pathname]);

  const handleItemClick = (itemName) => {
    if (activeItem !== itemName) {
      navigate(menuMap[itemName]);
    }
  };

  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    const baseUrl = import.meta.env.VITE_BASE_SITE_URL;
    try {
      const res = await logout().unwrap(); // unwrap to get actual response

      toast.success("Logout successful");
      localStorage.removeItem("adminName");
      localStorage.removeItem("adminToken");
      // redirect to login
      navigate("/login");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Logout Failed"
      );
    }
  };

  const getItemClasses = (itemName) => {
    const baseClasses =
      "w-full h-[45px] flex items-center rounded-md gap-3 px-4 cursor-pointer";

    if (activeItem === itemName) {
      return `${baseClasses} bg-[#214436] text-white`;
    }
    return `${baseClasses} text-black hover:bg-gray-100`;
  };

  const getImageClasses = (itemName) => {
    const baseClasses = "w-5 h-5";

    if (activeItem === itemName) {
      return `${baseClasses} invert`;
    }
    return baseClasses;
  };

  const getUtilityItemClasses = () => {
    return "w-full h-[45px] flex items-center rounded-md gap-3 px-4 text-gray-700 hover:bg-gray-200 cursor-pointer";
  };

  const getUtilityImageClasses = () => {
    return "w-5 h-5 ";
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <nav className="p-4 flex-1">
        <div
          className="flex gap-2 w-full h-auto items-start cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={Logo || "/placeholder.svg"}
            alt="logo"
            className="h-[50px] w-[50px]"
          />
          <h1 className="text-2xl font-serif">Gemrishi</h1>
        </div>
        <ul className="mt-[20%]">
          <li
            className={getItemClasses("dashboard")}
            onClick={() => handleItemClick("dashboard")}
          >
            <img
              src={dashboard || "/placeholder.svg"}
              alt=""
              className={getImageClasses("dashboard")}
            />
            <div
              className={
                activeItem === "dashboard" ? "text-white" : "text-gray-700"
              }
            >
              Dashboard
            </div>
          </li>
          <li
            className={activeItem === "category" ? getItemClasses("category") : activeItem === "categoryOrder" ? getItemClasses("categoryOrder") : getItemClasses("category")}
            onClick={() => handleItemClick("category")}
          >
            <img
              src={gemstoneCategory || "/placeholder.svg"}
              alt=""
              className={activeItem === "category" ? getImageClasses("category") : activeItem === "categoryOrder" ? getImageClasses("categoryOrder") : getImageClasses("category")}
            />
            <div
              className={
                activeItem === "category" || activeItem === "categoryOrder"
                  ? "text-white text-[15px]"
                  : "text-gray-700 text-[15px]"
              }
            >
              Gemstone
            </div>
          </li>
          <li
            className={getItemClasses("jewelleryCategory")}
            onClick={() => handleItemClick("jewelleryCategory")}
          >
            <img
              src={jewelleryCategory || "/placeholder.svg"}
              alt=""
              className={getImageClasses("jewelleryCategory")}
            />
            <div
              className={
                activeItem === "jewelleryCategory"
                  ? "text-white"
                  : "text-gray-700"
              }
            >
              Jewellery
            </div>
          </li>
          <li
            className={getItemClasses("products")}
            onClick={() => handleItemClick("products")}
          >
            <img
              src={product || "/placeholder.svg"}
              alt=""
              className={getImageClasses("products")}
            />
            <div
              className={
                activeItem === "products" ? "text-white" : "text-gray-700"
              }
            >
              Products
            </div>
          </li>
          <li
            className={getItemClasses("orderLists")}
            onClick={() => handleItemClick("orderLists")}
          >
            <img
              src={order || "/placeholder.svg"}
              alt=""
              className={getImageClasses("orderLists")}
            />
            <div
              className={
                activeItem === "orderLists" ? "text-white" : "text-gray-700"
              }
            >
              Order Lists
            </div>
          </li>
          <li
            className={getItemClasses("abandonedCheckouts")}
            onClick={() => handleItemClick("abandonedCheckouts")}
          >
            <img
              src={order || "/placeholder.svg"}
              alt=""
              className={getImageClasses("abandonedCheckouts")}
            />
            <div
              className={
                activeItem === "abandonedCheckouts" ? "text-white" : "text-gray-700"
              }
            >
              Abandoned Carts
            </div>
          </li>
          <li
            className={getItemClasses("productStock")}
            onClick={() => handleItemClick("productStock")}
          >
            <img
              src={stock || "/placeholder.svg"}
              alt=""
              className={getImageClasses("productStock")}
            />
            <div
              className={
                activeItem === "productStock" ? "text-white" : "text-gray-700"
              }
            >
              Promotions
            </div>
          </li>
          <li
            className={getItemClasses("customers")}
            onClick={() => handleItemClick("customers")}
          >
            <img
              src={customers || "/placeholder.svg"}
              alt=""
              className={getImageClasses("customers")}
            />
            <div
              className={
                activeItem === "customers" ? "text-white" : "text-gray-700"
              }
            >
              Customers
            </div>
          </li>
          <li
            className={getItemClasses("reports")}
            onClick={() => handleItemClick("reports")}
          >
            <img
              src={report || "/placeholder.svg"}
              alt=""
              className={getImageClasses("reports")}
            />
            <div
              className={
                activeItem === "reports" ? "text-white" : "text-gray-700"
              }
            >
              Reports
            </div>
          </li>

          <li
            className={getItemClasses("metalRates")}
            onClick={() => handleItemClick("metalRates")}
          >
            <img
              src={metalRatesLogo || "/placeholder.svg"}
              alt=""
              className={getImageClasses("feedbacks")}
            />
            <div
              className={
                activeItem === "metalRates" ? "text-white" : "text-gray-700"
              }
            >
              Metal Rates
            </div>
          </li>

          <li
            className={getItemClasses("vendors")}
            onClick={() => handleItemClick("vendors")}
          >
            <img
              src={retailer || "/placeholder.svg"}
              alt=""
              className={getImageClasses("vendors")}
            />
            <div
              className={
                activeItem === "vendors" ? "text-white" : "text-gray-700"
              }
            >
              Retailers
            </div>
          </li>
          <li
            className={getItemClasses("countryOrigin")}
            onClick={() => handleItemClick("countryOrigin")}
          >
            <img
              src={globalLogo || "/placeholder.svg"}
              alt=""
              className={getImageClasses("countryOrigin")}
            />
            <div
              className={
                activeItem === "countryOrigin" ? "text-white" : "text-gray-700"
              }
            >
              Origin Country
            </div>
          </li>
          <li
            className={getItemClasses("offer")}
            onClick={() => handleItemClick("offer")}
          >
            <img
              src={offerLogo || "/placeholder.svg"}
              alt=""
              className={getImageClasses("offer")}
            />
            <div
              className={
                activeItem === "offer" ? "text-white" : "text-gray-700"
              }
            >
              Offers
            </div>
          </li>

          <li
            className={getItemClasses("contacts")}
            onClick={() => handleItemClick("contacts")}
          >
            <img
              src={contactLogo || "/placeholder.svg"}
              alt=""
              className={getImageClasses("contacts")}
            />
            <div
              className={
                activeItem === "contacts" ? "text-white" : "text-gray-700"
              }
            >
              Contacts
            </div>
          </li>
          <li
            className={getItemClasses("subscribers")}
            onClick={() => handleItemClick("subscribers")}
          >
            <img
              src={subscribersLogo || "/placeholder.svg"}
              alt=""
              className={getImageClasses("subscribers")}
            />
            <div
              className={
                activeItem === "subscribers" ? "text-white" : "text-gray-700"
              }
            >
              Subscribers
            </div>
          </li>
          <li
            className={getItemClasses("feedbacks")}
            onClick={() => handleItemClick("feedbacks")}
          >
            <img
              src={feedbackLogo || "/placeholder.svg"}
              alt=""
              className={getImageClasses("subscribers")}
            />
            <div
              className={
                activeItem === "feedbacks" ? "text-white" : "text-gray-700"
              }
            >
              Feedbacks
            </div>
          </li>
        </ul>
      </nav>
      {/* 
      <nav className="text-black p-4">
        <ul className="space-y-2">
          <li
            className={getItemClasses("settings")}
            onClick={() => handleItemClick("settings")}
          >
            <img
              src={setting || "/placeholder.svg"}
              alt=""
              className={getUtilityImageClasses()}
            />
            <div
              className={
                activeItem === "settings" ? "text-white" : "text-gray-700"
              }
            >
              Settings
            </div>
          </li>
          <li className={getUtilityItemClasses()} onClick={handleLogout}>
            <img
              src={logoutImg || "/placeholder.svg"}
              alt=""
              className={getUtilityImageClasses()}
            />
            <div>Logout</div>
          </li>
        </ul>
      </nav> */}
    </div>
  );
}

export default Navbar;

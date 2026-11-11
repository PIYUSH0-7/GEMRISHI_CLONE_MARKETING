"use client";

import { useState, useEffect } from "react";
import Logo from "../assets/Logo.svg";
import order from "../assets/order.svg";
import dashboard from "../assets/dashboard.svg";
import product from "../assets/product.svg";
import stock from "../assets/stock.svg";
import customers from "../assets/Customer.svg";
import report from "../assets/report (1).svg";
import setting from "../assets/setting.svg";
import logoutImg from "../assets/logout.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../features/api/apiSlice";
import { toast } from "react-toastify";
import cartLogo from "../assets/icons8-cart-50.png"
import buyBackLogo from "../assets/Buy-Back.svg"

function RetailerNavbar({ isSidebarOpen, toggleSidebar, closeSidebar }) {
  const [activeItem, setActiveItem] = useState("dashboard");
  const baseUrl = import.meta.env.VITE_BASE_SITE_URL;
  const menuMap = {
    dashboard: "/retailer/dashboard",
    product: "/retailer/products",
    cart: "/retailer/cart",
    orders: "/retailer/orders",
    productStock: "/retailer/product-stock",
    buyBack: "/retailer/buy-back-portal"
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
    setActiveItem(itemName);
    navigate(menuMap[itemName]);
  };

  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    const baseUrl = import.meta.env.VITE_BASE_SITE_URL;
    try {
      const res = await logout().unwrap(); // unwrap to get actual response

      toast.success("Logout successful");
      localStorage.removeItem("adminName");
      // redirect to login
      navigate(`${baseUrl}/login`);
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
    <div className="h-full flex flex-col">
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
            className={getItemClasses("product")}
            onClick={() => handleItemClick("product")}
          >
            <img
              src={product || "/placeholder.svg"}
              alt=""
              className={getImageClasses("product")}
            />
            <div
              className={
                activeItem === "product" ? "text-white" : "text-gray-700"
              }
            >
              Products
            </div>
          </li>
          <li
            className={getItemClasses("cart")}
            onClick={() => handleItemClick("cart")}
          >
            <img
              src={cartLogo || "/placeholder.svg"}
              alt=""
              className={getImageClasses("cart")}
            />
            <div
              className={activeItem === "cart" ? "text-white" : "text-gray-700"}
            >
              Cart
            </div>
          </li>
          <li
            className={getItemClasses("orders")}
            onClick={() => handleItemClick("orders")}
          >
            <img
              src={order || "/placeholder.svg"}
              alt=""
              className={getImageClasses("orders")}
            />
            <div
              className={
                activeItem === "orders" ? "text-white" : "text-gray-700"
              }
            >
              Orders
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
              Product Stock
            </div>
          </li>
          <li
            className={getItemClasses("buyBack")}
            onClick={() => handleItemClick("buyBack")}
          >
            <img
              src={buyBackLogo || "/placeholder.svg"}
              alt=""
              className={getImageClasses("buyBack")}
            />
            <div
              className={
                activeItem === "buyBack" ? "text-white" : "text-gray-700"
              }
            >
              Buy-Back
            </div>
          </li>
        </ul>
      </nav>

      {/* <nav className="text-black p-4">
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

export default RetailerNavbar;

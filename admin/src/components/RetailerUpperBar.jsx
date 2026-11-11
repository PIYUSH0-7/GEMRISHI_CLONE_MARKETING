import React from "react";
import { FaSearch, FaBars } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import notification from "../assets/notificationIcon.svg";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLoginMutation,
  useLogoutMutation,
  useRetailerLogoutMutation,
} from "../features/api/apiSlice";
import { toast } from "react-toastify";
import { store } from "../app/store";
import { apiSlice } from "../features/api/apiSlice";

function RetailerUpperBar({ toggleSidebar }) {
  const username = localStorage.getItem("retailerName") || "Admin";
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const { avatarUrl } = useOutletContext() || "";

  const [logout] = useRetailerLogoutMutation();

  const handleLogout = async () => {
    try {
      const res = await logout().unwrap(); // unwrap to get actual response

      toast.success("Logout successful");
      localStorage.removeItem("retailerName");

      sessionStorage.clear();
      store.dispatch(apiSlice.util.resetApiState());

      // redirect to login
      navigate("/retailer/login", { replace: true });
      setTimeout(() => {
        window.history.pushState(null, "", "/retailer/login");
        window.onpopstate = () => {
          window.history.go(1);
        };
      }, 0);
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Logout Failed"
      );
    }
  };

  return (
    <>
      <div className="w-full h-[60px] bg-white flex items-center">
        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden flex items-center pl-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <FaBars size={20} />
          </button>
        </div>

        {/* Desktop Left Section */}
        <div className="hidden lg:flex w-[50%] h-full items-center">
          <div className="w-[90px] h-full"></div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden flex-1 px-4"></div>

        {/* Right Section */}
        <div className="flex items-center justify-end gap-4 lg:gap-14 pr-4 lg:pr-6 lg:w-[50%]">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle size={32} className="text-gray-400" />
            )}
            <span className="hidden sm:block text-gray-800 font-medium">
              {username}
            </span>
          </div>
        </div>
        {/* Dropdown Popup */}
        {open && (
          <div className="absolute right-4 top-12 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                navigate("/retailer/settings");
                setOpen(false);
              }}
            >
              Settings
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(RetailerUpperBar);

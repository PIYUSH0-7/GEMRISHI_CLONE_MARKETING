import { useEffect, useState } from "react";
import UpperBar from "../../components/UpperBar";
import RetailerNavbar from "../../components/RetailerNavbar";
import CartItem from "../../components/CartItem";
import ShoppingMap from "../../components/ShoppingMap";
import Form from "../../components/Form";
import RetailerUpperBar from "../../components/RetailerUpperBar";
import { useGetCartQuery } from "../../features/api/apiSlice";
import { useNavigate } from "react-router-dom";

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
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
const cartItems = [
  {
    _id: "1",
    name: "Natural & Certified Blue Sapphire (Neelam)",
    itemId: "K14668",
    weight: "2.54 Ct.",
    carat: "3",
    length: "8.56",
    width: "7.25",
    price: 62000,
    image: "https://example.com/blue-sapphire.jpg",
  },
  {
    _id: "1",
    name: "Natural & Certified Blue Sapphire (Neelam)",
    itemId: "K14668",
    weight: "2.54 Ct.",
    carat: "3",
    length: "8.56",
    width: "7.25",
    price: 62000,
    image: "https://example.com/blue-sapphire.jpg",
  },
];

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
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
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

function ReviewAndConfirm() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery();

  const address = JSON.parse(localStorage.getItem("shippingDetails"));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200`}
      >
        <RetailerNavbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden`}
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
        <RetailerNavbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Main Content */}
      <div
        className={`w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col`}
      >
        <div className="w-full sticky top-0 z-30">
          <RetailerUpperBar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="mb-2">
            <h2 className="font-semibold text-2xl">Order Summrary</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 flex">
            <div className="w-[70%]">
              <ShoppingMap activeStep={2} />
              <div className="p-6 w-full mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Order Summary
                </h2>

                <div className="space-y-2 text-gray-700 mb-4">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date().toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Items:</span>{" "}
                    {cart && cart.totalItems}
                  </p>
                  {/* <p>
                    <span className="font-medium">Total Amount:</span> ₹2,450
                  </p> */}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-5">
                  <p className="font-semibold text-gray-800 mb-1">
                    Shipping To:
                  </p>
                  <p className="text-sm text-gray-600">
                    {/* Full Name and Address Lines */}
                    <strong>{address.fullName}</strong>, {address.addressLine1}
                    {/* Add Address Line 2 and Landmark if they exist in your 'address' object */}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                    {address.landmark && `, ${address.landmark}`}
                    {/* City, State, Pin Code, Country */}
                    {address.city}, {address.state} - {address.pinCode},{" "}
                    {address.country}
                    <br />
                    {/* Mobile and Email (added email for completeness) */}
                    Mobile: {address.mobileNo}
                    {address.email && (
                      <>
                        <br />
                        Email: {address.email}
                      </>
                    )}
                  </p>
                </div>

                <button
                  className="w-full py-3 bg-[#264A3F] hover:bg-[#1e3a31] transition-all duration-200 rounded-xl text-white font-bold text-lg shadow-sm"
                  onClick={() => navigate("/retailer/payment")}
                >
                  Confirm & Proceed
                </button>
              </div>
            </div>
            <div className="w-[30%]">
              {cart?.cart?.length > 0 ? (
                cart?.cart?.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))
              ) : (
                <p className="text-center text-gray-500">Your cart is empty</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewAndConfirm;

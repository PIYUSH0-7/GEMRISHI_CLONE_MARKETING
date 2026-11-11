import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import axios from "axios";

import LoginPage from "./pages/authentication/LoginPage";
import SignupPage from "./pages/authentication/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import ProductsPage from "./pages/product/ProductsPage";
import OrdersPage from "./pages/order/OrdersPage";
import { CustomerList } from "./pages/customer/CustomerList";
import ReportsPage from "./pages/analytics/ReportsPage";
import AddProduct from "./pages/product/AddProduct";
import ProductDetails from "./pages/product/ProductDetails";
import EditDetailsPage from "./pages/product/EditDetailsPage";
import AddJewellery from "./pages/jewellery/AddJewellery";
import AddNewCategory from "./pages/product/AddNewCategory";
import JewelleryCategory from "./pages/jewellery/JewelleryCategory";
import { ToastContainer } from "react-toastify";
import JewelleryDetails from "./pages/jewellery/JewelleryDetails";
import JewelleryEditDetails from "./pages/jewellery/JewelleryEditDetails";
import { OrderDetailsPage } from "./pages/order/OrderDetailsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import PromotionPage from "./pages/promotions/PromotionPage";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import VerifyOtp from "./pages/authentication/VerifyOtp";
import ResetPassword from "./pages/authentication/ResetPassword";
import MetalRatesPage from "./pages/metal-rates/MetalRatesPage";
import VendorPage from "./pages/vendor/VendorPage";
import VendorDetails from "./pages/vendor/VendorDetails";
import PromotionListPage from "./pages/promotions/PromotionListPage";
import VendorProductDetails from "./pages/vendor/VendorProductDetails";
import CategoryPage from "./pages/category/CategoryPage";
import CategoryOrderPage from "./pages/category/CategoryOrderPage";
import CategoryProductPage from "./pages/category/CategoryProductPage";
import JewelleryCategoryPage from "./pages/jewellery-category/JewelleryCategoryPage";
import JewelleryCategoryProductPage from "./pages/jewellery-category/JewelleryCategoryProductPage";
import CategoryEditPage from "./pages/category/CategoryEditPage";
import JewelleryCategoryEditPage from "./pages/jewellery-category/JewelleryCategoryEditPage";
import MetalRatesList from "./pages/metal-rates/MetalRatesList";
import { CountryOrigin } from "./pages/country-origin/CountryOrigin";
import { CountryOriginList } from "./pages/country-origin/CountryOriginList";
import RetailerDashboard from "./retailer-pages/Dashboard/RetailerDashboard";
import RetailerProducts from "./retailer-pages/retailer-products/RetailerProducts";
import RetailerProductDetails from "./retailer-pages/retailer-products/RetailerProductDetails";
import RetailerCart from "./retailer-pages/cart/RetailerCart";
import OrderSummaryForm from "./retailer-pages/cart/OrderSummaryForm";
import { OfferPage } from "./pages/offer/OfferPage";
import { OfferList } from "./pages/offer/OfferList";
import RetailerLogin from "./retailer-pages/authentication/RetailerLogin";
import RetailerProtectedRoute from "./components/RetailerProtectedRoute";
import { ContactList } from "./pages/contacts/ContactList";
import { SubscribersList } from "./pages/subs/SubscribersList";
import ReviewAndConfirm from "./retailer-pages/cart/ReviewAndConfirm";
import Payment from "./retailer-pages/cart/Payment";
import RetailerOrders from "./retailer-pages/retailer-orders/RetailerOrders";
import { RetailerOrderDetails } from "./retailer-pages/retailer-orders/RetailerOrderDetails";
import ProductStock from "./retailer-pages/product-stock/ProductStock";
import BuyBackPortal from "./retailer-pages/BuyBackPortal/BuyBackPortal";
import RetailerSettingsPage from "./retailer-pages/settings/RetailerSettingsPage";
import RetailerForgotPassword from "./retailer-pages/authentication/RetailerForgotPassword";
import RetailerVerifyOtp from "./retailer-pages/authentication/RetailerVerifyOtp";
import RetailerResetPassword from "./retailer-pages/authentication/RetailerResetPassword";
import PublicRoute from "./components/PublicRoute";
import RetailerPublicRoute from "./components/RetailerPublicRoute";
import { FeedBackList } from "./pages/feedback/FeedBackList";
import AbandonedCheckouts from "./pages/abandonedCheckout"

function App() {
  const baseUrl = import.meta.env.VITE_BASE_SITE_URL;
  return (
    <>
      <Router basename={baseUrl}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/addproduct" element={<AddProduct />} />
            <Route path="/addcategory" element={<AddNewCategory />} />
            <Route path="/add-jewellery" element={<AddJewellery />} />
            <Route
              path="/add-jewellery-category"
              element={<JewelleryCategory />}
            />
            <Route path="/product-details/:slug" element={<ProductDetails />} />
            <Route
              path="/vendor-product-details/:slug"
              element={<VendorProductDetails />}
            />
            <Route
              path="/jewellery-details/:slug"
              element={<JewelleryDetails />}
            />
            <Route path="/edit-details/:slug" element={<EditDetailsPage />} />
            <Route
              path="/jewellery-edit-details/:slug"
              element={<JewelleryEditDetails />}
            />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/order/:orderId" element={<OrderDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/promotions" element={<PromotionPage />} />
            <Route path="/metal-rates" element={<MetalRatesPage />} />
            <Route path="/vendors" element={<VendorPage />} />
            <Route path="/vendor/:id" element={<VendorDetails />} />
            <Route path="/promotions-list" element={<PromotionListPage />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/category-order" element={<CategoryOrderPage />} />
            <Route path="/category/:slug" element={<CategoryProductPage />} />
            <Route
              path="/jewellery-category"
              element={<JewelleryCategoryPage />}
            />
            <Route
              path="/jewellery-category/:slug"
              element={<JewelleryCategoryProductPage />}
            />
            <Route
              path="/category-edit-details/:slug"
              element={<CategoryEditPage />}
            />
            <Route
              path="/jewellery-category-edit-details/:slug"
              element={<JewelleryCategoryEditPage />}
            />
            <Route path="/metal-rates-history" element={<MetalRatesList />} />
            <Route path="/country-origin" element={<CountryOrigin />} />
            <Route
              path="/country-origin-list"
              element={<CountryOriginList />}
            />
            <Route path="/offer" element={<OfferPage />} />
            <Route path="/offer-list" element={<OfferList />} />
            <Route path="/contacts" element={<ContactList />} />
            <Route path="/subscribers" element={<SubscribersList />} />
            <Route path="/feedbacks" element={<FeedBackList />} />
            <Route
              path="/abandoned-checkouts"
              element={<AbandonedCheckouts />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>

          <Route element={<RetailerPublicRoute />}>
            <Route path="/retailer/login" element={<RetailerLogin />} />
            <Route
              path="/retailer/forgot-password"
              element={<RetailerForgotPassword />}
            />
            <Route path="/retailer/verify" element={<RetailerVerifyOtp />} />
            <Route
              path="/retailer/reset-password"
              element={<RetailerResetPassword />}
            />
          </Route>

          <Route element={<RetailerProtectedRoute />}>
            {" "}
            {/* another protected route for retailer */}
            <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
            <Route path="/retailer/products" element={<RetailerProducts />} />
            <Route
              path="/retailer-product-details/:slug"
              element={<RetailerProductDetails />}
            />
            <Route path="/retailer/cart" element={<RetailerCart />} />
            <Route
              path="/retailer/order-summary"
              element={<OrderSummaryForm />}
            />
            <Route
              path="/retailer/review-confirm"
              element={<ReviewAndConfirm />}
            />
            <Route path="/retailer/payment" element={<Payment />} />
            <Route path="/retailer/orders" element={<RetailerOrders />} />
            <Route
              path="/retailer/order/:orderId"
              element={<RetailerOrderDetails />}
            />
            <Route path="/retailer/product-stock" element={<ProductStock />} />
            <Route
              path="/retailer/buy-back-portal"
              element={<BuyBackPortal />}
            />
            <Route
              path="/retailer/settings"
              element={<RetailerSettingsPage />}
            />
          </Route>
        </Routes>
      </Router>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        pauseOnHover
        closeOnClick
        draggable
        theme="colored"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </>
  );
}

export default App;

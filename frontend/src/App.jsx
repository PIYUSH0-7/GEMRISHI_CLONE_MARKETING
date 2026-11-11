"use client";
import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./app/store";
import Header from "./components/Header";
import Footer from "./components/Footer";
// ---------Add Currency Converter---------------------
import useCurrencyInit  from "./hooks/useCurrency";
// ---------Add Currency Converter---------------------
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import Email from "./components/ForgetPassword/Email";
import Otp from "./components/ForgetPassword/Otp";
import ResetPassword from "./components/ForgetPassword/ResetPassword";
import SuccessfullyChange from "./components/ForgetPassword/SuccessfullyChange";
import ProtectedRoute from "./components/ProtectedRoute";
import { ForgotPasswordProvider } from "./components/ForgetPassword/ForgotPasswordContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConsentBanner from "./components/ConsentBanner";
// --- Eager Core Components (Critical Path) ---
import Home from "./pages/Home/Home";

// --- Lazy Loaded Pages & Secondary Modules for Core Web Vitals Optimization ---
const FestivalHero = lazy(() => import("./components/FestiBanner"));
const LocationsModuleHide = lazy(() => import("./components/LocationsModuleHide"));
const BuyGemstoneOnline = lazy(() => import("./pages/StaticPages/BuyGemstoneOnline"));
const ProductPage = lazy(() => import("./pages/Product/ProductPage"));
const DetailPage = lazy(() => import("./pages/DetailPage/DetailPage"));
const UniversalProductDetailPage = lazy(() => import("./pages/Product/UniversalProductDetailPage"));
const ShoppingCart = lazy(() => import("./pages/DetailPage/ShoppingCart"));
const MainAddressPage = lazy(() => import("./pages/Order/MainAddressPage"));
const ReviewAndConfirm = lazy(() => import("./pages/Order/ReviewAndConfirm"));
const PaymentPage = lazy(() => import("./pages/Order/PaymentPage"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const OrdersAndPurchases = lazy(() => import("./pages/Profile/OrdersAndPurchases"));
const CancelOrder = lazy(() => import("./pages/Profile/CancelOrder"));
const UseRazorpay = lazy(() => import("./pages/Order/UseRazorpay"));
const ThankYouPage = lazy(() => import("./pages/Order/ThankYouPage"));
const Productpage = lazy(() => import("./pages/Productpage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Gemstone = lazy(() => import("./pages/Gemstone"));
const Jewellery = lazy(() => import("./pages/Jewellery"));
const GemstoneRings = lazy(() => import("./pages/GemstoneRings"));
const GemstonePendants = lazy(() => import("./pages/GemstonePendants"));
const GemSuggestion = lazy(() => import("./pages/GemSuggestion"));
const Jewellerybyfilter = lazy(() => import("./pages/jewellerybyfilter"));
const GemstoneListPage = lazy(() => import("./pages/GemstoneList"));
const JewelryListPage = lazy(() => import("./pages/JewelryListPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const FilterProductPage = lazy(() => import("./pages/Product/FilterProductPage"));
const SearchResultsPage = lazy(() => import("./components/SearchResultsPage"));
const AboutUs = lazy(() => import("./pages/StaticPages/AboutUs"));
const ContactUs = lazy(() => import("./pages/StaticPages/ContactUs"));
const ProductList = lazy(() => import("./pages/Product/ProductList"));
const RingSize = lazy(() => import("./pages/StaticPages/RingSize"));
const Privacy = lazy(() => import("./pages/StaticPages/Privacy"));
const Gemstoneguide = lazy(() => import("./pages/StaticPages/Gemstoneguide"));
const Shipping = lazy(() => import("./pages/StaticPages/Shipping"));
const CustomDuties = lazy(() => import("./pages/StaticPages/CustomDuties"));
const ReturnPolicy = lazy(() => import("./pages/StaticPages/ReturnPolicy"));
const Testimonals = lazy(() => import("./pages/StaticPages/Testimonals"));
const TermsConditions = lazy(() => import("./pages/StaticPages/TermsCondititions"));
const CaratToRattiConverter = lazy(() => import("./pages/StaticPages/CaratToRattiConverter"));
const CareerPage = lazy(() => import("./pages/StaticPages/CareerPage"));
const OffersPage = lazy(() => import("./pages/StaticPages/OffersPage"));
const NotFound = lazy(() => import("./pages/StaticPages/NotFound"));
const PurposeCollection = lazy(() => import("./components/filters/PurposeCollection"));
const SlideImage = lazy(() => import("./pages/Home/SlideImage"));
const ExclusiveJewellery = lazy(() => import("./pages/Home/ExclusiveJewellery"));
const CurrencySelector = lazy(() => import("./components/CurrencySelector"));
const Certificate = lazy(() => import("./pages/Home/Certificates"));
const Vlog = lazy(() => import("./pages/Home/Vlog"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
import CompareFloatingBar from "./components/compare/CompareFloatingBar";
import { getWishlist } from "./api/wishlist";
import { setWishlist } from "./redux/wishlistSlice";

import { setRedirectPath, openLoginModal, openSignupModal, closeAuthModal } from "./features/api/authSlice";
import RandomWrapper from "./components/RandomWrapper";
import { generateRandomString } from "./utils/randomString";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import { initAttribution } from "./utils/attribution";
import { initScrollTracking } from "./utils/scrollTracking";
import { initAutoTracking, sendSessionHeartbeat } from "./utils/autoTracking";
import { fbqTrack, initAdvancedMatching } from "./utils/metaPixel";

// Branded lightweight loading spinner for smooth route transitions
const PageLoadingFallback = () => (
  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center bg-[#FAF9F5] py-16">
    <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#04583f]">
      Loading...
    </span>
  </div>
);

// 301 Canonical redirect helper for legacy /jewelry/:slug -> /jewellery/:slug
const JewelrySlugRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={slug ? `/jewellery/${slug}` : "/jewellery"} replace />;
};

const BASE_URL = import.meta.env.BASE_URL;

// --- ScrollToTop component ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lastTrackedPathRef = useRef(null);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Track First/Last Touch Attribution on page load or URL change
    initAttribution();

    // Initialize universal auto-click & interaction tracker
    initAutoTracking();

    // Initialize Meta Advanced Matching & Google Enhanced Conversions
    initAdvancedMatching();

    // Reset and initialize scroll depth tracking
    initScrollTracking();

    // Send non-blocking session journey heartbeat
    sendSessionHeartbeat();

    // SPA PageView for Meta Pixel:
    // 1. Initial document load is tracked by index.html with a dedicated eventID.
    // 2. Strict initial mount suppression prevents duplicate firing during React hydration.
    // 3. Subsequent route transitions fire exactly once per unique path.
    const isInitial = isInitialMountRef.current;
    isInitialMountRef.current = false;

    if (isInitial) {
      lastTrackedPathRef.current = pathname;
      if (typeof window !== "undefined" && window.__gemrishi_initial_pv) {
        delete window.__gemrishi_initial_pv;
      }
    } else if (lastTrackedPathRef.current !== pathname) {
      lastTrackedPathRef.current = pathname;
      fbqTrack("PageView");
    }

    // SPA Virtual PageView for Google Analytics / GTM
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "page_view",
        page_path: pathname,
        page_location: window.location.href,
        page_search: window.location.search,
        page_title: document.title,
        referrer: document.referrer || "",
      });

      if (window.__IS_DEV__) {
        console.log(`[Analytics Event: page_view] ${pathname}`);
      }
    }
  }, [pathname]);

  return null;
};

// --- AppWrapper Component (Login/Auth and Redirection Logic) ---
function AppWrapper() {
  const reduxAuthModal = useSelector((state) => state.auth.authModal);
  // State to manage the active modal/flow
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const currentModal = reduxAuthModal || activeModal;

  // HANDLERS FOR MODAL STATE TRANSITIONS

  // Closes the modal and navigates back in browser history
  const handleCloseModal = () => {
    setActiveModal(null);
    dispatch(closeAuthModal());
    navigate(-1);
  };

  // new function to return where user left
  const handleJustCloseModal = () => {
    setActiveModal(null);
    dispatch(closeAuthModal());
  };

  // FORWARD NAVIGATION HANDLERS
  const handleSwitchToSignup = () => {
    dispatch(openSignupModal());
    setActiveModal("signup");
  };
  const handleSwitchToLogin = () => {
    dispatch(openLoginModal(location.pathname + location.search));
    setActiveModal("login");
  };
  const handleSwitchToForgotPasswordEmail = () => {
    dispatch(closeAuthModal());
    setActiveModal("forgotPasswordEmail");
  };
  const handleSwitchToForgotPasswordOtp = () => {
    dispatch(closeAuthModal());
    setActiveModal("forgotPasswordOtp");
  };

  // OTP Success handler: Moves to the final Reset Password step
  const handleSwitchToResetPassword = () => {
    dispatch(closeAuthModal());
    setActiveModal("resetPassword");
  };

  // Reset Password Success handler: Shows the success component
  const handleResetPasswordComplete = () => {
    dispatch(closeAuthModal());
    setActiveModal("resetSuccess");
  };

  // BACK NAVIGATION HANDLERS
  const handleBackToLogin = () => {
    dispatch(openLoginModal());
    setActiveModal("login");
  };
  const handleBackToEmail = () => setActiveModal("forgotPasswordEmail");
  const handleBackToOtp = () => setActiveModal("forgotPasswordOtp");

  useEffect(() => {
    const handleOpenLogin = (e) => {
      const redirect = e?.detail?.redirect || (location.pathname + location.search);
      dispatch(openLoginModal(redirect));
      setActiveModal("login");
    };
    window.addEventListener("open-login-modal", handleOpenLogin);
    return () => window.removeEventListener("open-login-modal", handleOpenLogin);
  }, [location, dispatch]);
  // ------Add By Pawan for currency hooks--------------
     useCurrencyInit();

  // Synchronize backend wishlist into Redux on app mount
  useEffect(() => {
    getWishlist()
      .then((res) => {
        if (res?.success && Array.isArray(res?.wishlist)) {
          dispatch(setWishlist(res.wishlist));
        }
      })
      .catch(() => {});
  }, [dispatch]);
  // ------Add By Pawan for currency hooks--------------

  return (
    <>
      {location.pathname !== "/offers" && <Header />}

      <main id="main-content" className="flex-1 w-full">
        <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
  {/*---------------------------------- Add By Pawan ----------------------------------------*/}
          <Route path="/slide-image" element={<SlideImage />} />
          <Route path="/exclusive-jewellery" element={<ExclusiveJewellery/>}/>
          <Route path="/currency-selector" element={<CurrencySelector/>}/>
          <Route path="/locations" element={<LocationsModuleHide />} />
          <Route path="/locations/:cityName/:localityName" element={<LocationsModuleHide />} />
          <Route path="/certificate" element={<Certificate />} />
          <Route path="/vlog" element={<Vlog />}/>
          {/* 301 Canonical Redirect: underscore to standard hyphenated URL */}
          <Route path="/buy_gemstone_online" element={<Navigate to="/buy-gemstone-online" replace />} />
          <Route path="/buy-gemstone-online" element={<BuyGemstoneOnline />} />
          <Route path="/festival-banner" element={<FestivalHero />}/>
  {/*-------------------------------- Add By Pawan -----------------*/}
          {/* Canonical Universal Product Routes (/products/:name/:sku) */}
          <Route path="/products/:name/:sku" element={<UniversalProductDetailPage />} />
          <Route path="/products/:name/:sku/:random?" element={<UniversalProductDetailPage />} />
          <Route path="/products/:slug" element={<UniversalProductDetailPage />} />
          <Route path="/products/:slug/:random?" element={<UniversalProductDetailPage />} />
          <Route path="/product/:slug" element={<UniversalProductDetailPage />} />

          {/* Legacy Routes with 301 Canonical URL Redirection */}
          <Route path="/gemstones/:slug/:random?" element={<UniversalProductDetailPage />} />
          <Route path="/gemstones/:slug" element={<UniversalProductDetailPage />} />
          <Route path="/gemstone/:slug" element={<ProductList />} />
          <Route path="/gemstone/filter/:slug" element={<FilterProductPage />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/ring-size" element={<RingSize />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/gemstone-buy-guide" element={<Gemstoneguide />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/custom-duties" element={<CustomDuties />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/testimonals" element={<Testimonals />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/gemstone/purpose/:slug" element={<PurposeCollection />} />
          <Route
            path="/carat-to-ratti-converter"
            element={<CaratToRattiConverter />}
          />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/offers" element={<OffersPage />} />
          {/* 301 Canonical Redirect: /offer -> /offers */}
          <Route path="/offer" element={<Navigate to="/offers" replace />} />

          {/* --- PUBLIC CART, WISHLIST & THANK YOU --- */}
          <Route path="/shopping/cart" element={<ShoppingCart />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route
            path="/thank-you"
            element={
              <ThankYouPage
                onRequireLogin={handleSwitchToLogin}
                onRequireSignup={handleSwitchToSignup}
              />
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <ThankYouPage
                onRequireLogin={handleSwitchToLogin}
                onRequireSignup={handleSwitchToSignup}
              />
            }
          />

          {/* Protected Routes (Only for Shipping, Payment, Profile, Orders) */}
          <Route
            path="/shipping/address"
            element={
              <ProtectedRoute onRequireLogin={handleSwitchToLogin}>
                <MainAddressPage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/review_And/confirm/details"
            element={
              <ProtectedRoute onRequireLogin={handleSwitchToLogin}>
                <ReviewAndConfirm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/page"
            element={
              <ProtectedRoute onRequireLogin={handleSwitchToLogin}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          {/* Razorpay Route */}
          <Route
            path="/use-razorpay"
            element={
              <ProtectedRoute onRequireLogin={handleSwitchToLogin}>
                <UseRazorpay />
              </ProtectedRoute>
            }
          />

          <Route
            path="/personal/profile"
            element={
              <ProtectedRoute onRequireLogin={handleSwitchToLogin}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/and/purchases/:generateRandomString?"
            element={
              <ProtectedRoute onRequireLogin={handleSwitchToLogin}>
                <OrdersAndPurchases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cancel/order/:orderId"
            element={
              <ProtectedRoute onRequireLogin={handleSwitchToLogin}>
                <CancelOrder />
              </ProtectedRoute>
            }
          />

          {/* 301 Canonical Redirection: /jewelry -> /jewellery */}
          <Route path="/jewelry" element={<Navigate to="/jewellery" replace />} />
          <Route path="/jewelry/:slug" element={<JewelrySlugRedirect />} />
          <Route path="/jewelry/:slug/:random?" element={<JewelrySlugRedirect />} />

          <Route path="/rings" element={<GemstoneRings />} />
          <Route path="/gemstone-rings" element={<GemstoneRings />} />
          <Route path="/ring" element={<Navigate to="/rings" replace />} />
          <Route path="/categories/rings" element={<Navigate to="/rings" replace />} />
          <Route path="/pendants" element={<GemstonePendants />} />
          <Route path="/gemstone-pendants" element={<GemstonePendants />} />
          <Route path="/pendant" element={<Navigate to="/pendants" replace />} />
          <Route path="/categories/pendants" element={<Navigate to="/pendants" replace />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/jewellery/:slug/:random?" element={<Productpage />} />
          <Route path="/jewellery/:slug" element={<Productpage />} />
          <Route path="/jewelry-list" element={<JewelryListPage />} />
          <Route path="/details/product/:slugOrId/:generateRandomString?" element={<UniversalProductDetailPage />} />
          <Route path="/details/product/:slugOrId" element={<UniversalProductDetailPage />} />
          <Route path="/gemstone" element={<Gemstone />} />
          <Route path="/gemstones" element={<Navigate to="/gemstone" replace />} />
          <Route path="/suggest" element={<GemSuggestion />} />
          <Route path="/jewellery-results" element={<Jewellerybyfilter />} />
          <Route path="/filter-gemstone" element={<GemstoneListPage />} />

          {/* 404 Catch-All Route: Captures all unmatched/broken URLs and displays helpful 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>

      {location.pathname !== "/offers" && <Footer />}
      {location.pathname !== "/offers" && <FloatingWhatsApp />}
      {location.pathname !== "/offers" && <CompareFloatingBar />}

      {/* --- MODAL RENDERING BASED ON activeModal STATE --- */}

      {currentModal === "login" && (
        <LoginModal
          onClose={handleJustCloseModal}
          onSwitchToSignup={handleSwitchToSignup}
          onForgotPassword={handleSwitchToForgotPasswordEmail}
        />
      )}

      {currentModal === "signup" && (
        <SignupModal
          onClose={handleJustCloseModal}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {/* Forgot Password Step 1: Email */}
      {activeModal === "forgotPasswordEmail" && (
        <Email
          onClose={handleJustCloseModal}
          onBack={handleBackToLogin}
          onContinue={handleSwitchToForgotPasswordOtp} // Go to OTP
        />
      )}

      {/* Forgot Password Step 2: OTP */}
      {activeModal === "forgotPasswordOtp" && (
        <Otp
          onClose={handleJustCloseModal}
          onBack={handleBackToEmail}
          onVerificationSuccess={handleSwitchToResetPassword} // Go to Reset Password
        />
      )}

      {/* Forgot Password Step 3: Reset Password */}
      {activeModal === "resetPassword" && (
        <ResetPassword
          onClose={handleJustCloseModal}
          onBack={handleBackToOtp} // Go back to OTP
          onResetSuccess={handleResetPasswordComplete} // On success, show the success screen
        />
      )}

      {/* Forgot Password Step 4: Success Screen */}
      {activeModal === "resetSuccess" && (
        <SuccessfullyChange
          onClose={handleJustCloseModal} // Close the modal
          onLoginClick={handleSwitchToLogin} // 'Done' button should likely go to the Login screen
        />
      )}
      <ToastContainer
        limit={1}
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{
          marginTop: "100px",
          zIndex: 999999,
        }}
      />
      <ConsentBanner />
    </>
  );
}
function App() {
  return (
    <Provider store={store}>
      <Router basename={BASE_URL || "/gemstone/user/"}>
        <ForgotPasswordProvider>

          <ScrollToTop />

          <AppWrapper />

        </ForgotPasswordProvider>
      </Router>
    </Provider>
  );
}

export default App;

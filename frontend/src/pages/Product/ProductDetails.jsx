import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import securityShield from "../../assets/ProductsPage/securityShield.svg";
import GemstonePopup from "../../components/popup"; // ✅ Imported the popup

function ProductDetails({ subcategory }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  // -----------------Set Open in Mobile Phone--------------------------------
  // const [isMobile, setIsMobile]=useState(false);
  // useEffect(()=>
  // {
  //   const checkMobile=()=>
  //   {
  //     setIsMobile(window.innerWidth<1024);
  //   }
  //   checkMobile();
  //   window.addEventListener('resize',checkMobile);
  //   return()=>{
  //     window.removeEventListener('resize',checkMobile);
  //   };
  // },[]);
  // useEffect(()=>
  // {
  //   setActiveTab(isMobile?"null":"Why should wear ?")
  // },[isMobile]);
   // -----------------Set Open in Mobile Phone--------------------------------
  const tabs = ["Why should wear ?", "Benefits", "Quality", "Price", "FAQ"];
  const [state, setState] = useState(false);

  // ✅ State for Popup
  const [showPopup, setShowPopup] = useState(false);
  const popupTimerRef = useRef(null);

  useEffect(() => {
    if (subcategory?.name) {
      document.title = `${subcategory.name} | Gemstone Details`;
    }
  }, [subcategory]);

  useEffect(() => {
    // 1st time: appear after 5 seconds
    popupTimerRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 5000);

    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    // After closing, show again after 30 seconds
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 700000);
  };
  const renderNoContent = () => (
    <div className="py-10 text-center text-gray-500">
      <h3 className="font-semibold text-gray-700 text-base">
        Details Currently Unavailable
      </h3>
      <p className="text-xs mt-1">
        We are working to add this information soon.
      </p>
    </div>
  );
  const renderContent = () => {
    if (!subcategory) return null;
    switch (activeTab) {
      case "Why should wear ?":
        if (!subcategory.targetAudience) return renderNoContent();
        return (
          <div className="py-8">
            <h2 className="text-lg sm:text-xl text-gray-800 font-bold mb-4">
              Who Should Wear {subcategory.name}
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              {subcategory.targetAudience}
            </p>
          </div>
        );

      case "Benefits":
        if (!subcategory.benefits?.length) return renderNoContent();
        return (
          <div className="py-8">
            <h2 className="text-lg sm:text-xl text-gray-800 font-bold mb-4">
              Benefits of {subcategory.name}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-base text-gray-700">
              {subcategory.benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        );

      case "Quality":
        if (!subcategory.qualityLevel) return renderNoContent();
        return (
          <div className="py-8">
            <h2 className="text-lg sm:text-xl text-gray-800 font-bold mb-4">
              Quality and Care
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              {subcategory.qualityLevel}
            </p>
          </div>
        );

      case "Price":
        if (!subcategory.pricingDetails) return renderNoContent();
        return (
          <div className="py-8">
            <h2 className="text-lg sm:text-xl text-gray-800 font-bold mb-4">
              Price Information
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              {subcategory.pricingDetails}
            </p>
          </div>
        );
// -------------------------------Fix By Pawan----------------------------------------------
      case "FAQ": {
        if (!subcategory.faqs?.length) return renderNoContent();
        const validFaqs = subcategory.faqs.filter(
          (f) => f.question && f.question.trim() !== "",
        );
        if (!validFaqs.length) return renderNoContent();

        return (
          <div className="py-8">
            <h2 className="text-lg sm:text-xl text-gray-800 font-bold mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {validFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200  p-4  bg-white  transition-all"
                >
                  <button
                    onClick={() => {
                      faq.open = !faq.open;
                      // Force re-render (React doesn't track direct mutation)
                      setState((x) => !x);
                    }}
                    className="w-full flex justify-between items-center text-left"
                  >
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      {faq.question}
                    </span>

                    <span className="text-gray-500 text-xl">
                      {faq.open ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`mt-3 text-gray-700 text-sm sm:text-base leading-relaxed transition-all duration-300 ${
                      faq.open
                        ? "opacity-100 max-h-screen"
                        : "opacity-0 max-h-0 overflow-hidden"
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!subcategory)
    return (
      <div className="text-center py-20 text-gray-600">
        Loading product details...
      </div>
    );

  return (
    <>
      {/* Breadcrumb - matched style */}
      <div className="text-gray-900 text-sm px-4 sm:px-6 md:px-12 flex items-center space-x-2 py-4">
        <span
          className="cursor-pointer hover:text-[#264A3F] transition-colors text-[18px]"
          onClick={() => navigate("/")}
        >
          Home
        </span>
        <span>&gt;</span>
        <span className="text-[18px] text-[#264A3F] capitalize">
          {subcategory.name || "Gemstone"}
        </span>
      </div>

      {/* Hero / Header Section */}
      <div className="mt-2 w-full px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-8 lg:gap-20 mb-4">
          {/* Left Section - Text */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {subcategory.name}
            </h1>
            <p className="text-gray-700 text-base sm:text-lg md:text-xl">
              {subcategory.description || "No description available."}
            </p>

            {/* Tags */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6 mt-6">
              {subcategory.tags?.slice(0, 4).map((tag, i) => (
                <div key={i} className="flex items-center gap-2">
                  <img
                    src={securityShield}
                    alt="Tag icon"
                    className="w-5 h-5"
                  />
                  <span className="text-sm sm:text-base font-semibold text-gray-700">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="flex justify-center w-full md:w-auto">
            <img
              src={subcategory.image?.url}
              alt={subcategory.name}
              className="w-40 sm:w-48 md:w-56 h-auto object-contain mix-blend-multiply rounded-lg transition-transform duration-300 hover:scale-110"
            />
          </div>
        </div>
      </div>

      {/*---------------Fix by Pawan for mobile view tab ----------------------- */}
      <div className="px-4 mt-10 md:px-12 border-b border-gray-100">
        <ul className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tabs.map((tab) => (
            <li
              key={tab}
              className={`cursor-pointer inline-block pb-4 text-[16px] font-semibold transition-colors ${
                activeTab === tab
                  ? "text-[#02498F] border-b-2 border-[#02498F]"
                  : "hover:text-[#02498F]"
              }`}
              onClick={() =>
              {
                // if(isMobile || !isMobile)
                  setActiveTab((prev)=>prev===tab?null:tab);

               }
              }
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>
 {/*-------------------------Fix by Pawan for mobile view tab -------------------------- */}
      {/* Tab Content */}
      {/* Show automatically on md+ screens, and show only when clicked on mobile */}
      {(activeTab && (
        <div className="px-4 md:px-12 mb-2">{renderContent()}</div>
      )) || (
        <div className="hidden lg:block px-4 md:px-12 mb-2">
          {renderContent()}
        </div>
      )}

      {/* ✅ Render the popup conditionally */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GemstonePopup onClose={handleClosePopup} />
        </div>
      )}
    </>
  );
}

export default ProductDetails;

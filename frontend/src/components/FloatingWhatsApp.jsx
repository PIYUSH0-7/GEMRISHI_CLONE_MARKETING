import { MessageCircle, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fbqTrack, fbqTrackCustom } from "../utils/metaPixel";

const BRAND = {
  deep: "#0B2B22",
  mid: "#16443A",
  accentRing: "rgba(207, 234, 224, 0.35)",
  accentGlow: "rgba(207, 234, 224, 0.18)",
};

const FloatingWhatsApp = () => {
  const [hovered, setHovered] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const widgetRef = useRef(null);
  const timerRef = useRef(null);

  // Mobile interaction listener: hide floating buttons during touch/scroll, reappear after pause
  useEffect(() => {
    const isMobileViewport = () => window.innerWidth < 768;

    const handleInteractionStart = (e) => {
      if (!isMobileViewport()) return;
      // Do not hide if the user taps directly on the Call or WhatsApp button
      if (widgetRef.current && widgetRef.current.contains(e.target)) {
        return;
      }
      setIsInteracting(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };

    const handleInteractionEnd = () => {
      if (!isMobileViewport()) return;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Reappear quickly (500ms) once touch or scroll stops
      timerRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, 7000);
    };

    const handleScroll = () => {
      if (!isMobileViewport()) return;
      setIsInteracting(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, 7000);
    };

    window.addEventListener("touchstart", handleInteractionStart, { passive: true });
    window.addEventListener("touchmove", handleInteractionStart, { passive: true });
    window.addEventListener("touchend", handleInteractionEnd, { passive: true });
    window.addEventListener("touchcancel", handleInteractionEnd, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleInteractionStart);
      window.removeEventListener("touchmove", handleInteractionStart);
      window.removeEventListener("touchend", handleInteractionEnd);
      window.removeEventListener("touchcancel", handleInteractionEnd);
      window.removeEventListener("scroll", handleScroll);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const whatsappNumber = "919817975978";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const callUrl = `tel:+${whatsappNumber}`;

  // -----------------------------------------
  // WhatsApp Click with SKU-Level Dynamic Attribution
  // -----------------------------------------
  const openWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isProduct = window.location.pathname.includes("/products/") || window.location.pathname.includes("/gemstone/");
    const pageTitleClean = (document.title || "").split("|")[0].trim();

    const dynamicMessage = isProduct
      ? `Hi GemRishi! I am inquiring about ${pageTitleClean} (${window.location.href}). Please share certified gemstone details and best offers.`
      : "Hi GemRishi! I would like to know more about your natural certified gemstones and astrology consultation.";

    const dynamicUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(dynamicMessage)}`;

    // Meta Standard Event & Custom Conversion for WhatsApp Enquiries
    fbqTrack("Contact", {
      method: "whatsapp",
      content_name: pageTitleClean || "Floating WhatsApp Widget",
    });
    fbqTrackCustom("WhatsAppEnquiry", {
      source: "floating_widget",
      phone: `+${whatsappNumber}`,
      product_name: pageTitleClean,
      page_url: window.location.href,
      page_path: window.location.pathname,
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "contact_whatsapp_click",
      contact_method: "whatsapp",
      button_location: "floating_button",
      product_name: pageTitleClean,
      phone_number: `+${whatsappNumber}`,
      page_path: window.location.pathname,
      page_location: window.location.href,
    });

    if (typeof window.clarity === "function") {
      window.clarity("set", "contact_channel", "whatsapp");
      window.clarity("set", "lead_interest", pageTitleClean.slice(0, 30));
    }

    window.open(dynamicUrl, "_blank", "noopener,noreferrer");
  };

  // -----------------------------------------
  // Call Click
  // -----------------------------------------
  const openCall = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const pageTitleClean = (document.title || "").split("|")[0].trim();

    // Meta Standard Event for Call Inquiries
    fbqTrack("Contact", {
      method: "phone",
      content_name: pageTitleClean || "Floating Call Widget",
    });
    fbqTrackCustom("PhoneCallEnquiry", {
      source: "floating_widget",
      phone: `+${whatsappNumber}`,
      page_url: window.location.href,
      page_path: window.location.pathname,
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "contact_call_click",
      contact_method: "phone",
      button_location: "floating_button",
      phone_number: `+${whatsappNumber}`,
      page_path: window.location.pathname,
      page_location: window.location.href,
    });

    if (typeof window.clarity === "function") {
      window.clarity("set", "contact_channel", "phone");
    }

    window.location.href = callUrl;
  };

  return (
    <div
      ref={widgetRef}
      className={`fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-4 transition-all duration-300 ease-in-out ${
        isInteracting
          ? "max-md:opacity-0 max-md:translate-y-8 max-md:pointer-events-none"
          : "opacity-100 translate-y-0"
      }`}
    >
      {/* =========================================
          CALL BUTTON
           ======================================== */}
      <div
        className="flex items-center gap-3"
        onMouseEnter={() => setHovered("call")}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Call Label */}
        <span
          className={`whitespace-nowrap rounded-full bg-[#0B2B22] px-3 py-1.5 text-xs font-medium tracking-wide text-white shadow-lg transition-all duration-300 ${
            hovered === "call"
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-2 opacity-0"
          }`}
        >
          Call now
        </span>

        {/* Call Button */}
        <a
          href={callUrl}
          onClick={openCall}
          onFocus={() => setHovered("call")}
          onBlur={() => setHovered(null)}
          className="group flex h-[52px] w-[52px] items-center justify-center rounded-full text-white transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
          style={{
            background: `linear-gradient(135deg, ${BRAND.mid}, ${BRAND.deep})`,
            boxShadow: `0 8px 20px rgba(0,0,0,0.35), 0 0 0 1px ${BRAND.accentRing}`,
          }}
          aria-label="Call GemRishi now"
        >
          <Phone size={22} strokeWidth={2.2} />
        </a>
      </div>

      {/* =========================================
          WHATSAPP BUTTON
      ========================================= */}
      <div
        className="flex items-center gap-3"
        onMouseEnter={() => setHovered("whatsapp")}
        onMouseLeave={() => setHovered(null)}
      >
        {/* WhatsApp Label */}
        <span
          className={`whitespace-nowrap rounded-full bg-[#0B2B22] px-3 py-1.5 text-xs font-medium tracking-wide text-white shadow-lg transition-all duration-300 ${
            hovered === "whatsapp"
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-2 opacity-0"
          }`}
        >
          Chat on WhatsApp
        </span>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          onClick={openWhatsApp}
          onFocus={() => setHovered("whatsapp")}
          onBlur={() => setHovered(null)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Chat with GemRishi on WhatsApp"
        >
          {/* Pulse Animation */}
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping [animation-duration:2.2s]" />

          {/* WhatsApp Icon */}
          <MessageCircle
            size={28}
            strokeWidth={2.2}
            className="relative"
          />
        </a>
      </div>
    </div>
  );
};

export default FloatingWhatsApp;

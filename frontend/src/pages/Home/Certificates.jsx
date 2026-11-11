import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificatesData, handleImageError } from './Vlog.jsx';

/**
 * GemrishiCertificates Component - Interactive Gemstone Certificate Viewer
 * @param {Object} props
 * @param {Array} [props.customCertificates]
 * @param {Function} [props.onCertificateSelect]
 * @param {string} [props.blogUrlPath] 
 * @param {Function} [props.onReadMore] 
 * @param {string|number} [props.activeCertId]
 */
const GemrishiCertificates = ({ 
  customCertificates, 
  onCertificateSelect, 
  blogUrlPath = '', 
  onReadMore,
  activeCertId 
}) => {
  const navigate = useNavigate();
  const certificates = useMemo(() => customCertificates || certificatesData, [customCertificates]);

  const [activeCert, setActiveCert] = useState(() => {
    if (activeCertId) {
      const found = certificates.find((c) => String(c.id) === String(activeCertId));
      if (found) return found;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const certSlug = searchParams.get('cert');
    const certIdParam = searchParams.get('certId');
    const matched = certificates.find((c) => 
      (certIdParam && String(c.id) === String(certIdParam)) ||
      (certSlug && c.slug === certSlug)
    );
    return matched || certificates[0];
  });
  useEffect(() => {
    if (activeCertId) {
      const found = certificates.find((c) => String(c.id) === String(activeCertId));
      if (found) {
        setActiveCert(found);
      }
    }
  }, [activeCertId, certificates]);

  const handleSelectCert = useCallback((cert) => {
    setActiveCert(cert);
    if (onCertificateSelect) {
      onCertificateSelect(cert);
    }
  }, [onCertificateSelect]);
  // Dynamic SEO URL for blog link navigation
  const blogLink = useMemo(() => {
    const basePath = blogUrlPath || '/vlog';
    return `${basePath}?cert=${activeCert.slug}#cert-${activeCert.id}`;
  }, [blogUrlPath, activeCert]);

  const handleReadMoreClick = useCallback((e) => {
    if (onReadMore) {
      e.preventDefault();
      onReadMore(activeCert);
    } else {
      e.preventDefault();
      const basePath = blogUrlPath || '/vlog';
      navigate(`${basePath}?cert=${activeCert.slug}#cert-${activeCert.id}`);
    }
  }, [onReadMore, blogUrlPath, activeCert, navigate]);

  return (
    
    <div className="relative min-h-[500px] lg:min-h-screen bg-[#FDFCF8] text-[#264A3F] font-serif flex flex-col items-center justify-center p-3 sm:p-5 md:p-8 lg:p-10 overflow-x-hidden">
       {/*--------- Header------ */}
       <div className="text-center lg:text-3xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-medium text-green-950">
        <span>Confidence Backed by Certification</span>
        <div className="lg:w-120 w-40 h-0.5 bg-green-950 mx-auto mt-2"></div>
       </div>
      {/* Main Interactive Certificate Viewer Container */}
      <div className="max-w-7xl w-full bg-white/80 backdrop-blur-md border border-[#264A3F]/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl shadow-[#264A3F]/5 relative flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 items-center transition-all duration-300 my-auto">
        
        {/* Left Column: Featured Active Certificate Display */}
        <div className="w-full lg:w-1/2 relative">
          <div className="absolute -top-1.5 -left-1.5 sm:-top-3 sm:-left-3 lg:-top-4 lg:-left-4 w-full h-full border border-[#264A3F] z-0 pointer-events-none opacity-80"></div>
          <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-3 sm:-right-3 lg:-bottom-4 lg:-right-4 w-full h-full border-b border-r border-[#264A3F] z-0 pointer-events-none opacity-80"></div>
          
          <div className="relative z-10 bg-white p-2 sm:p-3 shadow-md h-[260px] xs:h-[320px] sm:h-[380px] md:h-[440px] lg:h-[500px] xl:h-[540px] max-h-[60vh] lg:max-h-[600px] w-full flex items-center justify-center overflow-hidden border border-[#264A3F]/30">
            {activeCert.type === 'image' ? (
              <img 
                src={activeCert.src} 
                alt={activeCert.title} 
                width="500"
                height="500"
                onError={handleImageError}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center bg-[#F9F9F8] w-full p-4 md:p-8">
                <svg className="w-16 h-16 md:w-24 md:h-24 text-[#264A3F] mb-2 md:mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6 A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg md:text-2xl font-semibold mb-1 md:mb-2 text-[#264A3F]">{activeCert.title}</h3>
                <p className="text-[#264A3F]/70 text-xs md:text-sm">View official PDF document</p>
                <p className="text-[10px] md:text-xs text-[#264A3F]/50 mt-1 md:mt-2 font-sans">{activeCert.src}</p>
              </div>
            )}
            
            {/* Sample Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
              <div className="transform -rotate-[35deg] text-[#264A3F]/20 font-serif font-black text-2xl sm:text-4xl md:text-6xl uppercase tracking-[0.2em] md:tracking-[0.25em] border-2 md:border-4 border-dashed border-[#264A3F]/25 px-4 py-1.5 md:px-8 md:py-3 rounded-md whitespace-nowrap">
                SAMPLE
              </div>
            </div>
            
            {/* Bottom Gradient Bar: Active Lab & Title */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#264A3F]/95 via-[#264A3F]/75 to-transparent p-3.5 md:p-6 pt-8 md:pt-12 z-20">
              <h2 className="text-white text-base sm:text-lg md:text-2xl tracking-wide font-serif font-semibold drop-shadow-sm">
                {activeCert.title || activeCert.name}
              </h2>
              <p className="text-[#FDFCF8]/90 text-[10px] md:text-xs font-sans mt-0.5 md:mt-1 tracking-wider uppercase font-medium">
                {activeCert.lab}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Lab Info, Dynamic Description & Thumbnail Carousel */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center pl-0 lg:pl-6 xl:pl-10">
          
          <div className="text-[#264A3F] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none font-serif mb-1 opacity-80 select-none">
            “
          </div>
          
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl italic text-[#264A3F] mb-2 sm:mb-3 md:mb-4 leading-snug">
            Certified by <span className="text-[#264A3F] font-bold not-italic underline decoration-[#264A3F]/40">{activeCert.lab || 'Global Gemological Labs'}</span> for Authenticity &amp; Purity
          </h2>
          
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-6 md:w-10 h-[1px] bg-[#264A3F]"></div>
            <p className="text-[10px] sm:text-xs font-sans tracking-[0.15em] md:tracking-[0.2em] font-semibold text-[#264A3F] uppercase">
              {activeCert.title || activeCert.name}
            </p>
          </div>
          
          <p className="text-[#264A3F]/85 font-sans text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 md:mb-6">
            {activeCert.description || "Authentic, untreated gemstones backed by the world's most trusted laboratories. Every gem is accompanied by rigorous testing reports ensuring natural origin."}
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 flex-wrap">
            <a
              href={blogLink}
              onClick={handleReadMoreClick}
              target="_self"
              rel="noopener noreferrer"
              aria-label="Read Certification Guide - Learn About Lab Reports"
              className="inline-flex items-center justify-center px-5 sm:px-6 md:px-7 py-2.5 border-2 border-[#264A3F] text-[#264A3F] hover:bg-[#264A3F] hover:text-white rounded-md text-xs sm:text-sm font-sans font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer active:scale-95"
            >
              Read Certification Guide
            </a>
            <a
              href="https://gemrishi.com/gemstone"
              target="_self"
              rel="noopener noreferrer"
              aria-label="Shop Now - Browse Certified Gemstones"
              className="inline-flex items-center justify-center px-5 sm:px-6 md:px-7 py-2.5 bg-[#264A3F] hover:bg-[#1A362D] text-white rounded-md text-xs sm:text-sm font-sans font-semibold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer active:scale-95"
            >
              Shop Now
            </a>
          </div>

          {/* Circular Logo Thumbnails */}
          <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 overflow-x-auto pb-2 w-full scrollbar-thin max-w-full">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex flex-col items-center gap-1.5 text-center min-w-[58px] sm:min-w-[70px] md:min-w-[76px] shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectCert(cert)}
                  aria-label={`Select ${cert.title}`}
                  className={`relative rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 transition-all duration-300 flex items-center justify-center bg-white p-2 sm:p-2.5 md:p-3 cursor-pointer shadow-sm ${
                    activeCert.id === cert.id 
                      ? 'border-2 border-[#264A3F] ring-2 ring-[#264A3F] ring-offset-2 scale-87 z-10 shadow-md' 
                      : 'border border-gray-200 opacity-70 hover:opacity-100 hover:scale-105 hover:border-[#264A3F]/50'
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={cert.logo || cert.src} 
                      alt={`${cert.name || cert.title} Logo`} 
                      width="56"
                      height="56"
                      onError={handleImageError}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                  </div>
                </button>
                <span className={`text-[10px] sm:text-[11px] font-sans leading-tight transition-colors max-w-[65px] sm:max-w-[80px] ${
                  activeCert.id === cert.id ? 'font-bold text-[#264A3F]' : 'text-[#264A3F]/70'
                }`}>
                  {cert.name || cert.title}
                </span>
              </div>
            ))}
          </div>
          
          <div className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-[#264A3F] to-transparent mt-3 md:mt-6"></div>
          
        </div>
      </div>
      
    </div>
  );
};
export default GemrishiCertificates;
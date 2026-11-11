import React, { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Default fallback image URL in case of image load errors
 */
export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';

/**
 * Global certificates dataset
 */
export const certificatesData = [
  {
    id: 1,
    slug: 'ssef-gemstone-report',
    type: 'image',
    src: 'https://ik.imagekit.io/5ir6xjl4o/SSEF',
    logo: 'https://ik.imagekit.io/5ir6xjl4o/SSEF-logo.jpg?updatedAt=1786002676475',
    name: 'SSEF Report',
    title: 'SSEF Gemstone Report',
    lab: 'Swiss Gemmological Institute SSEF',
    verifyUrl: 'https://www.myssef.ch/verification',
    description: 'Leading international authority in gemstone examination, offering high-precision spectroscopy, elemental fingerprinting, and authenticity verification for fine gems.',
    highlights: ['Elemental Fingerprinting', 'Radio-Age Dating Standard', 'Premier Swiss Lab'],
    blogDetails: {
      established: '1974 (Basel, Switzerland)',
      reputation: 'Global gold-standard for high-end luxury gemstones and natural pearls featured at major international auction houses.',
      keyFeatures: [
        'Chemical & Isotopic Fingerprinting using LA-ICP-MS spectroscopy.',
        'Scientific origin determination for Burma Rubies, Kashmir Sapphires, and Colombian Emeralds.',
        'Radio-Age Dating standard for natural pearls and historical gemstone artifacts.'
      ],
      whyTrust: 'SSEF certificates are held in the highest esteem worldwide by fine jewelers, collectors, and auction houses such as Christie\'s and Sotheby\'s due to their strict non-commercial scientific objectivity.'
    }
  },
  {
    id: 2,
    slug: 'gii-gemstone-report',
    type: 'image',
    src: 'https://ik.imagekit.io/5ir6xjl4o/GII',
    logo: 'https://ik.imagekit.io/5ir6xjl4o/gii.webp?updatedAt=1786002676733',
    name: 'GII Report',
    title: 'GII Gemstone Report',
    lab: 'Gemmological Institute of India',
    verifyUrl: 'https://www.giigemlab.com/Verification.aspx',
    description: 'Pioneer Indian gemological laboratory providing authoritative astrological gemstone testing, natural color verification, and exact physical property profiling.',
    highlights: ['Astrological Suitability', 'Refractive Index Verified', 'Natural Color Certified'],
    blogDetails: {
      established: '1971 (Mumbai, India)',
      reputation: 'India\'s first premier non-profit gemological institute recognized by trade bodies and Vedic astrology experts for gemstone purity.',
      keyFeatures: [
        'Comprehensive refractive index, specific gravity, and optic character analysis.',
        'Astrological suitability & Jyotish gemstone purity evaluation.',
        'Strict detection of synthetic treatments, glass fillings, and dye enhancements.'
      ],
      whyTrust: 'GII provides unbiased certification specifically tailored for Vedic astrology and precious stone purity, ensuring gemstones possess pure planetary energy without harmful treatments.'
    }
  },
  {
    id: 3,
    slug: 'igi-colored-stone-report',
    type: 'image',
    src: 'https://ik.imagekit.io/5ir6xjl4o/IGI',
    logo: 'https://ik.imagekit.io/5ir6xjl4o/igi.png',
    name: 'IGI Report',
    title: 'IGI Colored Stone Report',
    lab: 'International Gemological Institute',
    verifyUrl: 'https://www.igi.org/verify-your-report/',
    description: 'Global benchmark laboratory providing comprehensive colored stone analysis with QR code digital verification, laser inscription options, and optical property breakdown.',
    highlights: ['Instant QR Digital Audit', 'International Acceptance', 'Optical Property Analysis'],
    blogDetails: {
      established: '1975 (Antwerp, Belgium)',
      reputation: 'The world\'s largest independent gem certification organization operating 20+ state-of-the-art laboratories worldwide.',
      keyFeatures: [
        'Instant QR Code digital report verification available 24/7 online.',
        'Laser inscription service for microscopic report matching directly on the gem grid.',
        'Detailed color grading, transparency index, and cut proportion classification.'
      ],
      whyTrust: 'IGI reports are universally accepted across North America, Europe, Asia, and the Middle East, offering buyers seamless digital verification and transparency.'
    }
  },
  {
    id: 4,
    slug: 'gjepc-iigj-gemstone-report',
    type: 'image',
    src: 'https://ik.imagekit.io/5ir6xjl4o/IIGJ',
    logo: 'https://ik.imagekit.io/5ir6xjl4o/gjepc.webp?updatedAt=1786002676825',
    name: 'GJEPC IIGJ',
    title: 'GJEPC IIGJ Report',
    lab: 'Indian Institute of Gems & Jewellery (GJEPC)',
    verifyUrl: 'https://iigjrlc.com/',
    description: 'Government-backed premier gemological testing lab specializing in natural origin certification, microscopic inclusions analysis, and thermal treatment verification for emeralds, rubies, and sapphires.',
    highlights: ['Natural Origin Verified', 'Microscopic Analysis', 'Treatment Detection'],
    blogDetails: {
      established: 'Backed by Ministry of Commerce & Industry (Govt. of India)',
      reputation: 'Premier official gemstone laboratory managed by the Gem & Jewellery Export Promotion Council (GJEPC).',
      keyFeatures: [
        'Advanced microscopic inclusion profiling to differentiate natural vs lab-grown gems.',
        'Thermal treatment detection (heat treatment, resin filling, diffusion).',
        'Strict compliance with international export standards and government guidelines.'
      ],
      whyTrust: 'Backed by official government trade bodies, GJEPC IIGJ certificates provide 100% legal and scientific assurance of natural, unheated gemstone origin.'
    }
  },
  {
    id: 5,
    slug: 'grs-gemstone-report',
    type: 'image',
    src: 'https://ik.imagekit.io/5ir6xjl4o/GRS',
    logo: 'https://ik.imagekit.io/5ir6xjl4o/grs.webp?updatedAt=1786002676600',
    name: 'GRS Report',
    title: 'GRS Gemstone Report',
    lab: 'GemResearch Swisslab (Switzerland)',
    verifyUrl: 'https://www.gemresearch.ch/report-verification',
    description: 'World-renowned Swiss laboratory recognized for grading luxury colored gemstones, origin determination (Burma Pigeon Blood Ruby, Kashmir Sapphire), and treatment certification.',
    highlights: ['Pigeon\'s Blood & Royal Blue Grade', 'Swiss Spectroscopic Testing', 'Global Auction Standard'],
    blogDetails: {
      established: '1996 (Lucerne, Switzerland)',
      reputation: 'World famous for pioneering trademarked color grades such as "Pigeon\'s Blood Ruby" and "Royal Blue Sapphire" at global auctions.',
      keyFeatures: [
        'Pioneered origin determination for Burmese Rubies, Kashmir Sapphires, and Colombian Emeralds.',
        'Multi-spectral UV-Vis-NIR and Raman spectroscopy testing.',
        'Comprehensive treatment grading (H(a), H(b), oiling degree H, F1-F3).'
      ],
      whyTrust: 'GRS reports command top market premiums worldwide, providing gemstone investors with prestigious Swiss certification.'
    }
  }
];

/**
 * Image error handler fallback
 */
export const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = DEFAULT_FALLBACK_IMAGE;
};

/**
 * Reusable Sample Watermark Overlay Component
 */
const SampleWatermark = ({ isLarge = false }) => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
    <div
      className={`transform -rotate-[30deg] text-[#264A3F]/20 font-serif font-black uppercase tracking-[0.25em] border-dashed border-[#264A3F]/25 rounded-lg ${
        isLarge
          ? 'text-3xl sm:text-5xl md:text-7xl border-2 sm:border-4 px-6 py-2'
          : 'text-2xl sm:text-4xl md:text-6xl border-2 sm:border-4 px-4 sm:px-6 py-1.5 sm:py-2'
      }`}
    >
      SAMPLE
    </div>
  </div>
);

/**
 * Lightbox Preview Modal Component with Interactive Zoom & Full Top-to-Bottom Scrolling
 */
const LightboxModal = ({ previewImage, zoomLevel, setZoomLevel, onClose }) => {
  if (!previewImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full h-[90vh] max-h-[90vh] bg-white rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col border border-[#264A3F]/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="w-full flex items-center justify-between border-b border-gray-200 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            {previewImage.logo && (
              <div className="w-9 h-9 rounded-lg border border-gray-200 p-1 flex items-center justify-center bg-white shadow-sm shrink-0 hidden sm:flex">
                <img
                  src={previewImage.logo}
                  alt={previewImage.name}
                  onError={handleImageError}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div>
              <h3 className="font-serif font-bold text-base sm:text-xl text-[#264A3F] leading-tight">
                {previewImage.title || previewImage.name}
              </h3>
              <p className="text-xs font-sans text-[#264A3F]/70 uppercase tracking-wider font-medium mt-0.5">
                {previewImage.lab} • Official Sample Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200 gap-1 mr-2">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.25))}
                className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-white hover:shadow-xs rounded transition-all cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-[11px] font-sans font-semibold text-gray-600 px-1 min-w-[42px] text-center select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.25))}
                className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-white hover:shadow-xs rounded transition-all cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              {zoomLevel !== 1 && (
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-0.5 text-[10px] font-semibold text-[#264A3F] hover:bg-white hover:shadow-xs rounded transition-all cursor-pointer border-l border-gray-300 ml-1"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-[#264A3F] hover:text-white text-gray-700 font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="Close image preview"
            >
              ✕
            </button>
          </div>
        </div>

        {/* High-res Image Preview Container */}
        <div className="relative w-full flex-1 min-h-0 bg-[#FDFCF8] rounded-xl border border-gray-200 overflow-hidden">
          {zoomLevel === 1 ? (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              <div className="relative flex items-center justify-center max-w-full max-h-full">
                <img
                  src={previewImage.src}
                  alt={previewImage.title || previewImage.name}
                  onError={handleImageError}
                  onClick={() => setZoomLevel(1.10)}
                  className="max-w-full max-h-[68vh] sm:max-h-[72vh] object-contain shadow-md rounded border border-gray-200/60 cursor-zoom-in transition-transform hover:scale-[1.01]"
                  title="Click to zoom in and scroll document"
                />
                <SampleWatermark />
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-auto p-4 flex items-start justify-center cursor-grab active:cursor-grabbing">
              <div className="relative inline-block my-auto">
                <img
                  src={previewImage.src}
                  alt={previewImage.title || previewImage.name}
                  onError={handleImageError}
                  onClick={() => setZoomLevel(1)}
                  style={{
                    width: `${zoomLevel * 100}%`,
                    maxWidth: 'none'
                  }}
                  className="h-auto block rounded shadow-xl border border-gray-300 cursor-zoom-out transition-all"
                  title="Click to reset view"
                />
                <SampleWatermark isLarge />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="w-full flex flex-wrap items-center justify-between pt-3 mt-1 text-xs font-sans text-[#264A3F]/80 shrink-0 gap-2">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">🔍 Click image to toggle zoom ({zoomLevel === 1 ? 'Zoom In' : 'Zoom Out'}) • Press Esc or click outside to exit</span>
            <span className="sm:hidden">Tap image to zoom • Click outside to exit</span>
          </div>

          <div className="flex items-center gap-2">
            {previewImage.verifyUrl && (
              <a
                href={previewImage.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#264A3F]/10 hover:bg-[#264A3F]/20 text-[#264A3F] rounded-md font-semibold text-xs transition-all flex items-center gap-1"
              >
                <span>Verify Online</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#264A3F] hover:bg-[#1A362D] text-white rounded-md font-semibold transition-all cursor-pointer shadow-sm"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Certificate Section Component
 */
const CertificateSection = ({ cert, index, isSelected, onEnlarge }) => {
  return (
    <div
      id={`cert-blog-${cert.id}`}
      className={`scroll-mt-24 p-5 sm:p-8 rounded-2xl border transition-all duration-300 ${
        isSelected
          ? 'border-[#264A3F] bg-[#FDFCF8] ring-1 ring-[#264A3F]/30 shadow-lg'
          : 'border-[#264A3F]/15 bg-white hover:border-[#264A3F]/40'
      }`}
    >
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
        {/* Left Column: Logo & Certificate Sample Card */}
        <div className="w-full lg:w-1/3 flex flex-col items-center text-center p-4 bg-white rounded-xl border border-[#264A3F]/15 shadow-sm">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center p-2 mb-2">
            <img
              src={cert.logo || cert.src}
              alt={`${cert.name} Logo`}
              onError={handleImageError}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#264A3F] mb-0.5">
            {cert.name}
          </h3>
          <p className="text-xs font-sans text-[#264A3F]/75 mb-3 uppercase tracking-wider font-semibold">
            {cert.lab}
          </p>

          <div
            onClick={() => onEnlarge(cert)}
            className="w-full mt-1 rounded-lg overflow-hidden border border-[#264A3F]/30 bg-[#FDFCF8] relative group shadow-sm cursor-zoom-in hover:border-[#264A3F] transition-all"
            title="Click to view full certificate image"
          >
            <div className="relative h-48 sm:h-56 w-full flex items-center justify-center p-2 bg-white">
              <img
                src={cert.src}
                alt={`Official Sample ${cert.name}`}
                onError={handleImageError}
                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 select-none">
                <div className="transform -rotate-[25deg] text-[#264A3F]/15 font-serif font-black text-xl sm:text-2xl uppercase tracking-[0.2em] border border-dashed border-[#264A3F]/20 px-3 py-1 rounded">
                  SAMPLE
                </div>
              </div>

              <div className="absolute top-2 right-2 z-20 bg-[#264A3F] text-white font-sans text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-90 group-hover:opacity-100 transition-all flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>Enlarge</span>
              </div>
            </div>

            <div className="bg-[#264A3F]/10 border-t border-[#264A3F]/15 py-1.5 px-3 text-center flex items-center justify-center gap-1.5">
              <span className="text-[11px] font-sans font-bold text-[#264A3F] uppercase tracking-wider">
                Sample {cert.name} Document
              </span>
              <span className="text-[10px] text-[#264A3F]/70">(Click to view)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Text Information & Verification Box */}
        <div className="w-full lg:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-sans font-bold text-[#264A3F] uppercase tracking-widest bg-[#264A3F]/10 px-2.5 py-0.5 rounded-sm">
                Certificate #{index + 1}
              </span>
              {cert.blogDetails?.established && (
                <span className="text-xs font-sans text-[#264A3F]/70 italic">
                  Est. {cert.blogDetails.established}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#264A3F] mb-3">
              {cert.title} Analysis &amp; Standards
            </h2>

            <p className="text-xs sm:text-sm font-sans text-[#264A3F]/90 leading-relaxed mb-4">
              {cert.description} {cert.blogDetails?.reputation}
            </p>

            {cert.blogDetails?.keyFeatures && (
              <div className="mb-4">
                <h4 className="text-xs font-sans font-bold text-[#264A3F] uppercase tracking-wider mb-2">
                  Key Testing Capabilities:
                </h4>
                <ul className="space-y-1.5">
                  {cert.blogDetails.keyFeatures.map((feature, fIdx) => (
                    <li key={fIdx} className="text-xs sm:text-sm font-sans text-[#264A3F]/80 flex items-start gap-2">
                      <span className="text-[#264A3F] font-bold text-base leading-none">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cert.blogDetails?.whyTrust && (
              <p className="text-xs font-sans italic text-[#264A3F]/80 bg-[#264A3F]/5 p-3 rounded-lg border-l-2 border-[#264A3F] mb-4">
                "{cert.blogDetails.whyTrust}"
              </p>
            )}
          </div>

          <div className="bg-[#264A3F]/5 border border-[#264A3F]/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
            <div>
              <h4 className="font-sans font-bold text-xs sm:text-sm text-[#264A3F]">
                Verify {cert.name} Online
              </h4>
              <p className="text-[11px] sm:text-xs text-[#264A3F]/75 font-sans mt-0.5">
                Direct access to official {cert.lab} verification portal.
              </p>
            </div>

            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Verify ${cert.name} on official portal`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#264A3F] hover:bg-[#1A362D] text-white font-sans text-xs sm:text-sm font-semibold rounded-md transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
            >
              <span>Verify Certificate</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Gemrishi Vlog Component
 */
const GemrishiVlog = ({ customCertificates, activeCertId, onBackToViewer }) => {
  const certificates = useMemo(() => customCertificates || certificatesData, [customCertificates]);
  const [selectedCert, setSelectedCert] = useState(() => (certificates && certificates.length > 0 ? certificates[0] : null));
  const [previewImage, setPreviewImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const scrollToCertSection = useCallback((certId) => {
    const element = document.getElementById(`cert-blog-${certId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const syncStateFromURL = useCallback(() => {
    if (!certificates || certificates.length === 0) return;

    const searchParams = new URLSearchParams(window.location.search);
    const certSlug = searchParams.get('cert');
    const certIdParam = searchParams.get('certId');
    const hash = window.location.hash;

    const targetId = activeCertId || certIdParam;
    let matched = certificates.find((c) =>
      (targetId && String(c.id) === String(targetId)) ||
      (certSlug && c.slug === certSlug) ||
      (hash && (hash.includes(`cert-${c.id}`) || hash.includes(`cert-blog-${c.id}`)))
    );

    if (!matched && certificates.length > 0) {
      matched = certificates[0];
    }

    if (matched) {
      setSelectedCert((prev) => {
        if (!prev || prev.id !== matched.id) {
          return matched;
        }
        return prev;
      });
      setTimeout(() => {
        scrollToCertSection(matched.id);
      }, 150);
    }
  }, [activeCertId, certificates, scrollToCertSection]);

  useEffect(() => {
    syncStateFromURL();
    const handlePopState = () => syncStateFromURL();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [syncStateFromURL]);

  const handleCloseModal = useCallback(() => {
    setPreviewImage(null);
    setZoomLevel(1);
  }, []);

  useEffect(() => {
    if (previewImage) {
      setZoomLevel(1);
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleCloseModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [previewImage, handleCloseModal]);

  const handleBack = useCallback(() => {
    if (onBackToViewer) {
      onBackToViewer();
    } else {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.pushState({}, '', window.location.pathname.replace(/\/vlog$/, '/'));
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, [onBackToViewer]);

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-[#264A3F] font-serif p-3 sm:p-5 md:p-8 lg:p-10 flex flex-col items-center">
      <div className="max-w-7xl w-full bg-white/95 backdrop-blur-lg border border-[#264A3F]/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-5 sm:p-8 md:p-12 shadow-2xl relative transition-all duration-300 my-auto">
        
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md py-4 border-b border-[#264A3F]/15 mb-8 flex flex-wrap items-center justify-between gap-4 -mx-5 sm:-mx-8 md:-mx-12 px-5 sm:px-8 md:px-12">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#264A3F] bg-[#264A3F]/10 hover:bg-[#264A3F]/20 px-3 py-1.5 rounded-md transition-all cursor-pointer"
            >
              ← Back to Certificate Viewer
            </button>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#264A3F] hidden sm:block">
              Gemrishi Lab Verification Directory
            </h2>
          </div>

          {/* Quick Navigation Chips */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
            {certificates.map((cert) => (
              <button
                key={cert.id}
                onClick={() => {
                  setSelectedCert(cert);
                  scrollToCertSection(cert.id);
                  window.history.pushState({ page: 'blog', certId: cert.id }, '', `?page=blog&cert=${cert.slug}#cert-${cert.id}`);
                }}
                className={`px-3 py-1 rounded-md text-xs font-sans font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCert?.id === cert.id
                    ? 'bg-[#264A3F] text-white shadow-sm'
                    : 'bg-[#264A3F]/10 text-[#264A3F] hover:bg-[#264A3F]/20'
                }`}
              >
                {cert.name}
              </button>
            ))}
          </div>
        </div>

        {/* Intro Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <span className="text-xs font-sans font-bold text-[#264A3F] tracking-widest uppercase bg-[#264A3F]/10 px-3 py-1 rounded-md">
            Official Laboratory Directory &amp; Verification Guide
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#264A3F] mt-3 font-semibold">
            Understanding Gemstone Authentication &amp; Lab Reports
          </h1>
          <p className="text-[#264A3F]/80 font-sans text-sm sm:text-base mt-3 leading-relaxed">
            Gemrishi partners exclusively with the world’s top gemological laboratories to guarantee 100% natural, untreated gemstones with full report verification transparency.
          </p>
        </div>

        {/* Certificates Detailed List */}
        <div className="space-y-12 sm:space-y-16">
          {certificates.map((cert, index) => (
            <CertificateSection
              key={cert.id}
              cert={cert}
              index={index}
              isSelected={selectedCert?.id === cert.id}
              onEnlarge={setPreviewImage}
            />
          ))}
        </div>

        {/* Bottom Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#264A3F] hover:bg-[#1A362D] text-white font-sans text-sm font-semibold rounded-md transition-all shadow-lg cursor-pointer"
          >
            <span>↑ Back to Main Certificate Viewer</span>
          </button>
        </div>
      </div>

      {/* Lightbox Popup Modal */}
      <LightboxModal
        previewImage={previewImage}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default GemrishiVlog;

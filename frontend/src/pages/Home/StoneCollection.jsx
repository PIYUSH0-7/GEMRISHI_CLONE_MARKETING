"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Icons
import Ruby from "../../assets/Stone/Ruby.svg";
import BlueSapphire from "../../assets/Stone/BlueSapphire.svg";
import YellowSapphire from "../../assets/Stone/YellowSapphire.svg";
import Hessonite from "../../assets/Stone/Hessonite.svg";
import Coral from "../../assets/Stone/Coral.svg";
import Pearl from "../../assets/Stone/Pearl.svg";
import Diamond from "../../assets/Stone/Diamond.svg";
import Emerald from "../../assets/Stone/Emerald.svg";
import catsEye from "../../assets/Stone/catsEye.svg";
// ----------------add By Pawan-----------------------";

// Utils
import { appendRandomString } from "../../utils/randomString";

import GlobalShipping from "../../assets/PeaceMind/GlobalShipping.svg";
import EasyReturns from "../../assets/PeaceMind/EasyReturns.svg";
import CertifiedGems from "../../assets/PeaceMind/CertifiedGems.svg";

// --- COMPONENTS ---

const SectionTitle = ({ title, subtitle }) => (
  <div className="text-center mb-12 space-y-3">
    <span className="text-[#264A3F] text-[10px] font-bold tracking-[0.25em] uppercase">
      {subtitle}
    </span>
    {/* Reduced font size from text-5xl to text-4xl to match Jewellery Section */}
    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight">
      {title}
    </h2>
    <div className="w-16 h-[1px] bg-[#264A3F]/20 mx-auto mt-4"></div>
  </div>
);

const StoneCard = ({ stone, onClick }) => (
  <div
    onClick={onClick}
    className="group flex flex-col items-center cursor-pointer h-full justify-between"
  >
    {/* Image Container - Circular Medallion Style */}
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full flex shrink-0 items-center justify-center bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-500 group-hover:shadow-[0_20px_40px_-12px_rgba(38,74,63,0.15)] group-hover:border-[#264A3F]/30 group-hover:-translate-y-2">
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 rounded-full bg-radial-gradient from-[#264A3F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <img
        src={stone.image}
        alt={stone.name}
        width="115"
        height="115"
        className="w-3/5 h-3/5 object-contain z-10 transition-transform duration-500 group-hover:scale-110"
      />
    </div>

    {/* Text & Premium Button */}
    <div className="mt-6 text-center flex flex-col items-center gap-4">
      <h3 className="text-xl font-serif text-gray-900 group-hover:text-[#264A3F] transition-colors duration-300">
        {stone.name}
      </h3>

      {/* ⭐ PREMIUM BUTTON UPGRADE ⭐ */}
      <span className="inline-block px-6 py-2.5 border border-[#264A3F]/30 text-[#264A3F] text-[10px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-500 group-hover:bg-[#264A3F] group-hover:text-white group-hover:border-[#264A3F] group-hover:shadow-md">
        View Collection
      </span>
    </div>
  </div>
);

const FeatureItem = ({ img, label, description }) => (
  <div className="flex flex-col items-center text-center px-6">
    <div className="w-16 h-16 flex items-center justify-center mb-4 bg-[#264A3F]/5 rounded-full p-3">
      <img src={img} alt={label} width="40" height="40" className="w-full h-full object-contain" />
    </div>
    <h3 className="text-[#264A3F] font-serif text-lg mb-1">{label}</h3>
    {description && (
      <p className="text-xs text-gray-500 max-w-[200px]">{description}</p>
    )}
  </div>
);

function StoneCollection() {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const URL = import.meta.env.VITE_URL;

  // Default Fallback Images
  const defaultImages = [
    Ruby,
    BlueSapphire,
    YellowSapphire,
    Hessonite,
    Coral,
    Pearl,
    Diamond,
    Emerald,
    catsEye,
  ];

  // Map subcategories to their primary colors for filtering
  const getColorForSubcategory = (subcategoryName) => {
    const normalizedName = subcategoryName?.trim().toLowerCase();
    const colorMapping = {
      ruby: 'red',
      'blue sapphire': 'blue',
      'yellow sapphire': 'yellow',
      emerald: 'green',
      coral: 'red', // Coral is typically red
      'cats eye': 'yellow', // Often yellow/brown
      hessonite: 'yellow', // Typically orange-brown
      pearl: 'grey', // Pearls can be white/grey
      diamond: 'grey', // Diamonds are clear, but grey as fallback
    };
    return colorMapping[normalizedName] || 'grey'; // Default to grey if not found
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${URL}/subcategory/get-subcategories`);
        const fetched = Array.isArray(res.data.subcategories)
          ? res.data.subcategories.slice(0, 10) // Show top 10 nicely
          : [];

        const mapped = fetched.map((item, idx) => ({
          ...item,
          image: item.image?.url || defaultImages[idx % defaultImages.length],
        }));

        setSubcategories(mapped);
        setError(false);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [URL]);

  // --- Loading Skeleton ---
  if (loading)
    return (
      <div className="w-full py-20 bg-[#FDFCF8]">
        <div className="container mx-auto px-6">
          <div className="h-8 w-64 bg-gray-200 mx-auto rounded mb-16"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center space-y-4 animate-pulse"
              >
                <div className="w-40 h-40 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  // --- Error State ---
  if (error || subcategories.length === 0) return null; // Or return a polite empty state

  return (
    <section className="w-full bg-[#FDFCF8] font-sans">
      {/* 1. COLLECTION SECTION */}
      <div className="py-5 lg:py-13 container mx-auto px-6">
        <SectionTitle
          title="Curated Gemstones"
          subtitle="Discover Your Power"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-16">
          {subcategories.map((stone, index) => (
            <StoneCard
              key={index}
              stone={stone}
              onClick={() => {
                const color = getColorForSubcategory(stone.name);
                const slug = stone.slug || stone.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                navigate(`/gemstone/${slug}`);
              }}
            />
          ))}
        </div>
      </div>
      <div className=" mb-8 flex justify-center ">
         <button
         onClick={() => navigate("/gemstone")}
        className="mt-2  px-5 py-3 inline-flex items-center rounded-3xl border-1 border-green-800 gap-2 text-black font-semibold hover:bg-green-950 hover:text-white transition-colors duration-300"
         >
       <span>Explore  All Collection</span>
         </button>
      </div>
      {/* 2. PEACE OF MIND SECTION (Premium Band) */}
      <div className="w-full bg-white border-t border-gray-100 py-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2">
              Shop with Confidence
            </h3>
            <p className="text-gray-500 text-sm">
              We ensure every step of your journey is secure and transparent.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0 lg:divide-x divide-gray-100">
            <FeatureItem
              img={GlobalShipping}
              label="Global Shipping"
              description="Insured delivery to over 50 countries worldwide."
            />
            <FeatureItem
              img={EasyReturns}
              label="Easy Returns"
              description="10-day hassle-free return policy on all orders."
            />
            <FeatureItem
              img={CertifiedGems}
              label="Certified Gems"
              description="100% authentic, lab-certified natural gemstones."
            />
            <FeatureItem
              img="/heart.svg" // Make sure this path is correct or import it
              label="Ethical Sourcing"
              description="Responsibly mined and conflict-free sourcing."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StoneCollection;

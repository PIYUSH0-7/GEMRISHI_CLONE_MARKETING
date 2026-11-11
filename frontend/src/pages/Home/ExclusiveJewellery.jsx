"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GemsrishiRing from "../../assets/ExclusiveJewellery/GemsrishiRing.svg";
import GemrishiEarring from "../../assets/ExclusiveJewellery/GemrishiEarring.svg";
import GemrishiRing2 from "../../assets/ExclusiveJewellery/GemrishiRing2.svg";
import { useNavigate } from "react-router-dom";
import thumbnail1 from "../../assets/mythvsscblogb1-1024x579.webp"
import thumbnail2 from "../../assets/Emerald-for-Taurus-Good-or-Bad.jpg.webp"
import thumbnail3 from "../../assets/Best-Zodiac-Signs-to-Wear-Emerald.jpg.webp"
import thumbnail4 from "../../assets/Emerald-for-Aquarius-Benefits-Explained-s-1024x478.jpg.webp"

function ExclusiveJewellery() {
  const [currentIndex, setCurrentIndex] = useState(0);

const blogCards = [
  {
    image: thumbnail1,
    title: "Myths vs. Science: Do Gemstones Really Affect?",
    desc: "For centuries, gemstones have captivated humans with their beauty…",
  },
  {
    image: thumbnail2,
    title: "Emerald for Taurus: Good or Bad?",
    desc: "Gemstones are not just pieces of jewelry; they carry cosmic energies that can influence one’s life in surprising ways. One such intriguing gem is the emerald…",
  },
  {
    image: thumbnail3,
    title: "Best Zodiac Signs to Wear Emerald",
    desc: "Choosing the right gemstone is a powerful way to align your energy with cosmic forces. If you are searching for the Best Zodiac Signs to Wear Emerald, this guide will unlock all the secrets you need! Emerald, available at GemRishi, has captivated hearts for centuries with its brilliant green hue and transformative properties",
  },
  {
    image: thumbnail4,
    title: "Emerald for Aquarius",
    desc: "Are you an Aquarius seeking harmony, success, and mental clarity? Then exploring the emerald might just be your next cosmic step! This comprehensive guide reveals how wearing an emerald for Aquarius can bring profound transformations, backed by expert advice ",
  },
];


  const nextSlide = () => {
    if (currentIndex < blogCards.length - 3) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const nextSlideMobile = () => {
    setCurrentIndex((prev) => (prev + 1) % blogCards.length);
  };

  const prevSlideMobile = () => {
    setCurrentIndex((prev) => (prev - 1 + blogCards.length) % blogCards.length);
  };

  return (
    <>
      <div className="w-full">
        <div className="w-full h-[100px] flex justify-center items-center mt-32">
          <p className="text-3xl  text-[#0B1D3A]">Exclusive Jewellery</p>
        </div>

        {/* Jewelry Section - Responsive */}
        <div className="w-full min-h-[400px] flex flex-col lg:flex-row justify-center lg:justify-around items-center gap-8 lg:gap-4 px-4 lg:px-[100px] py-8">
          <div className="w-full max-w-[350px] lg:w-[350px] h-full flex flex-col items-center">
            <div>
              <img
                src={"/blue.webp"}
                alt="Blue Sapphire Ring"
                className="pb-8 w-full max-w-[300px]"
              />
            </div>
            <div>
              <p className="text-xl lg:text-2xl  text-center">
                Blue Sapphire Rings
              </p>
            </div>
          </div>
          <div className="w-full max-w-[350px] lg:w-[350px] h-full flex flex-col items-center">
            <div>
              <img
                src={"/emerald.webp"}
                alt="Blue Sapphire Earrings"
                className="pb-8 w-full max-w-[300px]"
              />
            </div>
            <div>
              <p className="text-xl lg:text-2xl  text-center">Emerald Rings</p>
            </div>
          </div>
          <div className="w-full max-w-[350px] lg:w-[350px] h-full flex flex-col items-center">
            <div>
              <img
                src={"/yellow.webp"}
                alt="Blue Sapphire Ring Design"
                className="pb-8 w-full max-w-[300px]"
              />
            </div>
            <div>
              <p className="text-xl lg:text-2xl  text-center">
                Yellow Sapphire Rings
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-[50px] lg:h-[100px]"></div>

        {/* Blog Section - Responsive Carousel */}
        <div className="w-full min-h-[480px] sm:min-h-[620px] bg-gray-100 flex flex-col">
          <div className="w-full h-[160px] sm:h-[200px]  flex items-center justify-center">
            <p className="text-2xl font-semibold lg:text-3xl text-[#0B1D3A]">
              Our Blogs
            </p>
          </div>

          {/* Desktop View - 3 cards with partial next card visible */}
          <div className="hidden lg:flex w-full h-[260px] justify-center items-center gap-4 px-4">
            <div>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`rounded-full w-[50px] h-[50px] flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  currentIndex === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#264A3F] hover:bg-[#1a3329]"
                }`}
              >
                <ChevronLeft size={30} className="text-white" />
              </button>
            </div>

            {/* Carousel Container with overflow hidden */}
            <div className="w-[1300px] overflow-hidden">
              <div
                className="flex gap-4 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 420}px)`,
                }}
              >
                {blogCards.map((card, index) => (
                  <div
                    key={index}
                    className="w-[90vw] sm:w-[400px] h-[350px] rounded-md flex-shrink-0 bg-white overflow-hidden duration-300 p-1 shadow-md"
					onClick={() => window.open("/blogs", "_blank")}
                  >
                    {/* Image Section */}
                    <div className="w-full h-[200px]">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover rounded-t-md"
                      />
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col justify-center h-[130px] px-6 py-3">
                      <p className="font-semibold text-lg text-gray-900 leading-tight line-clamp-2">
                        {card.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={nextSlide}
                disabled={currentIndex >= blogCards.length - 3}
                className={`rounded-full w-[50px] h-[50px] flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  currentIndex >= blogCards.length - 3
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#264A3F] hover:bg-[#1a3329]"
                }`}
              >
                <ChevronRight size={30} className="text-white" />
              </button>
            </div>
          </div>

          {/* Mobile/Tablet View - Single card with smooth transition */}
          <div className="lg:hidden flex w-full h-[260px] justify-center items-center gap-4 px-4">
            <div>
              <button
                onClick={prevSlideMobile}
                className="rounded-full w-[40px] h-[40px] flex items-center justify-center cursor-pointer bg-[#264A3F] hover:bg-[#1a3329] transition-colors duration-300"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
            </div>

            <div className="w-full max-w-[350px] overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {blogCards.map((card, index) => (
                  <div
                    key={index}
                    className="w-full min-w-full h-[260px] rounded-md flex-shrink-0 shadow-2xl bg-white"
					onClick={() => window.open("/blogs", "_blank")}
                  >
                    <div className="w-full h-[130px]">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover rounded-t-md"
                      />
                    </div>

                    <div className="w-full h-[130px] flex flex-col justify-center rounded-b-md px-6">
                      <p className="font-bold text-[17px] leading-tight text-gray-900 line-clamp-2">
                        {card.title}
                      </p>
                      <p className="text-gray-700 mt-2 line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={nextSlideMobile}
                className="rounded-full w-[40px] h-[40px] flex items-center justify-center cursor-pointer bg-[#264A3F] hover:bg-[#1a3329] transition-colors duration-300"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </div>
          </div>

          {/* Dots indicator for mobile */}
          <div className="lg:hidden flex justify-center mt-4 gap-2">
            {blogCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-[#264A3F] scale-125"
                    : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ExclusiveJewellery;

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function TestimonialReview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const testimonials = [
		{
			id: 0,
			type: "social-proof",
			title: "Trusted by Shoppers Across India",
			text: "Real customers share how our quality products, fast delivery, and seamless shopping experience made their purchases worth it.",
		},
		{
			id: 1,
			rating: 5,
			text: "Gemrishi aims to change the way gems are bought in the country. It can be instrumental in buying you the natural and lab-certified Gomed for your businesses.",
			name: "Vishnuvardhan",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/264A3F/FFFFFF?text=V",
		},
		{
			id: 2,
			rating: 5,
			text: "Medical entrance requires more than just luck. Hessonite checked my progress. Today I have a lucrative career as a doctor. Tks Gemrishi.",
			name: "Dr. Vishwanathan Anand",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/0B1D3A/FFFFFF?text=VA",
		},
		{
			id: 3,
			rating: 5,
			text: "Binge-eating and sleeping disorder became my way of life after my silver business failed. It sprang up for good after I bought Hessonite from Gemrishi.",
			name: "Annu Kapur",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/0B1D3A/FFFFFF?text=AK",
		},
		{
			id: 4,
			rating: 5,
			text: "Dealing with lab IGI-GTL certified yellow sapphire and other gems, Gemrishi gives you the best quality and value for money.",
			name: "Paramjeet Singh",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/0B1D3A/FFFFFF?text=PS",
		},
		{
			id: 5,
			rating: 5,
			text: "You can look for authentic and natural Pukhraj stones at Gemrishi, which is counted as one of India’s best online and offline gemstone shopping stores.",
			name: "Deepika Pallikal",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/0B1D3A/FFFFFF?text=DP",
		},
	];

  const nextSlide = () => {
    if (isMobile) {
      if (currentIndex < testimonials.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      if (currentIndex < testimonials.length - 3) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-red-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  // Effect to handle smooth scrolling for desktop
  useEffect(() => {
    if (carouselRef.current && !isMobile) {
      const cardWidth = 360; // Updated width of a card
      const gap = 24; // gap between cards
      const scrollPosition = currentIndex * (cardWidth + gap);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex, isMobile]);

  return (
    <div
      className="w-full bg-cover bg-center py-16"
      style={{
        backgroundImage: `url(/placeholder.svg?height=800&width=1200&query=light background pattern)`,
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-xl md:text-3xl">TESTIMONIALS</p>
      </div>

      {/* Title */}
      <div className="text-center mb-12 px-4">
        <p className="text-xl md:text-3xl font-bold">
          What Our Happy User Says
        </p>
      </div>

      {/* Desktop Carousel */}
      <div className="hidden lg:flex items-center gap-6 px-6 w-full justify-center">
        {/* LEFT ARROW */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="rounded-full w-12 h-12 bg-[#264A3F] hover:bg-[#1a3329] 
      disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>

        {/* CARDS */}
        <div
          ref={carouselRef}
          className="flex gap-12 w-full "
        >
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="w-[360px] min-h-[340px] bg-white rounded-lg shadow-lg flex flex-col flex-shrink-0"
            >
              {/* SOCIAL PROOF CARD */}
              {item.type === "social-proof" ? (
                <>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-[#0B1D3A] mb-4">
                      {item.title}
                    </h2>
                    <p className="text-gray-700 leading-relaxed flex-1">
                      {item.text}
                    </p>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="flex -space-x-2">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white font-bold">
                        N
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-yellow-600 flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-red-600 flex items-center justify-center text-white font-bold">
                        N
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center text-white text-xs font-bold">
                        +234
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-[#264A3F] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        "
                      </div>
                    </div>
                    <div className="flex justify-center mb-4">
                      {renderStars(item.rating)}
                    </div>
                    <p className="text-gray-700 text-center leading-relaxed flex-1">
                      {item.text}
                    </p>
                  </div>

                  <div className="p-6 pt-0 text-center flex flex-col items-center">
                    <img
                      src={item.avatar}
                      className="w-12 h-12 rounded-full object-cover mb-2"
                    />
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.title}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT ARROW */}
        <button
          onClick={nextSlide}
          disabled={currentIndex >= testimonials.length - 3}
          className="rounded-full w-12 h-12 bg-[#264A3F] hover:bg-[#1a3329] 
      disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden flex w-full justify-center items-center gap-4 px-4 mt-10">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="rounded-full w-11 h-11 bg-[#264A3F] text-white disabled:bg-gray-400"
        >
          <ChevronLeft size={22} />
        </button>

        {/* CARD */}
        <div className="w-full max-w-sm overflow-hidden">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col min-h-[300px]">
            {testimonials[currentIndex].type === "social-proof" ? (
              <>
                <h2 className="text-xl font-bold text-[#0B1D3A] mb-4">
                  {testimonials[currentIndex].title}
                </h2>
                <p className="text-gray-700 leading-relaxed flex-1 mb-6">
                  {testimonials[currentIndex].text}
                </p>

                <div className="flex -space-x-2">
                  <img
                    src="https://placehold.co/50x50/264A3F/FFFFFF?text=SH"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    N
                  </div>
                  <div className="w-10 h-10 rounded-full bg-yellow-600 text-white flex items-center justify-center">
                    M
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
                    N
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-[#264A3F] rounded-full text-white flex items-center justify-center text-2xl font-bold">
                    "
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  {renderStars(testimonials[currentIndex].rating)}
                </div>

                <p className="text-gray-700 text-center mb-6">
                  {testimonials[currentIndex].text}
                </p>

                <div className="flex flex-col items-center">
                  <img
                    src={testimonials[currentIndex].avatar}
                    className="w-12 h-12 rounded-full object-cover mb-2"
                  />
                  <p className="font-semibold">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testimonials[currentIndex].title}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={nextSlide}
          disabled={currentIndex >= testimonials.length - 1}
          className="rounded-full w-11 h-11 bg-[#264A3F] text-white disabled:bg-gray-400"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots */}
      <div className="lg:hidden flex justify-center mt-6 gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${
              currentIndex === index ? "bg-[#264A3F] scale-125" : "bg-gray-400"
            } transition`}
          ></button>
        ))}
      </div>

      <div className="h-16"></div>
    </div>
  );
}

export default TestimonialReview;

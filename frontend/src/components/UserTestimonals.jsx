"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Ring from "../assets/Jwellery/Ring.svg";
import { Star } from "lucide-react";

function UserTestimonials() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isMobile, setIsMobile] = useState(false);
	const carouselRef = useRef(null);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 1024);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const testimonials = [
		{
			id: 1,
			rating: 5,
			text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
			name: "Justus Menke",
			title: "CEO Economan",
			avatar: Ring,
		},
		{
			id: 2,
			rating: 5,
			text: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical literature.",
			name: "Sarah Johnson",
			title: "Marketing Director",
			avatar: Ring,
		},
		{
			id: 3,
			rating: 5,
			text: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text.",
			name: "Michael Chen",
			title: "Product Manager",
			avatar: Ring,
		},
		{
			id: 4,
			rating: 5,
			text: "Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour).",
			name: "Emily Davis",
			title: "Creative Director",
			avatar: Ring,
		},
	];

	const nextSlide = () => {
		if (isMobile) {
			if (currentIndex < testimonials.length - 1) {
				setCurrentIndex((prev) => prev + 1);
			}
		} else {
			if (currentIndex < testimonials.length - 2) {
				setCurrentIndex((prev) => prev + 1);
			}
		}
	};

	const prevSlide = () => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
		}
	};

	const renderStars = (rating) =>
		Array.from({ length: 5 }, (_, index) => (
			<span
				key={index}
				className={`text-sm ${
					index < rating ? "text-red-500" : "text-gray-300"
				}`}>
				★
			</span>
		));

	// Smooth scroll for desktop
	useEffect(() => {
		if (carouselRef.current && !isMobile) {
			const cardWidth = 450; // tighter card width
			const gap = 20;
			const scrollPosition = currentIndex * (cardWidth + gap);
			carouselRef.current.scrollTo({
				left: scrollPosition,
				behavior: "smooth",
			});
		}
	}, [currentIndex, isMobile]);

	return (
		<div
			className="w-full h-[450px] bg-white flex flex-col items-center py-2 mb-16"
			style={{
				backgroundImage: `url(/placeholder.svg?height=800&width=1200&query=light background pattern)`,
			}}>
			{/* Header + Title Section with Background */}
			<div
				className="w-full h-[150px] mt-14 flex flex-col justify-center items-center 
    bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat relative">
				{/* Optional Overlay for better readability */}

				{/* Content */}
				<div className="relative z-10 flex -mt-32 flex-col justify-center items-center text-black px-4">
					{/* Header Section */}
					<p className="text-2xl md:text-3xl  text-center">TESTIMONIAL</p>

					{/* Title Section */}
					<p className="mt-4 text-xl md:text-3xl font-bold  text-center">
						What Our Happy User Says
					</p>
				</div>
			</div>

			{/* Desktop View - 2 per slide */}
			<div className="hidden lg:flex w-full max-w-[1100px] justify-center items-center relative">
				{/* Left Arrow */}
				<button
					onClick={prevSlide}
					disabled={currentIndex === 0}
					className="absolute left-[-60px] top-1/2 -translate-y-1/2 rounded-full w-12 h-12 
          bg-[#264A3F] hover:bg-[#1a3329] disabled:bg-gray-400 disabled:cursor-not-allowed 
          flex items-center justify-center transition">
					<ChevronLeft size={22} className="text-white" />
				</button>

				{/* Cards */}
				<div
					ref={carouselRef}
					className="flex gap-5 w-[1000px] overflow-hidden ">
					{testimonials.map((item) => (
						<div
							key={item.id}
							className="w-[450px] h-[180px] bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0 flex flex-col p-4">
							{/* Top Row */}
							<div className="flex items-center gap-3">
								<img
									src={item.avatar}
									alt={item.name}
									className="w-12 h-12 object-contain"
								/>
								<div>
									<h3 className="text-sm font-semibold text-[#0B1D3A]">
										Trustworthy and Valuable
									</h3>
									<div className="flex">{renderStars(item.rating)}</div>
								</div>
							</div>

							{/* Text */}
							<p className="text-gray-700 text-sm mt-2 ml-14 line-clamp-3">
								{item.text}
							</p>

							{/* Profile */}
							<div className="mt-2 ml-14">
								<p className="font-semibold text-gray-900 text-sm">
									{item.name}
								</p>
								<p className="text-xs text-gray-500">{item.title}</p>
							</div>
						</div>
					))}
				</div>

				{/* Right Arrow */}
				<button
					onClick={nextSlide}
					disabled={currentIndex >= testimonials.length - 2}
					className="absolute right-[-60px] top-1/2 -translate-y-1/2 rounded-full w-12 h-12 
          bg-[#264A3F] hover:bg-[#1a3329] disabled:bg-gray-400 disabled:cursor-not-allowed 
          flex items-center justify-center transition">
					<ChevronRight size={22} className="text-white" />
				</button>
			</div>

			{/* Mobile View */}
			<div className="lg:hidden flex w-full max-w-sm justify-center items-center gap-4 mt-6">
				<button
					onClick={prevSlide}
					disabled={currentIndex === 0}
					className="rounded-full w-10 h-10 bg-[#264A3F] hover:bg-[#1a3329] 
          disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
					<ChevronLeft size={20} className="text-white" />
				</button>

				<div className="w-full overflow-hidden">
					<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col">
						<div className="flex items-center gap-3 mb-2">
							<img
								src={testimonials[currentIndex].avatar}
								alt={testimonials[currentIndex].name}
								className="w-10 h-10 object-contain"
							/>
							<div>
								<h3 className="text-sm font-semibold text-[#0B1D3A]">
									Trustworthy and Valuable
								</h3>
								<div className="flex">
									{renderStars(testimonials[currentIndex].rating)}
								</div>
							</div>
						</div>

						<p className="text-gray-700 text-sm mb-3">
							{testimonials[currentIndex].text}
						</p>

						<div>
							<p className="font-semibold text-gray-900 text-sm">
								{testimonials[currentIndex].name}
							</p>
							<p className="text-xs text-gray-500">
								{testimonials[currentIndex].title}
							</p>
						</div>
					</div>
				</div>

				<button
					onClick={nextSlide}
					disabled={currentIndex >= testimonials.length - 1}
					className="rounded-full w-10 h-10 bg-[#264A3F] hover:bg-[#1a3329] 
          disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
					<ChevronRight size={20} className="text-white" />
				</button>
			</div>
			{/* ---------------- Review Header Section (Google + Trustpilot) ---------------- */}
			<div className="w-full flex justify-center mt-10">
				<div
					className="
      w-
      flex items-center justify-center 
      gap-2 md:gap-2
      bg-[#F7F7F7] 
      py-4 px-6 
      rounded-full shadow-sm
    ">
					{/* Google Review */}
					<div className="flex items-center gap-3">
						<img src="/go.png" alt="Google" className="w-[45px] h-[45px] rounded-full" />

						<div>
							<div className="flex items-center gap-2 text-[20px] font-semibold text-gray-800">
								4.7
								<div className="flex">
									{[1, 2, 3, 4].map((i) => (
										<Star key={i} size={18} fill="#FFC107" color="#FFC107" />
									))}
									<Star size={18} fill="#FFC10755" color="#FFC10755" />
								</div>
							</div>

							<p className="text-gray-600 text-[15px] font-medium">
								7K+ Google Review
							</p>
						</div>
					</div>

					{/* Divider (Optional—looks like screenshot) */}
					<div className="w-[1px] h-10 bg-gray-300 hidden md:block"></div>

					{/* Trustpilot Review */}
					<div className="flex items-center gap-3">
						<div className="w-10 h-14 sm:w-14 sm:h-14 rounded-full bg-white  flex items-center justify-center">
							<img
								src="/trust.png"
								alt="Trustpilot Icon"
								className="w-14 h-4 sm:w-14 sm:h-14 object-contain"
							/>
						</div>

						<div>
							<div className="flex items-center gap-2 text-[20px] font-semibold text-gray-800">
								4.4
								<div className="flex items-center">
									{[1, 2, 3, 4].map((i) => (
										<div
											key={i}
											className="w-5 h-5 bg-[#00B67A] rounded-sm ml-[2px]"></div>
									))}
									<div className="w-5 h-5 bg-[#9DEDB8] rounded-sm ml-[2px]"></div>
								</div>
							</div>

							<p className="text-gray-600 text-[15px] font-medium">
								1K+ Trustpilot Review
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default UserTestimonials;

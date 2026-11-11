"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import blueSapphire from "../assets/Stone/Emerald.svg";
import catseye from "../assets/Stone/catsEye.svg";
import coral from "../assets/Stone/Coral.svg";
import diamond from "../assets/Stone/Diamond.svg";
import yellowsaphire from "../assets/Stone/YellowSapphire.svg";
import hessonite from "../assets/Stone/Hessonite.svg";
import pearl from "../assets/Stone/Pearl.svg";
import ruby from "../assets/Stone/Ruby.svg";
import gomed from "../assets/Stone/gomed.webp";

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
			image: gomed,
		},
		{
			id: 2,
			rating: 5,
			text: "Medical entrance requires more than just luck. Hessonite checked my progress. Today I have a lucrative career as a doctor. Tks Gemrishi.",
			name: "Dr. Vishwanathan Anand",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/0B1D3A/FFFFFF?text=VA",
			image: hessonite,
		},
		{
			id: 3,
			rating: 5,
			text: "Binge-eating and sleeping disorder became my way of life after my silver business failed. It sprang up for good after I bought Hessonite from Gemrishi.",
			name: "Annu Kapur",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/0B1D3A/FFFFFF?text=AK",
			image: hessonite,
		},
		{
			id: 4,
			rating: 5,
			text: "Dealing with lab IGI-GTL certified yellow sapphire and other gems, Gemrishi gives you the best quality and value for money.",
			name: "Paramjeet Singh",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/0B1D3A/FFFFFF?text=PS",
			image: diamond,
		},
		{
			id: 5,
			rating: 5,
			text: "You can look for authentic and natural Pukhraj stones at Gemrishi, which is counted as one of India’s best online and offline gemstone shopping stores.",
			name: "Deepika Pallikal",
			title: "Verified Buyer",
			avatar: "https://placehold.co/50x50/0B1D3A/FFFFFF?text=DP",
			image: pearl,
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
				}`}>
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
			// Removed min-h-[800px] and added natural bottom padding
			className="w-full bg-cover bg-center pb-16 lg:pb-24"
			style={{
				backgroundImage: `url(/placeholder.svg?height=800&width=1200&query=light background pattern)`,
			}}>
			{/* Header + Title Section with Background */}
			<div
				className="w-full pt-14 pb-8 flex flex-col justify-center items-center
    bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat relative">
				{/* Content */}
				<div className="relative z-10 flex flex-col justify-center items-center text-black px-4">
					{/* Header Section */}
					<p className="text-2xl md:text-3xl text-center">TESTIMONIALS</p>

					{/* Title Section */}
					<p className="mt-4 text-xl md:text-3xl font-bold text-center">
						What Our Happy User Says
					</p>
				</div>
			</div>

			{/* Testimonials Section */}
			{/* Removed min-h-[700px] and -mt-32 */}
			<div className="w-full flex flex-col justify-center items-center px-4 md:px-12 mt-8">
				{/* Desktop View - 3 testimonials with external arrows */}
				<div className="hidden lg:flex w-full max-w-[1400px] justify-center items-center gap-8">
					{/* Left Arrow - Outside the cards */}
					<button
						onClick={prevSlide}
						disabled={currentIndex === 0}
						className="rounded-full w-[50px] h-[50px] bg-[#264A3F] hover:bg-[#1a3329] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors duration-300 flex-shrink-0">
						<ChevronLeft size={24} className="text-white" />
					</button>

					{/* Cards Container - Fixed width with proper spacing */}
					<div
						ref={carouselRef}
						className="flex gap-6 py-4 px-4 overflow-hidden max-w-[1150px]">
						{testimonials.map((item) => (
							<div
								key={item.id}
								className="w-[360px] h-[340px] bg-white rounded-lg shadow-lg flex-shrink-0 flex flex-col">
								{item.type === "social-proof" ? (
									// Social Proof Card
									<>
										<div className="p-6 flex-1 flex flex-col">
											<h2 className="text-xl font-bold text-[#0B1D3A] mb-4">
												{item.title}
											</h2>
											<p className="text-gray-700 leading-relaxed flex-1">
												{item.text}
											</p>
										</div>
										{/* Profile section aligned at bottom */}
										<div className="p-6 pt-0">
											<div className="flex -space-x-2">
												<div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                           N
                                        </span>
												</div>
												<div className="w-10 h-10 rounded-full border-2 border-white bg-yellow-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                           M
                                        </span>
												</div>
												<div className="w-10 h-10 rounded-full border-2 border-white bg-red-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                           N
                                        </span>
												</div>
												<div className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">
                                           +234
                                        </span>
												</div>
											</div>
										</div>
									</>
								) : (
									// Regular Testimonial Card
									<>
										<div className="p-6 flex-1 flex flex-col">
											{/* Quote Icon */}
											<div className="flex justify-center mb-4">
												{/* img here */}
												<img
													src={item.image}
													alt="testimonial image"
													className="w-16 h-16 object-cover"
												/>
											</div>

											{/* Stars */}
											<div className="flex justify-center mb-4">
												{renderStars(item.rating)}
											</div>

											{/* Text content */}
											<p className="text-gray-700 text-center leading-relaxed flex-1 line-clamp-4">
												{item.text}
											</p>
										</div>

										{/* Profile section aligned at bottom */}
										<div className="p-6 pt-0">
											<div className="flex items-center justify-center gap-3">
												<img
													src={item.avatar || "/placeholder.svg"}
													alt={item.name}
													className="w-12 h-12 rounded-full object-cover"
												/>
												<div className="text-center">
													<p className="font-semibold text-gray-900">
														{item.name}
													</p>
													<p className="text-sm text-gray-600">{item.title}</p>
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						))}
					</div>

					{/* Right Arrow - Outside the cards */}
					<button
						onClick={nextSlide}
						disabled={currentIndex >= testimonials.length - 3}
						className="rounded-full w-[50px] h-[50px] bg-[#264A3F] hover:bg-[#1a3329] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors duration-300 flex-shrink-0">
						<ChevronRight size={24} className="text-white" />
					</button>
				</div>

				{/* Mobile/Tablet View - 1 testimonial with smooth scroll */}
				<div className="lg:hidden flex w-full max-w-md justify-center items-center gap-4">
					{/* Left Arrow */}
					<button
						onClick={prevSlide}
						disabled={currentIndex === 0}
						className="rounded-full w-[45px] h-[45px] bg-[#264A3F] hover:bg-[#1a3329] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors duration-300 flex-shrink-0">
						<ChevronLeft size={24} className="text-white" />
					</button>

					{/* Single Testimonial */}
					<div className="w-full overflow-hidden">
						<div className="bg-white rounded-lg p-6 shadow-lg min-h-[320px] flex flex-col">
							{testimonials[currentIndex].type === "social-proof" ? (
								// Social Proof Card
								<>
									<h2 className="text-xl font-bold text-[#0B1D3A] mb-4">
										{testimonials[currentIndex].title}
									</h2>
									<p className="text-gray-700 leading-relaxed mb-6 flex-1">
										{testimonials[currentIndex].text}
									</p>
									<div className="flex -space-x-2">
										<img
											src="https://placehold.co/50x50/264A3F/FFFFFF?text=SH"
											alt="User 1"
											className="w-10 h-10 rounded-full border-2 border-white object-cover"
										/>
										<div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center">
											<span className="text-white font-bold text-sm">N</span>
										</div>
										<div className="w-10 h-10 rounded-full border-2 border-white bg-yellow-600 flex items-center justify-center">
											<span className="text-white font-bold text-sm">M</span>
										</div>
										<div className="w-10 h-10 rounded-full border-2 border-white bg-red-600 flex items-center justify-center">
											<span className="text-white font-bold text-sm">N</span>
										</div>
										<div className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center">
											<span className="text-white font-bold text-xs">+234</span>
										</div>
									</div>
								</>
							) : (
								// Regular Testimonial Card
								<>
									<div className="flex justify-center mb-4">
										<img
											src={testimonials[currentIndex].image}
											alt="testimonial image"
											className="w-12 h-12 object-cover"
										/>
									</div>
									<div className="flex justify-center mb-4">
										{renderStars(testimonials[currentIndex].rating)}
									</div>
									<p className="text-gray-700 text-center mb-6 leading-relaxed text-sm flex-1">
										{testimonials[currentIndex].text}
									</p>
									<div className="flex items-center justify-center gap-3">
										<img
											src={
												testimonials[currentIndex].avatar || "/placeholder.svg"
											}
											alt={testimonials[currentIndex].name}
											className="w-12 h-12 rounded-full object-cover"
										/>
										<div className="text-center">
											<p className="font-semibold text-gray-900">
												{testimonials[currentIndex].name}
											</p>
											<p className="text-sm text-gray-600">
												{testimonials[currentIndex].title}
											</p>
										</div>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Right Arrow */}
					<button
						onClick={nextSlide}
						disabled={currentIndex >= testimonials.length - 1}
						className="rounded-full w-[45px] h-[45px] bg-[#264A3F] hover:bg-[#1a3329] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors duration-300 flex-shrink-0">
						<ChevronRight size={20} className="text-white" />
					</button>
				</div>

				{/* Dots Indicator for Mobile */}
				<div className="lg:hidden flex justify-center mt-6 gap-2">
					{testimonials.map((_, index) => (
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
			{/* REMOVED: <div className="w-full h-[100px]"></div> */}
		</div>
	);
}

export default TestimonialReview;
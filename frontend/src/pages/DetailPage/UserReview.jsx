import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BlueSapphireJewellery from "../../components/BlueSapphireJewellery";
import Review from "./Review.json";

function UserReview() {
	const [data] = useState(Review);
	const scrollRef = useRef(null);

	const scrollLeft = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: -600, behavior: "smooth" });
		}
	};

	const scrollRight = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: 600, behavior: "smooth" });
		}
	};

	return (
		<div className="w-full ">
			{/* Testimonial Section */}
			<div className="w-full h-auto  lg:mt-0 mb-8 lg:mb-0">
				<div className="w-full h-auto lg:h-[379px] px-4 sm:px-8 lg:px-46">
					{/* Heading */}
					<div className="w-full h-auto lg:h-[130px] flex flex-col items-center justify-center lg:justify-between mb-6 lg:mb-0">
						<p className="text-[20px] sm:text-[22px] lg:text-[24px] text-gray-800 font-semibold ">
							TESTIMONIAL
						</p>
						<h1 className="text-[22px] sm:text-[24px] lg:text-[26px] font-semibold   pb-3">
							User Review
						</h1>
					</div>

					{/* Scrollable Container with Arrows */}
					<div className="relative w-full h-auto lg:h-[249px] flex items-center justify-center">
						{/* Left Button */}
						<button
							onClick={scrollLeft}
							className="absolute left-[-20px] sm:left-[-30px] lg:left-[-50px] top-1/2 -translate-y-1/2 z-10 rounded-full w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] lg:w-[45px] lg:h-[45px] items-center justify-center bg-[#264A3F] hover:bg-[#1a3329] shadow-md hidden sm:flex">
							<ChevronLeft
								size={20}
								className="text-white sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]"
							/>
						</button>

						{/* Scrollable Content */}
						<div
							ref={scrollRef}
							className="w-full h-full flex flex-row gap-4 sm:gap-6 items-center overflow-x-auto overflow-x-hidden scrollbar-hide px-1 scroll-smooth snap-x snap-mandatory">
							{data.Review.map((item, index) => (
								<div
									key={item.Review + index}
									className="w-[350px] sm:w-[400px] lg:w-[558px] h-[140px] sm:h-[150px] lg:h-[171px] shrink-0 snap-center rounded-[15px] lg:rounded-[20px] border border-[#E2DFDF] border-r-4 border-r-[#A0CD9E] bg-white flex flex-row items-center p-3 lg:p-0">
									{/* Image Section */}
									<div className="w-[23%] h-full flex justify-center items-center">
										<img
											src={item.Image}
											alt=""
											className="w-[60px] h-[56px] sm:w-[85px] sm:h-[80px] lg:w-[99.04px] lg:h-[93px]"
										/>
									</div>

									{/* Content Section */}
									<div className="w-[77%] h-full flex flex-col justify-center text-left pl-2 pr-4">
										{/* Trust and Stars */}
										<div className="w-full flex flex-col mb-1">
											<p className="text-[13px] sm:text-[15px] lg:text-[16px] ">
												{item.Trust}
											</p>
											<img
												src={item.Star}
												alt=""
												className="w-[70px] h-[12px] sm:w-[90px] sm:h-[15px] lg:w-[96px] lg:h-[16.36px]"
											/>
										</div>

										{/* Comment */}
										<div className="w-full">
											<p className="text-[10px] sm:text-[11px] lg:text-[12px]  text-[#2D2E2E] leading-relaxed">
												{item.Comment}
											</p>
										</div>

										{/* Name */}
										<div className="w-full">
											<p className="text-[10px] sm:text-[11px] lg:text-[12px]  text-[#453232] pt-1 lg:pt-2">
												{item.Name}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Right Button */}
						<button
							onClick={scrollRight}
							className="absolute right-[-20px] sm:right-[-30px] lg:right-[-40px] top-1/2 -translate-y-1/2 z-10 rounded-full w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] lg:w-[45px] lg:h-[45px] items-center justify-center bg-[#264A3F] hover:bg-[#1a3329] shadow-md hidden sm:flex">
							<ChevronRight
								size={20}
								className="text-white sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]"
							/>
						</button>
					</div>
				</div>
			</div>
			{/* Jewellery Section */}
			{/* <div className="w-full h-auto lg:h-[566px]">
				<BlueSapphireJewellery />
			</div> */}
		</div>
	);
}

export default UserReview;

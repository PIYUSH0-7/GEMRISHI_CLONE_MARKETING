import React from "react";
import AboutBG from "../../assets/AboutUs/AboutBG.svg";
import Gem from "../../assets/AboutUs/gem.jpg";
import Shop from "../../assets/AboutUs/shop.jpg";
import NaturalGemstones from "../../assets/AboutUs/NaturalGemstones.svg";
import { useNavigate } from "react-router-dom";
import Testimonials from "../../components/Testimonals";
import certified from "../../assets/AboutUs/certified.svg";
import easyReturns from "../../assets/AboutUs/easyReturns.svg";
import shipping from "../../assets/AboutUs/shipping.svg";
import variety from "../../assets/AboutUs/variety.svg";
import Genuine from "../../assets/AboutUs/Genuine.svg";
import Energised from "../../assets/AboutUs/Energised.svg";
import GemstoneReviews from "../Home/GemstoneReviews.jsx";



function AboutUs() {
	const navigate = useNavigate();
	// Replaced non-standard 'px-30' with a responsive padding class,
	// using 'px-4' for mobile and 'lg:px-32' for large screens.
	const PADDING_CLASS = "px-4 lg:px-32";

	const features = [
		{
			title: "CERTIFIED GEMSTONE",
			description:
				"We take pride in offering a large selection of certified gemstones. Each comes with a certificate from a prestigious gem-testing laboratory, ensuring authenticity.",
			image: certified,
			detail:
				"We take pride in offering a large selection of certified gemstones. Each comes with a certificate from a prestigious gem-testing laboratory, ensuring authenticity.",
		},
		{
			title: "EASY RETURNS",
			description:
				"We ship to nearly 195 countries with fast, reliable options like UPS, EMS, and FedEx. Enjoy free worldwide shipping for orders above INR 2,00,000.",
			image: easyReturns,
			detail:
				"We offer a “No-questions asked” 10-day return and refund policy, providing peace of mind with every purchase.",
		},
		{
			title: "WORLDWIDE SHIPPING",
			description:
				"We offer a “No-questions asked” 10-day return and refund policy, providing peace of mind with every purchase.",
			image: shipping,
			detail:
				"We ship to nearly 195 countries with fast, reliable options like UPS, EMS, and FedEx. Enjoy free worldwide shipping for orders above INR 2,00,000.",
		},
	];

	const features2 = [
		{
			title: "WIDE RANGE OF VARIETY",
			description:
				"Gemrishi is one of India’s leading online gem retailers, offering over 10,000 gemstones in various colors, shapes, and sizes to meet diverse needs.",
			image: variety,
			detail:
				"Gemrishi is one of India’s leading online gem retailers, offering over 10,000 gemstones in various colors, shapes, and sizes to meet diverse needs.",
		},
		{
			title: "GENUINE & TRUSTWORTHY",
			description:
				"We ensure that all gemstones are natural, unheated, and untreated, with full transparency on pricing. You’ll also enjoy real-time updates from order placement to delivery.",
			image: Genuine,
			detail:
				"We ensure that all gemstones are natural, unheated, and untreated, with full transparency on pricing. You’ll also enjoy real-time updates from order placement to delivery.",
		},
		{
			title: "EFFECTIVELY ENERGISED",
			description:
				"Our experienced astrologer energizes all gemstones before they are sold, ensuring they provide the best astrological benefits.",
			image: Energised,
			detail:
				"Our experienced astrologer energizes all gemstones before they are sold, ensuring they provide the best astrological benefits.",
		},
	];

	return (
		<>
			{/* TOP PART */}
			<div
				className="w-full h-[318px] bg-cover bg-center"
				style={{ backgroundImage: `url(${AboutBG})` }}>
				{/* Breadcrumbs - changed px-4 to PADDING_CLASS for consistency */}
				<div
					className={
						"w-full h-[58px] flex flex-row items-center gap-2 " + PADDING_CLASS
					}>
					<a
						href="/"
						className=" text-[#444445] cursor-pointer text-base sm:text-[22px]"
						onClick={(e) => {
							e.preventDefault();
							navigate("/");
						}}>
						Home
					</a>
					<span className=" text-[#444445] text-base sm:text-[22px]">&gt;</span>
					<a
						onClick={() => navigate(-1)}
						className="text-[#444445] cursor-pointer text-base sm:text-[22px]">
						About us
					</a>
				</div>
				{/* Title */}
				<div className="w-full h-[110px] flex justify-center items-center text-center">
					<h1 className="text-[32px] sm:text-[42px]  font-semibold">
						About Us
					</h1>
				</div>
				{/* Tagline */}
				<div className="w-full h-[150px] flex flex-col items-center text-center text-[20px] sm:text-[26px] font-semibold ">
					<p>Experience the change with gemstones from</p>
					<p>GEMRISHI</p>
				</div>
			</div>

			{/* WELCOME TO GEMRISHI */}
			<div
				className={
					"w-full h-auto flex flex-col gap-4 sm:gap-8 py-10 " + PADDING_CLASS
				}>
				<h3 className="text-[20px] sm:text-[24px]  mt-4 sm:mt-10">
					Welcome to Gemrishi - Your Trusted Source for Premium Gemstones
				</h3>
				<p className="text-[16px] sm:text-[20px] text-[#464646] mb-10 sm:mb-20">
					At Gemrishi, we offer high-quality gemstones that enhance well-being
					and energy healing. Our expert team carefully selects each gemstone,
					ensuring it meets the highest standards. We’re dedicated to providing
					personalized advice and a diverse range of products to suit every
					need.
				</p>
			</div>

			{/* OUR PASSION QUALITY GEMSTONES WITH IMAGE - Made responsive */}
			<div
				className={
					"w-full h-auto py-10 flex flex-col lg:flex-row gap-8 lg:gap-0 " +
					PADDING_CLASS
				}>
				{/* Text Content: Full width on mobile, 62% on large screens */}
				<div className="w-full lg:w-[62%] h-full flex flex-col gap-4 justify-center">
					<h2 className="text-[20px] sm:text-[24px]  mb-2 sm:mb-4">
						Our Passion For Quality Gemstones
					</h2>
					<h5 className="text-[16px] sm:text-[18px]  text-[#264A3F]">
						Our Passion for Quality Gemstones
					</h5>
					<p className="text-[16px] sm:text-[18px] text-[#626262]  lg:mr-15">
						We believe each gemstone tells a unique story. From emeralds’ serene
						beauty to sapphires’ vibrant hues, our collection features nature’s
						finest treasures. We specialize in ethically sourced gemstones that
						meet top-notch standards of quality and craftsmanship.
					</p>
					<h5 className="text-[16px] sm:text-[18px]  text-[#264A3F] mt-4">
						The Art of Gemstone Sourcing and Crafting
					</h5>
					<p className="text-[16px] sm:text-[18px] text-[#626262]  lg:mr-15">
						We source gemstones from around the world, ensuring they are the
						rarest and most beautiful. Our team guarantees each gemstone is cut,
						polished, and certified for perfection.
					</p>
				</div>
				{/* Image: Full width on mobile, 38% on large screens, adjusted image sizing */}
				<div className="w-full lg:w-[38%] h-full flex justify-center items-center">
					<img
						src={Gem}
						alt="Gemstone Passion"
						className="w-full h-auto max-w-[494px] max-h-[324px] rounded-[5px]"
					/>
				</div>
			</div>

			{/* WHY CHOOSE GEMRISHI FOR NATURAL GEMSTONES - Made responsive */}
			<div
				className={
					"w-full h-auto py-10 flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-0 " +
					PADDING_CLASS
				}>
				{/* Image: Full width on mobile, 42% on large screens. Changed order for mobile. */}
				<div className="w-full lg:w-[42%] h-auto order-2 lg:order-1 flex justify-center">
					<img
						src={Shop}
						alt="Natural Gemstones"
						className="w-full h-auto max-w-[494px] max-h-[324px]"
					/>
				</div>
				{/* Text Content: Full width on mobile, 58% on large screens. Changed order for mobile. */}
				<div className="w-full lg:w-[58%] h-auto order-1 lg:order-2 lg:pl-10">
					<h1 className="text-[20px] sm:text-[24px]  mb-4 sm:mb-8">
						Why Choose Gemrishi for Natural Gemstones?
					</h1>
					<p className="text-[16px] sm:text-[18px]  text-[#264A3F] mb-4 sm:mb-6">
						Why Choose Gemrishi for Natural Gemstones?
					</p>
					<ul className="list-disc text-[16px] sm:text-[18px]  ml-7 text-[#626262] leading-relaxed sm:leading-[22px] lg:mr-6">
						<li className="mb-2">
							Ethical Sourcing: We collaborate with miners who follow ethical
							practices, benefiting both communities and the environment.
						</li>
						<li className="mb-2">
							Certified Quality: Each gemstone comes with a certificate of
							authenticity, assuring quality and value.
						</li>
						<li className="mb-2">
							Expert Knowledge: Our gemstone experts carefully curate the best
							selections to match your needs.
						</li>
					</ul>
					<p className="text-[16px] sm:text-[18px] text-[#626262] leading-relaxed sm:leading-[22px] mt-4">
						Gemrishi offers a unique shopping experience, from sourcing to
						customer service, ensuring you receive only the finest gemstones.
					</p>
				</div>
			</div>

			{/* OUR JOURNEY - Made responsive */}
			<div
				className={
					"w-full h-auto py-10 flex flex-col items-center text-center " +
					PADDING_CLASS
				}>
				<h1 className="text-[20px] sm:text-[24px] mb-4 sm:mb-5">
					Our Journey - From Passion to Excellence
				</h1>
				<p className="text-[16px] sm:text-[18px] text-[#626262] leading-relaxed">
					GemRishi, initially established as a YouTube channel in 2020, by the
					renowned jeweler and gemologist, **Dr. Rishi Verma**, is a culmination
					of passion, expertise, and a profound fascination with the mystical
					properties of gemstones. Popular jewellery company Fateh Chand Bansi
					Lal Jewellers, which started their jewellery business in 1904, also
					sold natural gemstones from the beginning. Later, when the fifth
					generation of Fateh Chand Bansi Lal Jewellers came into business, they
					initiated GemRishi. Dr. Rishi, a fifth-generation jeweler and esteemed
					content creator, was captivated by the enchanting ability of gemstones
					to emit frequencies that harmonize with human energies. The journey of
					GemRishi began with a mission to raise awareness about gems and
					jewelry through engaging and informative YouTube videos. As Dr. Rishi
					shared his wealth of knowledge and expertise, the channel gained
					immense popularity. Thousands of viewers expressed a desire to procure
					genuine and certified gemstones but faced apprehensions about trust
					and authenticity on various platforms.Meet Our Team of Experts
				</p>
			</div>

			{/* FEATURE CARDS SECTION - Re-engineered for responsiveness using a grid */}
			<div
				className={
					"w-full flex flex-col justify-center items-center py-10 " +
					PADDING_CLASS
				}>
				{/* Feature Group 1 */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 mb-16">
					{features.map((item, index) => (
						<div
							key={item.title}
							className={`relative w-full max-w-[451px] h-[254px] rounded-lg flex justify-center text-center shadow-md p-4
                            ${index === 1 ? "lg:mt-[60px]" : ""}
                            ${index === 1 ? "bg-[#264A3F4D]" : "bg-[#F6F6F6]"}
                            ${index === 0 ? "lg:ml-12" : ""}
                            ${index === 1 ? "lg:ml-6" : ""}
                            `}>
							<div
								className={`absolute top-[-45px] w-[90px] h-[90px] rounded-full flex items-center justify-center
                                ${
																	index === 1 ? "bg-[#FFFFFF]" : "bg-[#D9D9D9]"
																}`}>
								<img src={item.image} alt="" className="w-[43px] h-[43px]" />
							</div>
							<div className="mt-[30px] flex flex-col items-center">
								<p className="text-[16px] font-sans font-semibold">
									{item.title}
								</p>
								<p className="text-[16px] mt-[30px] px-4 text-sm">
									{item.detail}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Feature Group 2 - Added more spacing for better mobile layout */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16">
					{features2.map((item, index) => (
						<div
							key={item.title}
							className={`relative w-full max-w-[451px] h-[254px] rounded-lg flex justify-center text-center shadow-md p-4
                            ${index === 1 ? "lg:mt-[60px]" : ""}
                            ${
															index === 0 || index === 2
																? "bg-[#264A3F4D]"
																: "bg-[#F6F6F6]"
														}
                            ${index === 0 ? "lg:ml-12" : ""}
                            ${index === 1 ? "lg:ml-6" : ""}
                            `}>
							<div
								className={`absolute top-[-45px] w-[90px] h-[90px] rounded-full flex items-center justify-center
                                ${
																	index === 1 ? "bg-[#D9D9D9]" : "bg-[#ffffff]"
																}`}>
								<img src={item.image} alt="" className="w-[43px] h-[43px]" />
							</div>
							<div className="mt-[30px] flex flex-col items-center">
								<p className=" font-semibold text-[16px]">{item.title}</p>
								<p className="mt-[30px] px-4 text-sm text-[16px]">
									{item.detail}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* TESTIMONIALS */}
			<div>
				{/*<Testimonials />*/}
				<GemstoneReviews/>
			</div>
		</>
	);
}

export default AboutUs;

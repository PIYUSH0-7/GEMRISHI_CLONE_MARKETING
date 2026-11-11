import { useEffect, useRef, useState } from "react";
import { FaPhoneVolume } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CAMPAIGN_CONFIG, isCampaignActive } from "../config/campaignOffers.config.js";
export default function GemstonePopup({ onClose }) {
	const navigate = useNavigate();
	const showFestive = isCampaignActive() && CAMPAIGN_CONFIG.ui.showFestivePopup;
	return (
		<div className="max-w-md mx-auto rounded-2xl bg-gradient-to-b from-[#F8E8EE] via-[#E8E8F8] to-[#E0F6EF] shadow-xl overflow-hidden relative">
			{/* Close Icon */}
			<button
				onClick={onClose}
				className="absolute right-4 top-4 text-gray-500 text-xl cursor cursor-pointer">
				✕
			</button>
			{/* Top Section */}
			<div className="flex items-center gap-4 p-6 pb-2">
				<img
					src="/girl.svg"
					alt="Expert"
					className="w-32 h-32 object-cover rounded-xl"
				/>

				<div>
					<p className="text-lg font-semibold text-gray-800 leading-snug">
						<span className="text-orange-600 font-bold">Still Confused?</span><br />
						<div className="flex flex-row">
						<FaPhoneVolume className="text-blue-400 font-bold mt-1" />
						<p className="text-blue-400 font-bold ml-2 ">
							Call Our
						</p>
						</div>
					</p>
					<p className="text-xl font-bold text-[#0A5C72]">
						GIA Certified Experts
					</p>
				</div>
			</div>

			<hr className="my-4 border-gray-300" />

			{/* Feature List */}
			<div className="px-6 space-y-6 pb-6">
				{/* Personalized */}
				<div className="flex items-start gap-4">
					<div className="bg-[#E7D9FB] p-3 rounded-xl">
						<img src="/personalise.svg" className="w-8 h-8" />
					</div>
					<div>
						<p className="font-bold text-gray-800">Personalized</p>
						<p className="text-gray-600 text-sm">Expert Recommendation</p>
					</div>
				</div>

				{/* Offers */}
				{showFestive ? (
					<div
						onClick={() => {
							if (onClose) onClose();
							navigate("/offers");
						}}
						className="flex items-start gap-4 cursor-pointer hover:bg-white/60 p-1.5 rounded-xl transition-colors"
					>
						<div className="bg-[#F5D2FF] p-3 rounded-xl">
							<img src="/offer.svg" className="w-8 h-8" />
						</div>
						<div>
							<p className="font-bold text-gray-800">Offers</p>
							<p className="text-gray-600 text-sm">{CAMPAIGN_CONFIG.ui.popupOfferText || "Exclusive Navratri Offers"}</p>
						</div>
					</div>
				) : (
					<div className="flex items-start gap-4">
						<div className="bg-[#F5D2FF] p-3 rounded-xl">
							<img src="/offer.svg" className="w-8 h-8" />
						</div>
						<div>
							<p className="font-bold text-gray-800">Offers</p>
							<p className="text-gray-600 text-sm">Exclusive Discount</p>
						</div>
					</div>
				)}

				{/* 100% Satisfaction */}
				<div className="flex items-start gap-4">
					<div className="bg-[#DDE5FF] p-3 rounded-xl">
						<img src="/satisfy.svg" className="w-8 h-8" />
					</div>
					<div>
						<p className="font-bold text-gray-800">100%</p>
						<p className="text-gray-600 text-sm">Satisfaction Guaranteed</p>
					</div>
				</div>
			</div>

			{/* Buttons */}
			<div className="flex items-center justify-between px-6 pb-6 gap-3">
				{/* Chat Now */}
				<a
					href="https://api.whatsapp.com/send/?phone=919817975978&text&type=phone_number&app_absent=0"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-center gap-2 border border-gray-700 w-1/2 py-3 rounded-xl font-semibold">
					<img src="/whatsapp.svg" className="w-6 h-6" />
					Chat Now
				</a>

				{/* Call Now */}
				<a
					href="tel:+919817975978"
					className="flex items-center justify-center gap-2 bg-black text-white w-1/2 py-3 rounded-xl font-semibold">
					<img src="/call.svg" className="w-5 h-5" />
					Call Now
				</a>
			</div>
		</div>
	);
}



// Standalone self-timed wrapper: opens after 5s first time, then 30s after closing
export function AutoGemstonePopup({ initialDelay = 5000, repeatDelay = 700000 }) {
	const [isOpen, setIsOpen] = useState(false);
	const timerRef = useRef(null);

	useEffect(() => {
		timerRef.current = setTimeout(() => {
			setIsOpen(true);
		}, initialDelay);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [initialDelay]);

	const handleClose = () => {
		setIsOpen(false);
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			setIsOpen(true);
		}, repeatDelay);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<GemstonePopup onClose={handleClose} />
		</div>
	);
}

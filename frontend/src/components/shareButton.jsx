import React from "react";
import Share from "../assets/DetailPage/Share.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ShareButton = () => {
	const handleShare = () => {
		const currentUrl = window.location.href;
		navigator.clipboard.writeText(currentUrl);
		toast.success("🔗 Link Copied!", {
			position: "top-center",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light", // 👈 gives white background
			style: {
				background: "#ffffff", // pure white background
				color: "#222", // dark text for contrast
				borderRadius: "8px",
				fontWeight: "500",
				boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
			},
			icon: "🔗", // optional custom icon
		});
	};

	return (
		<div className="relative">
			<button
				onClick={handleShare}
				className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
				<img
					src={Share || "/placeholder.svg"}
					alt="share icon"
					className="w-5 h-5 sm:w-[28.61px] sm:h-[29.55px]"
				/>
			</button>

		</div>
	);
};

export default ShareButton;

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { fixImageUrl } from "../../utils/imageUtils";

const VideoModal = ({ isOpen, onClose, videoUrl }) => {
	// Close on Escape key
	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (e) => {
			if (e.key === "Escape") onClose?.();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	if (!isOpen || !videoUrl) return null;

	const formattedUrl = fixImageUrl(videoUrl);

	const modalContent = (
		<div
			className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[9999] p-4"
			onClick={onClose}
		>
			<div
				className="bg-black rounded-2xl overflow-hidden shadow-2xl relative max-w-2xl w-full border border-gray-800"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					type="button"
					onClick={onClose}
					aria-label="Close video"
					className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/60 hover:bg-black/90 p-2 rounded-full z-20 transition-colors cursor-pointer"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Video Player */}
				<div className="relative aspect-video w-full bg-black flex items-center justify-center">
					<video
						key={formattedUrl}
						src={formattedUrl}
						controls
						autoPlay
						playsInline
						className="w-full h-full object-contain max-h-[75vh]"
					/>
				</div>
			</div>
		</div>
	);

	if (typeof document !== "undefined") {
		return createPortal(modalContent, document.body);
	}
	return modalContent;
};

export default VideoModal;

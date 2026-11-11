"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X } from "lucide-react";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { FaPinterest } from "react-icons/fa"; // ✅ Pinterest from react-icons

export default function SharePopup({ productUrl, productName }) {
	const [isOpen, setIsOpen] = useState(false);
// ----------------Updated by Pawan-----------------------------------------------------
	// Sharing links
	const shareLinks = {
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
			productUrl
		)}`,
		whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
			productUrl
		)}`,
		pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
			productUrl
		)}&description=${encodeURIComponent(productName)}`,
		instagram: "https://www.instagram.com/",
	};
// ------------------Updated by Pawan-----------------------------------------------------
	return (
		<div className="relative">
			{/* Share Button */}
			<button
				onClick={() => setIsOpen(true)}
				className="flex items-center py-2 transition-all cursor cursor-pointer">
				<Share2 className="w-5 h-5" />
			</button>

			{/* Popup Overlay */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Background overlay */}
						<motion.div
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
							onClick={() => setIsOpen(false)}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						/>

						{/* Popup card */}
						<motion.div
							className="fixed inset-0 flex items-center justify-center z-50"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.2 }}>
							<div className="bg-white rounded-2xl shadow-xl w-[90%] sm:w-[380px] p-6 relative">
								{/* Close Button */}
								<button
									onClick={() => setIsOpen(false)}
									className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
									<X className="w-5 h-5" />
								</button>

								<h3 className="text-xl font-semibold text-center mb-4">
									Share this product
								</h3>

								{/* Icons Grid */}
								<div className="grid grid-cols-4 gap-4 justify-center">
									{/* Facebook */}
									<a
										href={shareLinks.facebook}
										target="_blank"
										rel="noopener noreferrer"
										className="flex flex-col items-center hover:scale-110 transition-transform">
										<div className="bg-blue-600 text-white p-3 rounded-full">
											<Facebook size={22} />
										</div>
										<p className="text-sm mt-1">Facebook</p>
									</a>

									{/* WhatsApp */}
									<a
										href={shareLinks.whatsapp}
										target="_blank"
										rel="noopener noreferrer"
										className="flex flex-col items-center hover:scale-110 transition-transform">
										<div className="bg-green-500 text-white p-3 rounded-full">
											<MessageCircle size={22} />
										</div>
										<p className="text-sm mt-1">WhatsApp</p>
									</a>

									{/* Pinterest */}
									<a
										href={shareLinks.pinterest}
										target="_blank"
										rel="noopener noreferrer"
										className="flex flex-col items-center hover:scale-110 transition-transform">
										<div className="bg-red-600 text-white p-3 rounded-full">
											<FaPinterest size={22} />
										</div>
										<p className="text-sm mt-1">Pinterest</p>
									</a>

									{/* Instagram */}
									<a
										href={shareLinks.instagram}
										target="_blank"
										rel="noopener noreferrer"
										className="flex flex-col items-center hover:scale-110 transition-transform">
										<div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white p-3 rounded-full">
											<Instagram size={22} />
										</div>
										<p className="text-sm mt-1">Instagram</p>
									</a>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}

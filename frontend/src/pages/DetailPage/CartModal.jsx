import React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
// --------add by pawan for currency---------------------------
import Price from "../../components/Price";
// --------add by pawan for currency---------------------------

function CartModal({ isOpen, onClose, cartItems = [] }) {
	if (!isOpen) return null;

	// Calculate total
	const total = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	const navigate = useNavigate();

	return (
		// Apply backdrop-blur-sm and a semi-transparent black background
		<div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/30">
			<div className="bg-white rounded-[15px] w-full max-w-[450px] max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h2 className="text-[18px]  text-gray-800 text-center flex-1">
						Your Shopping Cart
					</h2>
					<button
						onClick={onClose}
						className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700">
						<X size={20} />
					</button>
				</div>

				{/* Cart Items */}
				<div className="p-4 max-h-[400px] overflow-y-auto">
					{cartItems.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500 ">Your cart is empty</p>
						</div>
					) : (
						<div className="space-y-4">
							{cartItems.map((item, index) => (
								<div
									key={index}
									className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0">
									{/* Product Image */}
									<div className="w-[80px] h-[80px] flex-shrink-0">
										<img
											src={item.image || "/placeholder.svg"}
											alt={item.name}
											className="w-full h-full object-contain rounded-lg"
										/>
									</div>

									{/* Product Details */}
									<div className="flex-1">
										<h3 className="text-[14px]  font-semibold text-gray-800 mb-1">
											{item.name}
										</h3>
										<p className="text-[12px] text-gray-600 mb-1">
											Item ID : {item.itemId}
										</p>
										<p className="text-[12px] text-gray-600">
											Qty : {item.quantity}
										</p>
										{item.weight && (
											<p className="text-[12px] text-gray-600">
												Weight : {item.weight} g
											</p>
										)}
										{item.metal && (
											<p className="text-[12px] text-gray-600">
												Metal : {item.metal}
											</p>
										)}
										{item.size && (
											<p className="text-[12px] text-gray-600">
												{String(item.name || "").toLowerCase().includes("ring") || String(item.name || "").toLowerCase().includes("signet") ? "Ring Size" : "Size"} : {item.size}
											</p>
										)}
						{/* -----------add by pawan for currency--------------------------- */}
										<p className="text-[14px]  font-semibold text-gray-800 mt-2">
											<Price amount={item.price} />
										</p>
						{/* --------------add by pawan for currency--------------------------- */}				
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				{cartItems.length > 0 && (
					<div className="p-4 border-t bg-gray-50">
						{/* Total */}
						<div className="flex justify-between items-center mb-4">
							<span className="text-[16px]  font-semibold">Total :</span>
					{/* -----------add by pawan for currency--------------------------- */}
							<span className="text-[16px]  font-semibold">
								<Price amount={total} />
							</span>
					{/* -----------add by pawan for currency--------------------------- */}
						</div>

						{/* Buttons */}
						<div className="space-y-3">
							<button className="w-full h-[45px] bg-[#264A3F] text-white  text-[14px] rounded-[8px] hover:bg-[#1a3329] transition-colors">
								Check out
							</button>
							<button
								onClick={() => {
									navigate("/shopping/cart");
									onClose();
								}}
								className="w-full h-[40px] bg-gray-100 text-gray-700  text-[14px] rounded-[8px] hover:bg-gray-200 transition-colors">
								View Cart
							</button>
							<button
								onClick={() => navigate("/shopping/cart")}
								className="w-full h-[40px] bg-white text-gray-600  text-[14px] rounded-[8px] border border-gray-300 hover:bg-gray-50 transition-colors">
								Continue Shopping
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default CartModal;
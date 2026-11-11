import React, { useEffect, useState } from "react";
import Form from "./Form";
import OrderSummary from "./OrderSummary";
import ShoppingMap from "./ShoppingMap";
import { useLocation } from "react-router-dom";

const AddressPageSkeleton = () => (
	<div className="w-full min-h-screen lg:min-h-[1070px] flex flex-col lg:flex-row animate-pulse">
		{/* Left Section Skeleton (Map & Form) */}
		<div className="w-full lg:w-[77%] lg:border-r border-[#D2CFCF] flex flex-col lg:pt-10 p-4 sm:p-6 lg:p-10">
			{/* Steps Map Placeholder */}
			<div className="w-full max-w-[600px] h-8 bg-gray-300 rounded-md mb-8 mx-auto lg:mx-0"></div>

			{/* Form Container Placeholder */}
			<div className="w-full max-w-[910px] mx-auto p-6 bg-white rounded-xl shadow-lg space-y-8">
				{/* Section Header Placeholder */}
				<div className="w-1/4 h-6 bg-gray-300 rounded"></div>

				{/* Input Fields Placeholder */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Placeholder for 6 input rows/pairs */}
					{Array(6)
						.fill(0)
						.map((_, index) => (
							<div
								key={index}
								className="h-10 bg-gray-200 rounded-lg border border-gray-300"></div>
						))}
				</div>

				{/* Submit Button Placeholder */}
				<div className="pt-4 flex justify-end">
					<div className="h-12 w-40 bg-gray-400 rounded-lg"></div>
				</div>
			</div>
		</div>

		{/* Right Section (Order Summary) Skeleton */}
		<div className="w-full lg:w-[23%] p-4 lg:p-6 space-y-6 border-t lg:border-t-0 border-gray-200">
			{/* Order Summary Header Placeholder */}
			<div className="w-2/3 h-6 bg-gray-300 rounded"></div>

			{/* Summary Item Placeholders */}
			{Array(2)
				.fill(0)
				.map((_, index) => (
					<div key={index} className="flex justify-between items-center py-2">
						<div className="h-4 w-1/3 bg-gray-200 rounded"></div>
						<div className="h-4 w-1/4 bg-gray-200 rounded"></div>
					</div>
				))}

			{/* Total Placeholder */}
			<div className="pt-4 flex justify-between font-bold border-t border-gray-300">
				<div className="h-6 w-1/3 bg-gray-300 rounded"></div>
				<div className="h-6 w-1/4 bg-gray-400 rounded"></div>
			</div>
		</div>
	</div>
);

function MainAddressPage() {
	const [isLoading, setIsLoading] = useState(true);
	const location = useLocation();

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});

		// Simulate data loading delay
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 800);

		return () => clearTimeout(timer);
	}, []);

	if (isLoading) {
		return <AddressPageSkeleton />;
	}

	return (
		<div className="w-full min-h-screen lg:min-h-[1070px] flex flex-col lg:flex-row">
			{/* Left Section */}
			<div className="w-full lg:w-[77%] lg:border-r border-[#D2CFCF] flex flex-col lg:pt-10">
				{/* Steps Map */}
				<ShoppingMap activeStep={1} />

				{/* Content */}
				<div className="w-full flex justify-center px-4 md:px-6 mt-6">
					<div className="w-full max-w-[910px] h-auto">
						{/* Form */}
						<Form />
					</div>
				</div>
			</div>

			{/* Right Section */}
			<OrderSummary />
		</div>
	);
}

export default MainAddressPage;

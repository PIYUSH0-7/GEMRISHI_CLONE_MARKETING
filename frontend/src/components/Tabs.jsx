import React, { useState } from "react";

const Tabs = ({ categoryData }) => {
	const [activeTab, setActiveTab] = useState("About");

	const tabs = [
		{ key: "about", label: "About" },
		{ key: "meaning", label: "Meaning" },
		{ key: "buyerGuide", label: "Buyer Guide" },
		{ key: "qualityAndPrice", label: "Quality & Price" },
		{ key: "faqs", label: "FAQ" },
	];


	const renderContent = () => {
		if (!categoryData) return <p className="text-gray-500">No data available.</p>;

		switch (activeTab) {
			case "About":
				return (
					<p className="whitespace-pre-wrap text-gray-700">{categoryData.about || "Information not available."}</p>
				);
			case "Meaning":
				return (
					<p className="whitespace-pre-wrap text-gray-700">{categoryData.meaning || "Information not available."}</p>
				);
			case "Buyer Guide":
				return (
					<p className="whitespace-pre-wrap text-gray-700">{categoryData.buyerGuide || "Information not available."}</p>
				);
			case "Quality & Price":
				return (
					<p className="whitespace-pre-wrap text-gray-700">{categoryData.qualityAndPrice || "Information not available."}</p>
				);
			case "FAQ":
				return (
					<div className="flex flex-col gap-4">
						{categoryData.faqs && categoryData.faqs.length > 0 ? (
							categoryData.faqs.map((faq, index) => (
								<div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
									<h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
									<p className="text-sm text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
								</div>
							))
						) : (
							<p className="text-gray-500">No FAQs available.</p>
						)}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="mt-24 w-full mb-24 px-6 md:px-12">
			{/* Tab Buttons */}
			<div className="border-b border-gray-300">
				<ul className="flex flex-wrap gap-4 text-[14px] font-semibold text-gray-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
					{tabs.map((tab) => (
						<li
							key={tab.key}
							className={`cursor-pointer inline-block pb-4 transition-colors ${
								activeTab === tab.label
									? "text-[#02498F] border-b-2 border-[#02498F]"
									: "hover:text-[#02498F]"
							}`}
							onClick={() => setActiveTab(tab.label)}>
							{tab.label}
						</li>
					))}
				</ul>
			</div>

			{/* ✅ Responsive Tab Content */}
			<div
				className={`mt-6 text-gray-800 text-[16px] leading-relaxed ${
					activeTab ? "block" : "hidden"
				} md:block`}>
				{/* Only show content on mobile if a tab is clicked, always show on md+ */}
				{activeTab && renderContent()}
			</div>
		</div>
	);
};

export default Tabs;

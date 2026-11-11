import React from "react";
import { useNavigate } from "react-router-dom";
import AboutBG from "../../assets/AboutUs/AboutBG.svg";

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-32";

const GoldRate = () => {
	const navigate = useNavigate();

	return (
		<>
			{/* Hero Section */}
			<div
				className="w-full h-[318px] bg-cover bg-center"
				style={{ backgroundImage: `url(${AboutBG})` }}>
				{/* Breadcrumbs */}
				<div
					className={
						"w-full h-[58px] flex flex-row items-center gap-2 " + PADDING_CLASS
					}>
					<a
						href="/"
						className="text-[#444445] cursor-pointer text-base sm:text-[22px]"
						onClick={(e) => {
							e.preventDefault();
							navigate("/");
						}}>
						Home
					</a>
					<span className="text-[#444445] text-base sm:text-[22px]">&gt;</span>
					<a
						onClick={() => navigate(-1)}
						className="text-[#444445] cursor-pointer text-base sm:text-[22px]">
						Gold Rate
					</a>
				</div>

				{/* Title */}
				<div className="w-full h-[110px] flex justify-center items-center text-center">
					<h1 className="text-[32px] sm:text-[42px] font-semibold">
						Today’s Gold Rate
					</h1>
				</div>

				{/* Tagline */}
				<div className="w-full h-[150px] flex flex-col items-center text-center text-[20px] sm:text-[26px] font-semibold ">
					<p>Stay Updated with Live Gold Prices from</p>
					<p>GEMRISHI</p>
				</div>
			</div>

			{/* Main Content */}
			<div className={"w-full h-auto flex flex-col gap-6 " + PADDING_CLASS}>
				{/* Introduction */}
				<p className="text-[#464646] text-[16px] sm:text-[20px] leading-relaxed mt-20 mb-6">
					Gold has long been regarded as one of the most valuable and stable
					investments. Its timeless appeal and enduring worth make it a trusted
					choice for jewelry, investment, and auspicious occasions. At Gemrishi,
					we provide the latest live gold rates to help you make informed
					purchases — whether you're buying gold jewelry, coins, or planning an
					investment.
				</p>

				{/* Gold Rate Table */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					Today’s Gold Price in India
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					Below are the current gold prices per gram across different purities.
					Please note that prices may vary slightly depending on your location,
					taxes, and making charges.
				</p>

				<div className="overflow-x-auto mb-6">
					<table className="min-w-full table-auto border-collapse">
						<thead>
							<tr>
								<th className="border px-4 py-2 text-[16px] sm:text-[18px]">
									Purity
								</th>
								<th className="border px-4 py-2 text-[16px] sm:text-[18px]">
									Price per Gram (INR)
								</th>
								<th className="border px-4 py-2 text-[16px] sm:text-[18px]">
									Price per 10 Grams (INR)
								</th>
							</tr>
						</thead>
						<tbody>
							{[
								{ purity: "24K (999)", gram: "6,350", tenGram: "63,500" },
								{ purity: "22K (916)", gram: "5,850", tenGram: "58,500" },
								{ purity: "18K (750)", gram: "4,800", tenGram: "48,000" },
								{ purity: "14K (585)", gram: "3,750", tenGram: "37,500" },
							].map((row) => (
								<tr key={row.purity}>
									<td className="border px-4 py-2 text-[16px] sm:text-[18px]">
										{row.purity}
									</td>
									<td className="border px-4 py-2 text-[16px] sm:text-[18px]">
										₹ {row.gram}
									</td>
									<td className="border px-4 py-2 text-[16px] sm:text-[18px]">
										₹ {row.tenGram}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Factors Affecting Gold Prices */}
				<h3 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					Factors Affecting Gold Rates
				</h3>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>
						<strong>International Market Trends:</strong> Global gold demand,
						inflation, and geopolitical situations influence Indian gold prices.
					</li>
					<li>
						<strong>Exchange Rate:</strong> Gold prices are affected by the
						value of the Indian Rupee against the US Dollar.
					</li>
					<li>
						<strong>Import Duties:</strong> Government duties and taxes impact
						final retail prices.
					</li>
					<li>
						<strong>Jewelry Making Charges:</strong> Retail jewelers may apply
						additional design and craftsmanship costs.
					</li>
				</ul>

				{/* Why Gemrishi */}
				<h3 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					Why Buy Gold from Gemrishi?
				</h3>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					At Gemrishi, we ensure complete transparency and offer genuine,
					certified gold jewelry at the best market prices. Our gold products
					are BIS-hallmarked, ensuring purity and authenticity. Whether you’re
					purchasing for investment, gifting, or personal adornment, you can
					shop confidently knowing you’re getting the best value.
				</p>

				{/* Footer Links */}
				<div className="text-center mb-24">
					<p className="text-[#264A3F] font-semibold text-[18px] sm:text-[22px] mb-4">
						For Crystal Jewelry Visit{" "}
						<a
							href="https://mandalagoodvibes.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="underline text-[#264A3F] hover:text-[#1b362f] transition-colors duration-200">
							Mandala Good Vibes
						</a>
					</p>
					<p className="text-[#264A3F] font-semibold text-[18px] sm:text-[22px]">
						For Original Gemstones Visit{" "}
						<a
							href="https://gemrishi.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="underline text-[#264A3F] hover:text-[#1b362f] transition-colors duration-200">
							Gemrishi
						</a>
					</p>
				</div>
			</div>
		</>
	);
};

export default GoldRate;

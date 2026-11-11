import React from "react";
import { useNavigate } from "react-router-dom";
import AboutBG from "../../assets/AboutUs/AboutBG.svg";

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-32";

const Shipping = () => {
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
						Shipping Policy
					</a>
				</div>

				{/* Title */}
				<div className="w-full h-[110px] flex justify-center items-center text-center">
					<h1 className="text-[32px] sm:text-[42px] font-semibold">
						Shipping Policy
					</h1>
				</div>

				{/* Tagline */}
				<div className="w-full h-[150px] flex flex-col items-center text-center text-[18px] sm:text-[20px] font-semibold">
					<p>Secure. Reliable. Transparent.</p>
					<p>We deliver your gemstones with utmost care.</p>
				</div>
			</div>

			{/* Main Content */}
				<div className={"w-full h-auto flex flex-col gap-6 " + PADDING_CLASS}>
					{/* Header */}
					<div className="mt-20 mb-6">
						<h1 className="text-[26px] sm:text-[32px] font-bold text-[#264A3F] mb-1">
							GemRishi.com – Shipping Policy
						</h1>
						<p className="text-[#626262] text-[14px] sm:text-[16px] font-medium tracking-wide uppercase mb-1">
							(Detailed Version)
						</p>
						<p className="text-[#626262] text-[14px] sm:text-[16px] font-medium tracking-wide uppercase">
							A Venture of Fateh Chand Bansilal Jewellers
						</p>
					</div>

					{/* 1. Overview */}
					<p className="text-[#464646] text-[16px] sm:text-[20px] leading-relaxed mb-6">
						At GemRishi, we are committed to delivering your gemstones and jewellery with the highest standards of security, reliability, and transparency. This Shipping Policy outlines the terms governing order processing, dispatch, delivery, and logistics.
					</p>

					{/* 2. Order Processing & Dispatch Timeline */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						2. Order Processing & Dispatch Timeline
					</h2>
					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						2.1 Processing Time
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
						All confirmed orders are processed within <strong>2–3 business days</strong> from:
					</p>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						<li>Payment confirmation OR</li>
						<li>Order confirmation (for COD orders)</li>
					</ul>

					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						2.2 Dispatch Timeline Variations
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						Dispatch timelines may vary depending on:
					</p>
					<div className="overflow-x-auto mb-4">
						<table className="min-w-full divide-y divide-gray-200 border text-left text-[#626262] text-[16px] sm:text-[18px]">
							<thead className="bg-[#264A3F] text-white">
								<tr>
									<th className="px-4 py-2 font-semibold">Product Type</th>
									<th className="px-4 py-2 font-semibold">Dispatch Time</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								<tr>
									<td className="px-4 py-2">Loose Gemstones (Ready Stock)</td>
									<td className="px-4 py-2">1–3 business days</td>
								</tr>
								<tr>
									<td className="px-4 py-2">Gemstones with Certification</td>
									<td className="px-4 py-2">5–10 business days</td>
								</tr>
								<tr>
									<td className="px-4 py-2">Customized Jewellery</td>
									<td className="px-4 py-2">5–10 business days</td>
								</tr>
								<tr>
									<td className="px-4 py-2">High-value / Special Stones</td>
									<td className="px-4 py-2">Case-specific</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p className="text-[#626262] text-[16px] sm:text-[18px] italic leading-relaxed mb-6">
						Exact dispatch timelines may be communicated at the time of purchase.
					</p>

					{/* 3. Shipping Methods & Partners */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						3. Shipping Methods & Partners
					</h2>
					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						3.1 Domestic Shipping
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
						We use trusted courier partners:
					</p>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						<li>Bluedart</li>
						<li>Delhivery</li>
						<li>DTDC</li>
						<li>Ambe Express</li>
						<li>BVC</li>
					</ul>

					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						3.2 International Shipping
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
						We ship globally via:
					</p>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						<li>Shipglobal</li>
						<li>BVC</li>
					</ul>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						All shipments are fully trackable (except limited postal cases) and handled through secure logistics channels.
					</p>

					{/* 4. Delivery Timelines */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						4. Delivery Timelines
					</h2>
					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						4.1 Within India
					</h3>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						<li>Metro cities: 2–4 business days from dispatch</li>
						<li>Non-metro cities: 3–7 business days from dispatch</li>
					</ul>

					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						4.2 International Delivery
					</h3>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						<li>Express Shipping: 7–12 business days</li>
						<li>Postal Shipping (if applicable): 10–20 days</li>
					</ul>
					<p className="text-[#626262] text-[16px] sm:text-[18px] italic leading-relaxed mb-6">
						Delivery timelines may vary due to customs clearance, local courier operations, and external factors.
					</p>

					{/* 5. Shipping Charges */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						5. Shipping Charges
					</h2>
					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						5.1 Domestic Shipping
					</h3>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						<li>Free shipping may be available on promotional or qualifying orders.</li>
						<li>Nominal shipping charges may apply for low-value orders.</li>
					</ul>

					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						5.2 International Shipping
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
						Shipping charges depend on destination, product value, and courier type. Charges are clearly communicated before checkout.
					</p>

					{/* 6. Cash on Delivery (COD) */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						6. Cash on Delivery (COD)
					</h2>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						<li>Available on select orders and locations.</li>
						<li>
							Minimum order value may apply:
							<ul className="list-circle pl-6 mt-2">
								<li>COD order shipped up to Rs 10,000 value with 10% advance.</li>
								<li>COD not applicable to order value above Rs 10,000.</li>
							</ul>
						</li>
					</ul>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						GemRishi reserves the right to approve/reject COD orders or request a partial advance for high-value orders.
					</p>

					{/* 7. Packaging, Safety & Insurance */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						7. Packaging, Safety & Insurance
					</h2>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						<li>Tamper-proof, secure packaging.</li>
						<li>Discreet packaging (no gemstone/jewellery mention outside).</li>
						<li>Fully insured shipments until delivery. Insurance cost is included in shipping.</li>
					</ul>

					{/* 8. Order Tracking */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						8. Order Tracking
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
						Tracking details are shared via Email, SMS, WhatsApp, or Call. Customers can track shipments in real-time. In case of tracking delays, customer support can assist further.
					</p>

					{/* 9. Delivery Guidelines */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						9. Delivery Guidelines
					</h2>
					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						9.1 Address Accuracy
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						Customer must provide a correct and complete address. An incorrect address may lead to delivery failure and additional charges.
					</p>

					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						9.2 Delivery Attempts
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						The courier will attempt delivery 2–3 times. After failed attempts, the shipment may be returned to the GemRishi original address.
					</p>

					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						9.3 High-Value Shipment Protocol
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						A signature is mandatory and ID verification may be required. A customer or authorized person must be available to receive the delivery.
					</p>

					{/* 10. International Shipping - Important Terms */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						10. International Shipping - Important Terms
					</h2>
					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						10.1 Customs Duties & Taxes
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						All duties, VAT, and import taxes are to be borne by the customer. Charges vary by the law of the country of Import.
					</p>

					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						10.2 Customs Delays
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
						GemRishi is not responsible for delays caused by customs clearance procedures.
					</p>

					<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
						10.3 Refused Shipments
					</h3>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						If a customer refuses delivery or fails to clear customs, the customer will bear return shipping charges, customs duties, and handling fees. Any applicable refund will be processed after the product is received back, deducting all applicable charges.
					</p>

					{/* 11. Shipment Restrictions */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						11. Shipment Restrictions
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						Certain gemstones/jewellery may not be shippable to specific countries or may face courier restrictions. In such cases, alternate shipping methods will be used, or the order may be declined.
					</p>

					{/* 12. Damaged / Tampered Delivery */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						12. Damaged / Tampered Delivery
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						If the package appears tampered or damaged, the customer must refuse delivery immediately, record video/photo proof, and inform GemRishi within 24 hours. Failure to report may result in claim rejection.
					</p>

					{/* 13. Lost Shipments */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						13. Lost Shipments
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						If a shipment is lost in transit, GemRishi will initiate an investigation. A resolution (replacement/refund) will be provided post verification.
					</p>

					{/* 14. Delays & Force Majeure */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						14. Delays & Force Majeure
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						Delivery may be impacted due to natural disasters, government restrictions, strikes, logistics disruptions, pandemics, or emergency situations. GemRishi will keep the customer informed but shall not be held liable for such delays.
					</p>

					{/* 15. Cancellation Policy */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						15. Cancellation Policy (Shipping Stage)
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						Orders cannot be cancelled once they have been dispatched.
					</p>

					{/* 16. Return Shipment Responsibility */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						16. Return Shipment Responsibility
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						All returns must be securely packed and shipped via a reliable courier. The return shipping cost is borne by the customer.
					</p>

					{/* 17. Liability Limitation */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						17. Liability Limitation
					</h2>
					<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						<li>GemRishi shall not be liable for delays caused by couriers or customs, incorrect addresses provided, or failure of the customer to receive delivery.</li>
						<li>We are not responsible for indirect or consequential losses.</li>
					</ul>

					{/* 18. Customer Responsibility Clause */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						18. Customer Responsibility Clause
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						The customer agrees to provide accurate details, cooperate with the courier/customs, and ensure the timely receipt of the order.
					</p>

					{/* 19. Policy Updates */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						19. Policy Updates
					</h2>
					<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
						GemRishi reserves the right to modify this policy at any time.
					</p>

					{/* 20. Contact Support */}
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
						20. Contact Support
					</h2>
					<p className="text-[#464646] text-[16px] sm:text-[20px] leading-relaxed mb-24">
						If you have questions about your shipment, or if you need help with tracking or delivery issues, please contact us at{" "}
						<a href="mailto:wecare@gemrishi.com" className="underline text-[#264A3F] hover:text-[#1b362f] font-medium">
							wecare@gemrishi.com
						</a>
						. Our support team is always happy to assist.
					</p>

					{/* Footer Links */}
					<div className="text-center mb-24">
						<p className="text-[#264A3F] font-semibold text-[18px] sm:text-[22px] mb-4">
							For Crystal Jewelry Visit{" "}
							<a
								href="https://mandalagoodvibes.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="underline text-[#264A3F] hover:text-[#1b362f] transition">
								Mandala Good Vibes
							</a>
						</p>
						<p className="text-[#264A3F] font-semibold text-[18px] sm:text-[22px]">
							For Original Gemstones Visit{" "}
							<a
								href="https://gemrishi.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="underline text-[#264A3F] hover:text-[#1b362f] transition">
								Gemrishi
							</a>
						</p>
					</div>
				</div>
		</>
	);
};

export default Shipping;

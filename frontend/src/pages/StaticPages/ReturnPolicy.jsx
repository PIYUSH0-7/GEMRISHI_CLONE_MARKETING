import React from "react";
import AboutBG from "../../assets/AboutUs/AboutBG.svg";

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-5";

const SectionCard = ({ id, number, title, children, tint = false }) => (
	<div id={id} className="scroll-mt-28 flex gap-4 sm:gap-6">
		{/* Facet badge */}
		<div className="flex-shrink-0 pt-1">
			<div
				className="facet-badge w-10 h-11 sm:w-12 sm:h-14 flex items-center justify-center text-white font-semibold text-[15px] sm:text-[17px]"
				style={{
					clipPath:
						"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
					background: "linear-gradient(155deg, #1E3D33 0%, #2E5A4C 60%, #B8925A 130%)",
				}}>
				{number}
			</div>
		</div>

		<div
			className={`flex-1 min-w-0 rounded-2xl border border-[#264A3F1a] px-5 py-6 sm:px-8 sm:py-7 mb-8 ${
				tint ? "bg-[#EEF2EE]" : "bg-white"
			}`}>
			<h2 className="font-display text-[22px] sm:text-[26px] font-semibold text-[#1E3D33] mb-3">
				{title}
			</h2>
			<div className="text-[#454b4c] text-[15.5px] sm:text-[17px] leading-relaxed [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_li]:mb-2">
				{children}
			</div>
		</div>
	</div>
);

const TOC_ITEMS = [
	{ id: "sec-1", label: "Our Commitment" },
	{ id: "sec-2", label: "10-Day Returns" },
	{ id: "sec-3", label: "Jewelry & Customization" },
	{ id: "sec-4", label: "Blue Sapphire Trial" },
	{ id: "sec-5", label: "Return Conditions" },
	{ id: "sec-6", label: "Authenticity Guarantee" },
	{ id: "sec-7", label: "Return Logistics" },
	{ id: "sec-8", label: "Customer Assistance" },
	{ id: "sec-9", label: "Return Process" },
	{ id: "sec-10", label: "Security Clause" },
	{ id: "sec-11", label: "Refund Processing" },
	{ id: "sec-12", label: "Lab Partners" },
	{ id: "sec-13", label: "Company Rights" },
	{ id: "sec-14", label: "Contact" },
];

const TrustStat = ({ value, label }) => (
	<div className="flex-1 min-w-[140px] rounded-xl bg-gray-100 border border-green-700 px-4 py-5 text-center shadow-xl shadow-black">
		<div className="font-display text-[26px] sm:text-[30px] font-semibold text-[#1E3D33] leading-none">
			{value}
		</div>
		<div className="text-[#6b716f] text-[12.5px] sm:text-[13.5px] mt-2 tracking-wide uppercase">
			{label}
		</div>
	</div>
);

const ReturnPolicy = () => {
	return (
		<>
			<div className="font-body bg-[#FBF8F2]">
				{/* Hero Section */}
				<div
					className="relative w-full h-[340px] sm:h-[380px] bg-cover bg-center flex flex-col justify-center items-center text-center overflow-hidden"
					style={{ backgroundImage: `url(${AboutBG})` }}>
					<div className="absolute inset-0 bg-gradient-to-b from-[#0f2019]/55 via-[#0f2019]/35 to-[#0f2019]/70" />

					{/* Breadcrumbs */}
					<div
						className={`relative z-10 w-full h-[58px] flex flex-row items-center gap-2 ${PADDING_CLASS}`}>
						<a
							href="/"
							className="text-black  hover:text-white cursor-pointer text-sm sm:text-base transition-colors"
							onClick={(e) => {
								e.preventDefault();
								window.location.href = "/";
							}}>
							Home
						</a>
						<span className="text-white/50 text-sm sm:text-base">/</span>
						<span className="text-white text-sm font-bold sm:text-base">
							Return Policy
						</span>
					</div>

					{/* Title */}
					<div className="relative z-10 w-full flex flex-col items-center justify-center gap-4 px-6">
						<span className="uppercase tracking-[0.25em] text-sm sm:text-[12px] lg:text-lg text-white font-bold">
							GemRishi Assurance
						</span>
						<h1 className="font-display text-[38px] sm:text-[52px] font-bold text-black leading-tight">
							Return &amp; Exchange Policy
						</h1>
						<div className="h-[2px] w-16 bg-[#B8925A]" />
						<p className="text-white text-[16px] sm:text-[19px] max-w-xl">
							Every stone is one of a kind. Buying one should feel completely
							risk-free.
						</p>
					</div>
				</div>

				{/* Trust bar */}
				<div className={`w-full -mt-9 sm:-mt-10 relative z-10 ${PADDING_CLASS}`}>
					<div className="flex flex-wrap gap-3 sm:gap-4 justify-center max-w-4xl mx-auto">
						<TrustStat value="10 Days" label="No-Questions Returns" />
						<TrustStat value="75%" label="Store Credit on Custom Pieces" />
						<TrustStat value="100%" label="Lifetime Authenticity Cover" />
						<TrustStat value="Free" label="Ring Resizing" />
					</div>
				</div>

				{/* Table of contents */}
				<div className={`w-full mt-12 mb-4 ${PADDING_CLASS}`}>
					<div className="max-w-5xl mx-auto rounded-2xl border border-[#264A3F1a] bg-gray-100 px-5 py-4 sm:px-7 sm:py-5">
						<p className="text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-cyan-500 font-bold mb-3">
							Jump to a section
						</p>
						<div className="flex flex-wrap gap-2">
							{TOC_ITEMS.map((item, i) => (
								<a
									key={item.id}
									href={`#${item.id}`}
									className="text-[13px] sm:text-[14px] px-3 py-1.5 rounded-full border border-[#264A3F26] text-[#1E3D33] hover:bg-[#1E3D33] hover:text-white hover:border-[#1E3D33] transition-colors">
									{i + 1}. {item.label}
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className={`w-full max-w-5xl mx-auto flex flex-col gap-2 mt-10 ${PADDING_CLASS}`}>
					{/* Masthead */}
					<div className="mb-8">
						<h2 className="font-display text-[28px] sm:text-[34px] font-bold text-[#1E3D33] mb-1">
							GemRishi — Return, Exchange &amp; Authenticity Policy
						</h2>
						<p className="text-[#8a8f8d] text-[13px] sm:text-[15px] font-medium tracking-wide uppercase">
							A Venture of Fateh Chand Bansi Lal Jewellers
						</p>
					</div>

					{/* 1. Our Commitment */}
					<SectionCard id="sec-1" number="1" title="Our Customer Commitment">
						<p>
							At GemRishi, every natural gemstone we curate is unique. We
							believe buying a gemstone should be a transparent, joyful, and
							completely risk-free experience. Our policy is crafted to give
							you absolute peace of mind while upholding strict standards of
							authenticity and quality.
						</p>
					</SectionCard>

					{/* 2. General Policy Framework */}
					<SectionCard
						id="sec-2"
						number="2"
						title={'10-Day "No-Questions-Asked" Return Policy (Loose Gemstones)'}
						tint>
						<p>
							We offer a 10-Day Return &amp; Replacement Window starting from
							the date you receive your package (as confirmed by courier
							delivery records).
						</p>
						<ul>
							<li>
								<strong>100% Money-Back Guarantee:</strong> If you are not
								completely satisfied with your loose gemstone for any reason,
								you can return it within 10 days for a 100% refund of the
								gemstone value, regardless of order amount.
							</li>
							<li>
								<strong>No Arbitrary Restrictions:</strong> You do not need lab
								reports or proof of major color mismatch to initiate a return
								on loose gemstones.
							</li>
						</ul>
					</SectionCard>

					{/* 3. Jewelry & Customization */}
					<SectionCard
						id="sec-3"
						number="3"
						title="Policy on Gemstone Jewelry & Customization">
						<p>
							We understand that custom-crafted jewelry is personal. While
							custom-made pieces (rings, pendants, bracelets) cannot be melted
							or resold at full retail value, we offer an industry-leading
							flexible solution:
						</p>
						<ul>
							<li>
								<strong>75% Store Credit:</strong> If you return a custom-made
								jewelry piece within 10 days of delivery, you will receive 75%
								of the total invoice value as store credit to use towards any
								future purchase on GemRishi.com.
							</li>
							<li>
								<strong>Ring Resizing:</strong> We offer complimentary ring
								resizing within the first 10 days of purchase for all domestic
								orders.
							</li>
							<li>
								<strong>Order Cancellation Before Shipping:</strong> If you
								cancel a custom jewelry order before dispatch, a making charge
								deduction of 25% will apply, and the remaining 75% will be
								refunded to your original payment method.
							</li>
						</ul>
					</SectionCard>

					{/* 4. Blue Sapphire Trial Window (+ 4.1 unboxing video) */}
					<div id="sec-4" className="scroll-mt-28 flex gap-4 sm:gap-6">
						<div className="flex-shrink-0 pt-1">
							<div
								className="facet-badge w-10 h-11 sm:w-12 sm:h-14 flex items-center justify-center text-white font-semibold text-[15px] sm:text-[17px]"
								style={{
									clipPath:
										"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
									background:
										"linear-gradient(155deg, #1E3D33 0%, #2E5A4C 60%, #B8925A 130%)",
								}}>
								4
							</div>
						</div>

						<div className="flex-1 min-w-0 rounded-2xl border border-[#264A3F1a] bg-[#EEF2EE] px-5 py-6 sm:px-8 sm:py-7 mb-8">
							<h2 className="font-display text-[22px] sm:text-[26px] font-semibold text-[#1E3D33] mb-3">
								Blue Sapphire (Neelam) Trial Window
							</h2>
							<p className="text-[#454b4c] text-[15.5px] sm:text-[17px] leading-relaxed mb-6">
								To accommodate traditional astrological suitability testing,
								customers purchasing Blue Sapphire (Neelam) are eligible for
								our full 10-day return policy. We recommend placing the
								gemstone in your possession during the initial 24 to 72-hour
								trial period before custom mounting.
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
								<div>
									<div className="inline-block text-[11px] font-semibold uppercase tracking-wide text-white bg-[#7A2E2E] rounded-full px-3 py-1 mb-3">
										Compulsory
									</div>
									<h3 className="font-display text-[19px] sm:text-[21px] font-semibold text-[#1E3D33] mb-2">
										4.1 Unboxing Video
									</h3>
									<p className="text-[#454b4c] text-[15.5px] sm:text-[17px] leading-relaxed mb-2">
										A continuous, unedited video from the sealed package
										opening is required and must clearly show:
									</p>
									<ul className="list-disc pl-5 text-[#454b4c] text-[15.5px] sm:text-[17px] leading-relaxed mb-4">
										<li>The initial parcel condition and seals</li>
										<li>The product itself</li>
										<li>The laboratory certificate &amp; invoice</li>
									</ul>
									<p className="text-[#6b716f] text-[14.5px] sm:text-[16px] italic leading-relaxed">
										Customers are strongly advised to record this at the exact
										time of delivery.
									</p>
								</div>

								{/* YouTube Video */}
								<div className="w-full flex justify-center md:justify-end">
									<div className="relative w-full max-w-[520px] aspect-video rounded-xl p-1.5 bg-gradient-to-br from-[#1E3D33]/25 via-white to-[#B8925A]/25 shadow-[0_8px_25px_rgba(30,61,51,0.15)] hover:shadow-[0_12px_35px_rgba(30,61,51,0.25)] transition-all duration-300">
										<div className="w-full h-full rounded-lg overflow-hidden bg-white border border-white">
											<iframe
												className="w-full h-full"
												src="https://www.youtube.com/embed/tdJtAOPbf54"
												title="Unboxing Video"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowFullScreen></iframe>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* 5. Conditions for Return & Exchange */}
					<SectionCard id="sec-5" number="5" title="Conditions for Return & Exchange">
						<p>
							To be eligible for a full refund or store credit, the returned
							item must meet the following standard guidelines:
						</p>
						<ul>
							<li>
								<strong>Parcel Opening Video (Recommended):</strong> To help us
								protect your delivery against transit damage or missing items,
								we kindly request customers to record a quick, continuous
								unboxing video when first opening the sealed parcel showing
								the box seal, invoice, certificate, and stone.
							</li>
							<li>
								<strong>Original Condition:</strong> The gemstone or jewelry
								must be unused, unaltered, undamaged, and free of any nicks,
								chips, or scratches.
							</li>
							<li>
								<strong>Understanding Natural Stones:</strong> Earth-mined
								gemstones inherently possess minor color variations across
								different digital screens, lighting conditions, or viewing
								angles. If a stone has a minor shade variation but you prefer
								a different hue, our team will gladly assist you with a smooth
								exchange.
							</li>
							<li>
								<strong>Complete Documentation:</strong> The return must
								include the original Laboratory Authenticity Certificate,
								invoice, original packaging, and any complimentary items
								provided.
							</li>
							<li>
								<strong>Missing Documentation:</strong> If an original lab
								certificate is misplaced, please contact our Customer Support
								team. While 100% cash refunds require original certificates,
								we will work with you to provide store credit or exchange
								options upon re-certification verification.
							</li>
						</ul>
					</SectionCard>

					{/* 6. Lifetime Authenticity Guarantee */}
					<SectionCard id="sec-6" number="6" title="Lifetime Authenticity Guarantee" tint>
						<p>
							GemRishi guarantees that every gemstone sold is 100% natural and
							authentic as described.
						</p>
						<ul>
							<li>
								You are welcome to test your gemstone at any internationally
								recognized testing laboratory (e.g., GIA, IGI, GII, GRS,
								Gubelin, SSEF, AGL).
							</li>
							<li>
								In the highly improbable event that a gemstone is proven to be
								synthetic, treated (outside declared parameters), or
								inauthentic by an accredited laboratory, GemRishi will issue
								an immediate 100% full refund including all shipping and
								certification costs.
							</li>
						</ul>
					</SectionCard>

					{/* 7. Return Logistics & Refund Process */}
					<SectionCard id="sec-7" number="7" title="Return Logistics & Refund Process">
						<p>
							<strong>How to Initiate a Return:</strong>
						</p>
						<ol>
							<li>
								<strong>Raise a Request:</strong> Contact our Customer Support
								team at wecare@gemrishi.com within 10 days of delivery to
								request a Return Merchandise Authorization (RMA) code.
							</li>
							<li>
								<strong>Pack Securely:</strong> Package the item securely with
								all original certificates, invoices, and box materials. For
								safety, do not write words like "Gemstone", "Jewelry", or
								"Precious" on the exterior courier packaging.
							</li>
							<li>
								<strong>Dispatch:</strong> Ship the item back via an insured
								courier service (such as DTDC Plus or BlueDart). Return
								courier costs are borne by the customer, except in cases where
								an incorrect or damaged item was delivered.
							</li>
						</ol>
						<p className="mt-4">
							<strong>Refund Timelines &amp; Non-Refundable Costs:</strong>
						</p>
						<ul>
							<li>
								<strong>Processing Time:</strong> Once received, returned
								items undergo quality inspection within 3 to 5 business days.
								Approved refunds will be credited back to your original
								payment method within 7–10 working days.
							</li>
							<li>
								<strong>Non-Refundable Components:</strong> Standard logistics
								fees (shipping charges, government taxes/GST paid, and payment
								gateway processing fees) are paid to third-party providers and
								cannot be refunded.
							</li>
						</ul>
					</SectionCard>

					{/* 8. Customer Assistance */}
					<SectionCard id="sec-8" number="8" title="Customer Assistance" tint>
						<p>
							Our goal is to ensure your gemstone purchasing experience is
							seamless, reliable, and transparent. If you have any questions
							or require assistance with an order, please contact our Customer
							Delight Team:
						</p>
						<ul>
							<li>Email: wecare@gemrishi.com</li>
							<li>Call: 98179 75978 / 98179 75972</li>
						</ul>
					</SectionCard>

					{/* 9. Return Process */}
					<SectionCard id="sec-9" number="9" title="Return Process">
						<ol>
							<li>
								Raise a formal return request within 10 days from the delivery
								date.
							</li>
							<li>
								Share your compulsory unboxing video alongside all supporting
								documentation.
							</li>
							<li>Await official verification and return approval from GemRishi.</li>
							<li>
								Once approved, ship the product back securely. Mandatory
								shipping insurance is required for higher-value articles.
							</li>
						</ol>
					</SectionCard>

					{/* 10. Security & Integrity Clause */}
					<SectionCard id="sec-10" number="10" title="Security & Integrity Clause" tint>
						<p>
							GemRishi follows rigorous audit and operational controls. All
							outbound shipments are thoroughly recorded on video during
							packaging. Any detected inventory mismatch, product tampering,
							or stone replacement attempts will lead to immediate rejection
							of the request, permanent restriction from our platform, and
							legal action as per the law of the land.
						</p>
					</SectionCard>

					{/* 11. Refund Processing */}
					<SectionCard id="sec-11" number="11" title="Refund Processing">
						<p>
							Upon formal quality approval of the returned item, your refund
							will be processed within <strong>7–10 working days</strong>. The
							finalized amount will be credited exclusively back to the
							original payment method and account holder.
						</p>
					</SectionCard>

					{/* 12. Authenticity Guarantee (Lifetime) + lab grid */}
					<SectionCard id="sec-12" number="12" title="Authenticity Guarantee (Lifetime)" tint>
						<p>
							GemRishi provides an uncompromising free lifetime authenticity
							guarantee. Customers are welcome to verify our stones at any
							highly reputed global institution, such as:
						</p>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 not-italic">
                        {[
                         ["IGI", "USA", "https://www.igi.org/"],
                         ["GIA", "USA", "https://www.gia.edu/"],
                         ["GII", "GJEPC, India", "https://www.giigemlab.com/"],
                         ["IIGJ", "GJEPC, India", "https://iigjrlc.com/"],
                         ["Gubelin", "Switzerland", "https://gubelingemlab.com/"],
                         ["SSEF", "Switzerland", "https://www.ssef.ch/"],
                         ["GRS", "Switzerland", "https://www.gemresearch.ch/"],
                         ["AGL", "India", "https://www.aglgemlab.com/"],
                         ].map(([name, place, link]) => (
                   <a
                   key={name}
                   href={link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="rounded-lg bg-white border border-[#264A3F1f] px-3 py-3 text-center hover:border-[#264A3F] hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
            <div className="font-display text-[17px] font-semibold text-[#1E3D33]">
                {name}
            </div>

            <div className="text-[11.5px] text-[#8a8f8d] uppercase tracking-wide">
                {place}
            </div>
        </a>
    ))}
</div>
						<p>
							In the highly improbable event that a gemstone is proven not to
							be authentic or as claimed, a{" "}
							<strong>100% refund OR immediate exchange</strong> will be
							provided.
						</p>
					</SectionCard>

					{/* 13. Company Rights */}
					<SectionCard id="sec-13" number="13" title="Company Rights">
						<p>
							GemRishi reserves the right to approve or reject any service
							request, interpret acceptable natural gemstone variations, and
							request additional verifying proof. All organizational decisions
							shall be final and binding.
						</p>
					</SectionCard>

					{/* 14. Need Assistance? */}
					<SectionCard id="sec-14" number="14" title="Need Assistance?" tint>
						<p>
							Our goal is to ensure your gemstone shopping experience remains
							delightful, trustworthy, and transparent. If you have any
							queries regarding our terms, please connect with us directly at{" "}
							<a
								href="mailto:wecare@gemrishi.com"
								className="underline text-[#1E3D33] hover:text-[#B8925A] font-medium transition-colors duration-200">
								wecare@gemrishi.com
							</a>
							.
						</p>
					</SectionCard>

					{/* Footer Links */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-24">
						<a
							href="https://mandalagoodvibes.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="group rounded-2xl border border-[#264A3F1a] bg-white px-6 py-6 text-center hover:border-blue-500 hover:shadow-[0_8px_25px_rgba(184,146,90,0.18)] transition-all duration-300">
							<p className="text-[11px] uppercase tracking-[0.2em] text-cyan-500 font-semibold mb-2">
								Crystal Jewelry
							</p>
							<p className="font-display text-[20px] sm:text-[22px] font-semibold text-[#1E3D33] group-hover:text-[#1E3D33]">
								Visit Mandala Good Vibes →
							</p>
						</a>
						<a
							href="https://gemrishi.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="group rounded-2xl border border-[#264A3F1a] bg-white px-6 py-6 text-center hover:border-blue-500 hover:shadow-[0_8px_25px_rgba(184,146,90,0.18)] transition-all duration-300">
							<p className="text-[11px] uppercase tracking-[0.2em] text-cyan-500 font-semibold mb-2">
								Original Gemstones
							</p>
							<p className="font-display text-[20px] sm:text-[22px] font-semibold text-[#1E3D33] group-hover:text-[#1E3D33]">
								Visit GemRishi →
							</p>
						</a>
					</div>
				</div>
			</div>
		</>
	);
};

export default ReturnPolicy;
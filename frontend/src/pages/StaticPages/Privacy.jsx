import React from "react";
import AboutBG from "../../assets/AboutUs/AboutBG.svg"; // import your hero image

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-32";

const Privacy = () => {
	return (
		<>
			{/* Hero Section */}
			<div
				className="w-full h-[318px] bg-cover bg-center flex flex-col justify-center items-center text-center"
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
							window.location.href = "/";
						}}>
						Home
					</a>
					<span className="text-[#444445] text-base sm:text-[22px]">&gt;</span>
					<a
						className="text-[#444445] cursor-pointer text-base sm:text-[22px]"
						onClick={() => window.history.back()}>
						Privacy Policy
					</a>
				</div>

				{/* Title */}
				<div className="w-full h-[110px] flex justify-center items-center">
					<h1 className="text-[32px] sm:text-[42px] font-semibold">
						Privacy Policy
					</h1>
				</div>

				{/* Tagline */}
				<div className="w-full h-[150px] flex flex-col items-center text-center text-[20px] sm:text-[26px] font-semibold">
					<p>Your privacy is important to GEMRISHI.</p>
					<p>Learn how we collect, use, and protect your data.</p>
				</div>
			</div>

			{/* Main Content */}
			<div className={"w-full h-auto flex flex-col gap-6 " + PADDING_CLASS}>
				{/* Title & Header */}
				<div className="mt-20 mb-6">
					<h1 className="text-[26px] sm:text-[32px] font-bold text-[#264A3F] mb-1">
						GemRishi.com – Privacy Policy
					</h1>
					<p className="text-[#626262] text-[14px] sm:text-[16px] font-medium tracking-wide uppercase">
						A Venture of Fateh Chand Bansilal Jewellers
					</p>
				</div>

				{/* 1. Introduction */}
				<p className="text-[#464646] text-[16px] sm:text-[20px] leading-relaxed mb-6">
					At GemRishi, your privacy is of utmost importance to us. We are committed to safeguarding the personal information you share with us and ensuring a secure and trustworthy experience. This Privacy Policy explains what information we collect, how we use it, and how we protect it. This policy is in accordance with applicable Indian laws, including the Information Technology Act, 2000 and related rules.
				</p>

				{/* 2. User Consent */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					2. User Consent
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
					By accessing or using GemRishi.com, you:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>Agree to the collection and use of your information as outlined in this policy.</li>
					<li>Confirm that the information provided is accurate and updated.</li>
				</ul>
				<p className="text-[#626262] text-[16px] sm:text-[18px] italic leading-relaxed mb-6">
					If you do not agree, you are advised not to use the website.
				</p>

				{/* 3. Information We Collect */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					3. Information We Collect
				</h2>
				
				<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
					3.1 Personal Information
				</h3>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					We may collect:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
					<li>Name</li>
					<li>Contact number</li>
					<li>Email address</li>
					<li>Billing & shipping address</li>
					<li>Payment details</li>
					<li>Any information shared via WhatsApp, call, or email</li>
				</ul>

				<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
					3.2 Device & Technical Information
				</h3>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					When you visit our website, we may collect:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
					<li>IP address</li>
					<li>Browser type</li>
					<li>Device information</li>
					<li>Pages visited and time spent</li>
					<li>Referral source</li>
				</ul>

				<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
					3.3 Order Information
				</h3>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					When you place an order:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>Product details</li>
					<li>Transaction details</li>
					<li>Delivery information</li>
				</ul>

				{/* 4. How We Use Your Information */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					4. How We Use Your Information
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					We use your information to:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>Process and fulfill orders</li>
					<li>Communicate order updates</li>
					<li>Provide customer support</li>
					<li>Prevent fraud and misuse</li>
					<li>Improve website and services</li>
					<li>Personalize your experience</li>
					<li>Send updates, offers, and promotions (only if consented)</li>
				</ul>

				{/* 5. Sharing of Information */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					5. Sharing of Information
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
					We do not sell your personal data. We may share information only with:
				</p>
				
				<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
					5.1 Service Providers
				</h3>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					<li>Payment gateways</li>
					<li>Logistics partners</li>
					<li>IT & hosting providers</li>
				</ul>
				<p className="text-[#626262] text-[14px] sm:text-[16px] italic pl-6 mb-4">
					(Only to the extent required for service delivery)
				</p>

				<h3 className="text-[18px] sm:text-[20px] font-medium text-[#264A3F] mb-2">
					5.2 Legal & Compliance
				</h3>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					We may disclose information if required:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>By law or legal process</li>
					<li>To prevent fraud or misuse</li>
					<li>To protect company rights</li>
				</ul>

				{/* 6. Cookies & Tracking Technologies */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					6. Cookies & Tracking Technologies
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					We use cookies and similar tools to:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
					<li>Enhance user experience</li>
					<li>Track website performance</li>
					<li>Analyze customer behavior</li>
				</ul>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					You may disable cookies through your browser settings, though some features may not function properly.
				</p>

				{/* 7. Data Security */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					7. Data Security
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					We follow strict security practices to protect your data:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-4">
					<li>Secure servers</li>
					<li>Restricted access</li>
					<li>Data encryption (where applicable)</li>
				</ul>
				<p className="text-[#626262] text-[16px] sm:text-[18px] italic leading-relaxed mb-6">
					However, no system is 100% secure, and users share information at their own discretion.
				</p>

				{/* 8. Data Retention */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					8. Data Retention
				</h2>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>We retain your data only as long as necessary to fulfill orders and for legal/accounting purposes.</li>
					<li>You may request deletion of your data, subject to legal requirements.</li>
				</ul>

				{/* 9. Your Rights */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					9. Your Rights
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					You have the right to:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>Access your personal data</li>
					<li>Request correction or updates</li>
					<li>Request deletion (subject to legal limits)</li>
				</ul>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					To exercise these rights, contact us at the details below.
				</p>

				{/* 10. Third-Party Links */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					10. Third-Party Links
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					Our website may contain links to third-party websites.
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>We are not responsible for their privacy practices.</li>
					<li>Users are advised to review their policies separately.</li>
				</ul>

				{/* 11. Children’s Privacy */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					11. Children’s Privacy
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					Our website is intended for users above 18 years. We do not knowingly collect data from children below 14 years. If such data is identified, it will be deleted immediately.
				</p>

				{/* 12. Marketing & Communication */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					12. Marketing & Communication
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-2">
					You may receive updates, offers, or newsletters. You can opt out anytime via:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>Unsubscribe link</li>
					<li>Direct request</li>
				</ul>

				{/* 13. Policy Updates */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					13. Policy Updates
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					GemRishi reserves the right to update this policy at any time. Changes will be posted on this page, and continued use implies acceptance.
				</p>

				{/* 14. Limitation of Liability */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					14. Limitation of Liability
				</h2>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					<li>While we take all reasonable steps to protect your data, we are not liable for breaches beyond our control.</li>
					<li>Users are responsible for maintaining confidentiality of their login credentials.</li>
				</ul>

				{/* 15. Contact & Grievance Redressal */}
				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					15. Contact & Grievance Redressal
				</h2>
				<p className="text-[#464646] text-[16px] sm:text-[20px] leading-relaxed mb-24">
					For any questions, concerns, or requests, please connect with us at:{" "}
					<a href="mailto:wecare@gemrishi.com" className="text-[#264A3F] font-medium underline">
						wecare@gemrishi.com
					</a>
				</p>
			</div>
		</>
	);
};

export default Privacy;

import React from "react";
import AboutBG from "../../assets/AboutUs/AboutBG.svg"; // hero background image

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-32";

const Gemstoneguide = () => {
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
						Gemstone Buying Guide
					</a>
				</div>

				{/* Title */}
				<div className="w-full h-[110px] flex justify-center items-center">
					<h1 className="text-[32px] sm:text-[42px] font-semibold">
						Gemstone Buying Guide
					</h1>
				</div>

				{/* Tagline */}
				<div className="w-full h-[150px] flex flex-col items-center text-center text-[20px] sm:text-[26px] font-semibold">
					<p>Find the perfect gemstone that matches your energy and style.</p>
					<p>Authentic, Certified, and Handpicked by Gemrishi.</p>
				</div>
			</div>

			{/* Main Content */}
			<div className={"w-full h-auto flex flex-col gap-6 " + PADDING_CLASS}>
				{/* Introduction */}
{/* ---------------------Add By Pawan------------------------------------------------------- */}
				<div className="flex flex-col md:flex-row items-center gap-12 w-full">
  {/* Left Content */}
  <div className="w-full md:w-1/2 md:mt-5">
    <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#264A3F] mb-4">
      Which Gemstone Should I Wear?
    </h2>

    <p className="text-[#464646] text-[16px] leading-relaxed mb-6">
      Choosing a gemstone can be an exciting journey, blending the mystical
      allure of gemstones with their exceptional beauty and vibrant colors.
      While there is plenty of information online about gemstones, not all
      sources are reliable or provide the guidance you need.
    </p>

    <p className="text-[#464646] text-[16px] leading-relaxed">
      Whether you’re seeking a gemstone for astrological purposes or simply
      as a stunning addition to your jewelry collection, Gemrishi is here to
      help you find the perfect match. Our step-by-step guide will assist
      you in selecting the ideal gemstone that fits your needs and budget
      seamlessly.
    </p>
  </div>

  {/* Right Video */}
  <div className="w-full md:w-1/2 flex justify-center md:mt-10">
    <div
      className="
        relative
        w-full
        max-w-[620px]
        aspect-video
        rounded-2xl
        p-2
        bg-gradient-to-br
        from-[#264A3F]/20
        via-white
        to-[#D4AF37]/20
        shadow-[0_8px_25px_rgba(38,74,63,0.15)]
        hover:shadow-[0_12px_35px_rgba(38,74,63,0.25)]
        transition-all
        duration-300
      "
    >
      <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-white">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/YY1FlMlEhhc"
          title="Unboxing Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  </div>
</div>
{/* --------------------------------Add By Pawan------------------------------------------------- */}
				{/* How to Select the Right Gemstone */}
				<h2 className="text-[22px] sm:text-[26px] font-semibold text-[#264A3F] mb-4">
					How to Select the Right Gemstone
				</h2>
				<p className="text-[#626262] text-[16px]  leading-relaxed mb-6">
					For centuries, gemstones have been cherished for both their
					astrological significance and their beauty in jewelry. When choosing a
					gemstone for jewelry, factors like appearance and durability are key.
					However, selecting an astrological gemstone is a more intricate
					process that requires detailed astrological calculations and horoscope
					analysis by a qualified astrologer.
				</p>
				<p className="text-[#626262] text-[16px]  leading-relaxed mb-6">
					Since astrological gemstones can impact your career, finances, and
					personal life, we highly recommend consulting a certified astrologer
					before making your choice.
				</p>

				{/* Authenticity Section */}
				<h2 className="text-[22px] sm:text-[26px] font-semibold text-[#264A3F] mb-4">
					Ensuring Authenticity & Quality
				</h2>
				<p className="text-[#626262] text-[16px]  leading-relaxed mb-6">
					Gemstones are cherished not only for their beauty but also for their
					astrological and healing properties. Ensuring the quality and
					authenticity of a gemstone is essential to avoid disappointment.
					Unfortunately, some dealers use deceptive tactics to sell treated or
					fake stones. Always purchase gemstones from a reputable source that
					provides transparency and certification.
				</p>
				<p className="text-[#626262] text-[16px] leading-relaxed mb-6">
					Investing in a lab-certified gemstone or hallmarked jewelry ensures
					the best value. For rare or high-value gemstones, rely on
					certifications from trusted labs like <strong>IGI, GTL, GIA,</strong>{" "}
					or <strong>GRS</strong>.
				</p>
				<p className="text-[#626262] text-[16px] leading-relaxed mb-6">
					At <strong>Gemrishi</strong>, we prioritize authenticity and quality
					above all. While competitors may offer lower prices, they often cannot
					match our standards. Every gemstone and piece of gemstone jewelry we
					provide is 100% natural and genuine.
				</p>

				{/* How Should I Wear a Gemstone */}
				<h2 className="text-[22px] sm:text-[26px] font-semibold text-[#264A3F] mb-4">
					How Should I Wear a Gemstone?
				</h2>
				<ul className="list-disc pl-6 text-[#626262] text-[16px]  leading-relaxed mb-6">
					<li>
						<strong>Consult an Astrologer:</strong> Select the right gemstone
						based on your horoscope.
					</li>
					<li>
						<strong>Purification & Energization:</strong> Cleanse and energize
						the gemstone using rituals with milk or holy water.
					</li>
					<li>
						<strong>Right Day & Metal:</strong> Each gemstone has an ideal metal
						(gold or silver) and an auspicious day for wearing.
					</li>
					<li>
						<strong>Correct Finger & Hand:</strong> Specific gemstones are worn
						on certain fingers to align with planetary energies.
					</li>
					<li>
						<strong>Consistent Wear:</strong> Many gemstones work best when worn
						continuously.
					</li>
				</ul>

				{/* Where to Purchase */}
				<h2 className="text-[22px] sm:text-[26px] font-semibold text-[#264A3F] mb-4">
					Where Should I Purchase Gemstones?
				</h2>
				<p className="text-[#626262] text-[16px]  leading-relaxed mb-6">
					Buying gemstones from a reputable source ensures both quality and
					authenticity. Consider these key factors when selecting a seller:
				</p>
				<ul className="list-disc pl-6 text-[#626262] text-[16px]  leading-relaxed mb-6">
					<li>
						<strong>Reputable Sellers:</strong> Choose established dealers with
						positive reviews and credibility.
					</li>
					<li>
						<strong>Lab Certification:</strong> Always look for certifications
						from recognized gemological laboratories such as IGI, GIA, or GRS.
					</li>
					<li>
						<strong>Transparency:</strong> A reliable seller provides full
						disclosure about sourcing, treatment, and grading.
					</li>
					<li>
						<strong>Return Policy:</strong> A fair return or exchange policy is
						a sign of a trustworthy retailer.
					</li>
					<li>
						<strong>Expert Guidance:</strong> Seek sellers offering professional
						consultations for gemstone selection.
					</li>
				</ul>

				<p className="text-[#464646] text-[16px] leading-relaxed mb-6">
					At <strong>Gemrishi</strong>, we are proud of our commitment to
					authenticity, transparency, and customer satisfaction. Explore our
					wide selection of certified gemstones and get personalized guidance
					from our experts.
				</p>

				{/* CTA */}
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

export default Gemstoneguide;

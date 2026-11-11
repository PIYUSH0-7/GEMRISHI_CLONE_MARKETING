import React from "react";

const testimonials = [
	{
		text: "Gemrishi aims to change the way gems are bought in the country. It can be instrumental in buying you the natural and lab-certified Gomed for your businesses.",
		name: "Vishnuvardhan",
		role: "Client | Bangalore (INDIA)",
	},
	{
		text: "Medical entrance requires more than just luck. Hessonite checked my progress. Today I have a lucrative career as a doctor. Tks Gemrishi.",
		name: "Dr. Vishwanathan Anand",
		role: "Client | Chennai (INDIA)",
	},
	{
		text: "Binge-eating and sleeping disorder became my way of life after my silver business failed. It sprang up for good after I bought Hessonite from Gemrishi.",
		name: "Annu Kapur",
		role: "Client | Ambala (INDIA)",
	},
	{
		text: "Dealing with lab IGI-GTL certified yellow sapphire and other gems, Gemrishi gives you the best quality and value for money.",
		name: "Paramjeet Singh",
		role: "Client | Chennai (INDIA)",
	},
	{
		text: "You can look for authentic and natural Pukhraj stones at Gemrishi, which is counted as one of India’s best online and offline gemstone shopping stores.",
		name: "Deepika Pallikal",
		role: "Client | Chennai (INDIA)",
	},
	{
		text: "There were hurdles in getting a suitable match for myself. Today I have all the joys of marital bliss and harmony wearing Pukhraj.",
		name: "Yuvraj",
		role: "Client | Bangalore (INDIA)",
	},
	{
		text: "I trusted Gemrishi for Yellow Sapphire and today I have the worldly pleasures which were missing. Good health and mental peace fetched me success.",
		name: "Asana Abubakari",
		role: "Client | Rhode Island (US)",
	},
	{
		text: "Gemrishi is a one-stop shop to buy all kinds of jyotish gemstones. You can look for 100% natural, genuine, and cost-effective Blue Sapphires.",
		name: "Ujjwal Bhatgare",
		role: "Client | Maharashtra (INDIA)",
	},
	// ... You can paste all the remaining testimonials here ...
];

const Testimonals = () => {
	return (
		<section className="w-full">
			{/* Header Section */}
			<div className="bg-[#264A3F] text-white py-16 px-6 text-center">
				<h1 className="text-4xl font-bold mb-4">
					Witness the Stories of Transformation
				</h1>
				<p className="max-w-3xl mx-auto text-lg leading-relaxed text-gray-200">
					Gemrishi has changed countless lives by providing natural,
					lab-certified gemstones that bring positivity, balance, and
					transformation.
				</p>
			</div>

			{/* Testimonials Section */}
			<div className="max-w-6xl mx-auto py-12 px-6 flex flex-col gap-10">
				{testimonials.map((t, index) => (
					<div
						key={index}
						className={`p-8 rounded-2xl shadow-md transition-all duration-300 ${
							index % 2 === 0
								? "bg-white text-gray-800 hover:shadow-xl"
								: "bg-[#264A3F] text-white hover:shadow-lg"
						}`}>
						<p className="text-lg leading-relaxed mb-6 italic">“{t.text}”</p>
						<div className="border-t pt-4">
							<h3 className="text-xl font-semibold">{t.name}</h3>
							<p className="text-sm opacity-80">{t.role}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default Testimonals;

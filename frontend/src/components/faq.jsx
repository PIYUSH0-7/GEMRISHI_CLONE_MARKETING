import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQAccordion = () => {
	const [openIndex, setOpenIndex] = useState(null);

	const faqs = [
    {
        question: "What Gemstone Suits Me?",
        answer:
            "A suitable gemstone is typically determined by your **Zodiac sign** and the associated **planetary position** (Graha) in your birth chart (Kundali) according to Vedic astrology. A correct choice is vital for positive effects.",
    },
    {
        question: "How Do I Know if a Gemstone is Real?",
        answer: "Always buy gemstones that come with an **original, third-party lab certification** from a reputable gemological institute. This guarantees the gem's authenticity, weight, and treatment status.",
    },
    {
        question: "How Should I Wear My Gemstone?",
        answer: "Gemstones should be worn according to specific astrological guidelines, including the **correct metal** (gold/silver), the **specific finger**, the **auspicious day and time** (muhurta), and proper cleansing (energizing) rituals.",
    },
    {
        question: "Can I Wear Multiple Gemstones at Once?",
        answer: "Yes, but only if the associated planets are **friendly** to each other as per your birth chart. Wearing two inimical (enemy) gemstones can lead to negative or mixed results.",
    },
    {
        question: "What is the Astrological Significance of Gemstones?",
        answer: "Gemstones are believed to **channel specific planetary energies** into the body. They amplify the positive effects of favorable planets and mitigate the negative effects of unfavorable ones, thereby balancing your life's aspects.",
    },
];

	const toggleFAQ = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<div className="w-full max-w-6xl mx-auto p-6">
			{/* Heading */}
			<h2 className="text-2xl font-semibold mb-6">
				Frequently Asked Questions
			</h2>

			<div className="border border-[#CDCCCC]  rounded-lg p-6 bg-white">
				{faqs.map((faq, index) => (
					<div key={index} className="mb-4">
						<button
							className={`w-full flex justify-between items-center p-4 rounded-lg transition-all duration-300 
                ${
									openIndex === index
										? "bg-gray-100"
										: "bg-gray-100 hover:bg-gray-200"
								}`}
							onClick={() => toggleFAQ(index)}>
							<span className="text-lg font-medium text-gray-800">
								{faq.question}
							</span>
							{openIndex === index ? (
								<FaChevronUp className="text-gray-600" />
							) : (
								<FaChevronDown className="text-gray-600" />
							)}
						</button>

						{/* Answer Section */}
						{openIndex === index && (
							<div className="mt-2 p-4 border border-[#CDCCCC] rounded-lg bg-white">
								<p className="text-gray-600 text-sm leading-relaxed">
									{faq.answer}
								</p>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default FAQAccordion;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AboutBG from "../../assets/AboutUs/AboutBG.svg";
import CertificationsCarousel from "../../components/CertificationsCarousel";
import cert1 from "../../assets/gia-certification.webp";
import cert2 from "../../assets/giinew.jpg";
import cert3 from "../../assets/igi-certification.webp";
import cert4 from "../../assets/mgti-certification.webp";
import cert5 from "../../assets/iigj-certification.webp";

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-32";

const dutyDataByCountry = {
	INDIA: {
		duty: "0% (domestic)",
		notes: "No import duties for domestic shipments",
	},
	USA: {
		duty: "Duty: 50% , Sales Tax: 0%",
		notes:
			"1. Duty: 0%, Sales Tax: 0% (For invoice value less than $800)\n 2. Duty: 0%, Sales Tax: 4-8% (For invoice value more than $800, as per state/city law (typically 4-8%))\n\nLogistics Partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/sales tax.\n\nFor purchases above $2500 (loose gemstone or jewelry), logistics partners levy a merchandise processing fee of $31.50 (or 0.034% whichever is greater) as extra paperwork is required under the USA Patriot Act.\n\nPlease be advised that customs calculations are based on previous deliveries to your country. It is best to confirm customs charges with your local customs department for the most accurate information.",
	},
	"UNITED KINGDOM": {
		duty: "Duty: 0% , VAT: 20%",
		notes:
			"Logistics Partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT.\n\nPlease be advised that customs calculations are based on previous deliveries to your country. It is best to confirm customs charges with your local customs department for more accurate charges.",
	},
	CANADA: {
		duty: "Duty: 0% , GST: 5%",
		notes:
			"Duty: 6% , GST: 5% Some provinces also levy a sales tax known as PST which is added to the federal GST to make up a Harmonized Sales Tax (HST). Some provinces do not. The following is a list of provinces and the total tax (total HST inclusive of federal GST 5% mentioned above) you can expect to pay: i) Alberta 5% ii) Northwest Territories 5% iii) Nunavut 5% iv) Yukon 5% v) Saskatchewan 11% vi) British Columbia 12% vii) Ontario 13% viii) Manitoba 13% ix) Nova Scotia 15% x) New Brunswick 15% xi) Prince Edward Island 15% xii) Nova Scotia 15% xiii) Newfoundland & Labrador 15% xiv) Quebec 15%",
	},
	AUSTRALIA: {
		duty: "Duty: 0% , GST: 7%",
		notes:
			"Duty: 5%. GST: 10% (For invoice value less than A$750: 0%. For invoice value more than A$750: 10%). Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/GST. Any order costing over AUD$1,000 will also attract a 1% Import Declaration Air Charge. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},
	UAE: {
		duty: "Duty: 5% , VAT: 5%",
		notes:
			"Duty: 5%. VAT: 5%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Minimum Disbursement Fee is AED 75 or 2% of Bill of Entry charges, whichever is higher. For any purchase over $5,000, you must contact an independent customs broker to clear the shipment, as per UAE regulations customs cannot process clearances above this value. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},
	MALAYSIA: {
		duty: "Duty: 0% , VAT: 0% (Loose gemstones are TAX FREE into Malaysia)",
		notes:
			"Duty: 5%. VAT: 6%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},
	SINGAPORE: {
		duty: " Duty: 0% , GST: 7%",
		notes:
			"Duty: 0%. GST: 7%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/GST. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},
	"HONG KONG": {
		duty: "Duty: 0% , VAT: 0%",
		notes:
			"Duty: 0%. VAT: 0%. Both gemstones and jewelry are tax-free when imported into Hong Kong. For purchases of loose gemstones or jewelry, logistics partners levy a minor government processing fee of 0.35% on the total invoice. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},

	"SAUDI ARABIA": {
		duty: "Duty: 0% , VAT: 15%",
		notes:
			"Duty: 0%. VAT: 15%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Loose gemstones and jewelry are duty-free into Saudi Arabia, but VAT is levied. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},
	QATAR: {
		duty: "Duty: 0% , VAT: 5%",
		notes:
			"Duty: 0%. VAT: 5%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Loose gemstones are duty-free into Qatar, but VAT is levied. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},
	GERMANY: {
		duty: "Duty: 0% , VAT: 21%",
		notes:
			"Duty: 2.5%. VAT: 21%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Loose gemstones are duty-free into Germany, but VAT is levied. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},
	FRANCE: {
		duty: "Duty: 0% , VAT: 20%",
		notes:
			"Duty: 2.5%. VAT: 20%. VERY IMPORTANT: If you are a customer residing in France and wish to shop with us, you are advised to appoint a reputed French broker who is authorized to carry out the required formalities. You will also need to appoint a CHA, who will take charge of the shipment, complete customs clearance, and organize delivery to your address in France. The CHA will charge a fee for this service, which is beyond our knowledge or control. Please check brokerage charges directly with France Customs. For more details refer to https://www.gemrishi.com/blogs/france-shipping-policy. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Kindly note that customs calculations are based on previous deliveries to your country; for more accurate details, please confirm with your local customs department.",
	},
	BRAZIL: {
		duty: "Duty: 60% , VAT: 38%",
		notes:
			"Duty: 60%. VAT: 38%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for accurate charges.",
	},
	NETHERLAND: {
		duty: "Duty: 0% , VAT: 22%",
		notes:
			"Duty: 2.5%. VAT: 22%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Loose gemstones are duty-free into the Netherlands, but VAT is levied. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	SWITZERLAND: {
		duty: "Duty: 0% , VAT: 8%",
		notes:
			"Duty: 0%. VAT: 8%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Loose gemstones and jewelry are duty-free into Switzerland, but VAT is levied. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	"NEW ZEALAND": {
		duty: "Duty: 0% , VAT: 18%",
		notes:
			"Duty: 5%. VAT: 18%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Loose gemstones are duty-free into New Zealand, but GST is levied. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	SPAIN: {
		duty: "Duty: 0% , VAT: 8%",
		notes:
			"Duty: 2.5%. VAT: 23%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	SWEDEN: {
		duty: "Duty: 0% , VAT: 25%",
		notes:
			"Duty: 2.5%. VAT: 25%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	IRELAND: {
		duty: "Duty: 0% , VAT: 23%",
		notes:
			"Duty: 2.5%. VAT: 23%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	"NEW TAIWAN": {
		duty: "Duty: 0% , VAT: 5% Trade Promotion Fee:0.04%",
		notes:
			"Duty: 2.5%. VAT: 5%, Trade Promotion Fee:0.04%  Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	AUSTRIA: {
		duty: "Duty: 0% , VAT: 20%",
		notes:
			"Duty: 2.5%. VAT: 20%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	"NEW MONACO": {
		duty: "Duty: 0% , VAT: 19%",
		notes:
			"Duty: 2.5%. VAT: 19%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},

	"SOUTH AFRICA": {
		duty: "Duty: 0% , VAT: 14%",
		notes:
			"Duty: 20%. VAT: 14%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	THAILAND: {
		duty: "Duty: 0% , VAT: 7%",
		notes:
			"Duty: 20%. VAT: 7%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},

	TURKEY: {
		duty: "Duty: 0% , VAT: 18%",
		notes:
			"Duty: 2.5%. VAT: 18%.  Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	ITALY: {
		duty: "Duty: 0% , VAT: 22%",
		notes:
			"Duty: 2.5%. VAT: 22%.  Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	CYPRUS: {
		duty: "Duty: 0% , VAT: 19%",
		notes:
			"Duty: 2.5%. VAT: 19%.  Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	DENMARK: {
		duty: "Duty: 0% , VAT: 25%",
		notes:
			"Duty: 2.5%. VAT: 25%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	"CZECH REPUBLIC": {
		duty: "Duty: 0% , VAT: 21%",
		notes:
			"Duty: 2.5%. VAT: 21%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	BELGIUM: {
		duty: "Duty: 0% , VAT: 21%",
		notes:
			"Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},

	OMAN: {
		duty: "Duty: 5% , VAT: 5%",
		notes:
			"Duty: 5%. VAT: 5%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	"SOUTH KOREA": {
		duty: "Duty: 0% , VAT: 10%",
		notes:
			"Duty: 8%, VAT: 10%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	ESTONIA: {
		duty: "Duty: 0% , VAT: 20%",
		notes:
			"Duty: 2.5%, VAT: 20%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	PHILIPPINES: {
		duty: "Duty: 3% , VAT: 12%",
		notes:
			"Duty: 10%, VAT: 10%,Excise Duty:20% Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	"PUERTO RICO": {
		duty: "Duty: 0% , VAT: 0.25%",
		notes:
			"Duty: 5%, VAT: 0.25%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	PORTUGAL: {
		duty: "Duty: 0% , VAT: 25%",
		notes:
			"Duty: 2.5%, VAT: 25%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	JAPAN: {
		duty: "Duty: 0% , VAT: 11%",
		notes:
			"Duty: 5.5%, VAT: 11%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	GREECE: {
		duty: "Duty: 0% , VAT: 25%",
		notes:
			"Duty: 2.5%, VAT: 25.5%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	FINLAND: {
		duty: "Duty: 0% , VAT: 25%",
		notes:
			"Duty: 2.5%, VAT: 25%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	"TRINIDAD & TOBAGO": {
		duty: "Duty: 30.5% , VAT: 23.5%",
		notes:
			"Duty: 30.5%, VAT: 23.5%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	KUWAIT: {
		duty: "Duty: 5% , VAT: 0%",
		notes:
			"Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Minimum Disbursement Fee is AED 75 or 2% of Bill of Entry charges, whichever is higher. For any purchase over 5000$, you shall contact an independent customs broker to clear the shipment. As per UAE regulations Customs are not permitted to do the clearance over this value. Please be advised that customs calculations are based on previous deliveries to your country. It is best to confirm customs charges with your local customs department for more accurate charges.",
	},
	BULGARIA: {
		duty: "Duty: 0% , VAT: 20%",
		notes:
			"Duty: 2.5%, VAT: 20%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	EGYPT: {
		duty: "Duty: 10% , VAT: 14%",
		notes:
			"Duty: 10%, VAT: 14%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	BANGLADESH: {
		duty: "Duty: 53% , VAT: 15%",
		notes:
			"Duty: 53%, VAT: 15%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	BERMUDA: {
		duty: "Duty: 6.5% , VAT: 0%",
		notes:
			"Duty: 6.5%, VAT: 0%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	FRANCE: {
		duty: "Duty: 0% , VAT: 20%",
		notes:
			"Duty: 2.5%, VAT: 20%. If you are a customer residing in France and wish to shop with us, you are advised to appoint yourself a reputed French broker who is authorized to carry out the needful. Moreover, you will be required to appoint the CHA, who would then take charge of the shipments, do the customs clearance, and organize the delivery to your address in France. The CHA would charge an amount for this, which is beyond our knowledge or control. So, we advise you to check the brokerage charges by getting in touch with France Customs. For more details refer – https://www.gemrishi.com/blogs/france-shipping-policy. Logistics Partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Kindly note that the calculation of the customs is based on past deliveries to your country. For more accurate customs charges, it is advisable to confirm the charges from your local customs department. ",
	},
	BRAZIL: {
		duty: "Duty: 60% , VAT: 38%",
		notes:
			"Duty: 60%, VAT: 38%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	NORWAY: {
		duty: "Duty: 0% , VAT: 26.5%",
		notes:
			"Duty: 0%, VAT: 26.5%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	POLAND: {
		duty: "Duty: 0% , VAT: 23%",
		notes:
			"Duty: 2.5%, VAT: 23%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	BAHRAIN: {
		duty: "Duty: 5% , VAT: 5%",
		notes:
			"Duty: 5%, VAT: 5%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	LUXEMBOURG: {
		duty: "Duty: 0% , VAT: 17%",
		notes:
			"Duty: 2.5%, VAT: 17%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	ISRAEL: {
		duty: "Duty: 0% , VAT: 18%",
		notes:
			"Duty: 12%, VAT: 18%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	KAZAKHSTAN: {
		duty: "Duty: 15% , VAT: 12%",
		notes:
			"Duty: 15%, VAT: 12%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	CHINA: {
		duty: "Duty: 8% , VAT: 17%",
		notes:
			"Duty: 35%, VAT: 17%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	INDONESIA: {
		duty: "Duty: 10% , VAT: 10%",
		notes:
			"Duty: 15%, VAT: 10%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	ROMANIA: {
		duty: "Duty: 0% , VAT: 19%",
		notes:
			"Duty: 2.5%, VAT: 19%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	KENYA: {
		duty: "Duty: 0% , VAT: 14%",
		notes:
			"Duty: 25%, VAT: 14%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	ALBANIA: {
		duty: "Duty: 0% , VAT: 14%",
		notes:
			"Duty: 25%, VAT: 14%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	ALGERIA: {
		duty: "Nothing to Show",
		notes: "",
	},
	ANTARCTICA: {
		duty: "Duty: 0% , VAT: 25%",
		notes:
			"Duty: 6%, VAT: 25%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	ARUBA: {
		duty: "Duty: 3% , VAT: 1.5%",
		notes:
			"Duty: 3%, VAT: 1.5%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	BHUTAN: {
		duty: "Duty: 0% , VAT: 50%",
		notes:
			"Duty: 6%, VAT: 50%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	CAMBODIA: {
		duty: "Duty: 0% , VAT: 10%",
		notes:
			"Duty: 0%, VAT: 10%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
	"CENTRAL AFRICAN REPUBLIC": {
		duty: "Duty: 0% , VAT: 19%",
		notes:
			"Duty: 6%, VAT: 19%. Logistics partners pay the duties beforehand on your behalf and collect these while delivering at your doorstep (online payment possible). A handling charge of $12 is added to the duty/VAT. Customs calculations are based on previous deliveries to your country; please confirm with your local customs department for more accurate charges.",
	},
};

const certs = [
	{ id: 1, img: cert1 },
	{ id: 2, img: cert2 },
	{ id: 3, img: cert3 },
	{ id: 5, img: cert5 },
];

const countryList = [
	"USA",
	"UNITED KINGDOM",
	"CANADA",
	"AUSTRALIA",
	"UAE",
	"MALAYSIA",
	"SINGAPORE",
	"HONG KONG",
	"SAUDI ARABIA",
	"QATAR",
	"GERMANY",
	"FRANCE",
	"BRAZIL",
	"NETHERLAND",
	"SWITZERLAND",
	"NEW ZEALAND",
	"SPAIN",
	"SWEDEN",
	"NEW TAIWAN",
	"AUSTRIA",
	"NEW MONACO",
	"THAILAND",
	"TURKEY",
	"ITALY",
	"CYPRUS",
	"DENMARK",
	"CZECH REPUBLICK",
	"BELGIUM",
	"OMAN",
	"SOUTH KOREA",
	"ESTONIA",
	"PHILIPPINES",
	"PUERTO RICO",
	"PORTUGAL",
	"JAPAN",
	"GREECE",
	"FINLAND",
	"TRINIDAD & TOBAGOS",
	"KUWAIT",
	"BULGARIA",
	"EGYPT",
	"BANGLADESH",
	"BERMUDA",
	"FRANCE",
	"BRAZIL",
	"NORWAY",
	"POLAND",
	"BAHRAIN",
	"LUXEMBOURG",
	"ISRAEL",
	"KAZAKHSTAN",
	"CHINA",
	"INDONESIA",
	"ROMANIA",
	"KENYA",
	"ALBANIA",
	"ALGERIA",
	"ANTARCTICA",
	"ARUBA",
	"BHUTAN",
	"COMBODIA",
	"CENTRAL AFRICAN REPUBLIC",
];

const CustomDuties = () => {
	const navigate = useNavigate();
	const [country, setCountry] = useState("USA");

	const normalizedCountry = country.toUpperCase();
	const dutyInfo = dutyDataByCountry[normalizedCountry] || {
		duty: "N/A",
		notes:
			"Data not available for this country. Please check with your local customs office.",
	};

	return (
		<>
			{/* Hero Section */}
			<div
				className="w-full h-[318px] bg-cover bg-center"
				style={{ backgroundImage: `url(${AboutBG})` }}>
				<div
					className={`w-full h-[58px] flex flex-row items-center gap-2 ${PADDING_CLASS}`}>
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
					<span className="text-[#444445] cursor-pointer text-base sm:text-[22px]">
						Custom Duties & Taxes
					</span>
				</div>

				<div className="w-full h-[110px] flex justify-center items-center text-center">
					<h1 className="text-[32px] sm:text-[42px] font-semibold">
						Custom Duties & Taxes
					</h1>
				</div>

				<div className="w-full h-[150px] flex flex-col items-center text-center text-[20px] sm:text-[26px] font-semibold">
					<p>Know what you may pay before your package arrives</p>
					<p>Transparent and clear import duties info</p>
				</div>
			</div>

			{/* Main Content */}
			<div className={`w-full h-auto flex flex-col gap-6 ${PADDING_CLASS}`}>
				<p className="text-[#464646] text-[16px] sm:text-[20px] leading-relaxed mt-20 mb-6">
					We ship our products worldwide, and each country has different import
					duty and tax regulations. It’s important to understand these charges
					before placing an international order.
				</p>

				{/* Dropdown */}
				<div className="mb-6">
					<label className="block text-[#264A3F] font-semibold mb-2">
						Check duties for your country:
					</label>
					<select
						value={country}
						onChange={(e) => setCountry(e.target.value)}
						className="border border-gray-300 rounded-md px-3 py-2 text-[16px] sm:text-[18px] w-full max-w-sm focus:ring-2 focus:ring-[#264A3F] outline-none">
						<option value="">Check from here:</option>
						{countryList.map((ct) => (
							<option key={ct} value={ct}>
								{ct}
							</option>
						))}
					</select>
				</div>

				{/* Duty Info */}
				{/* Duty Info */}
				<div className="p-5 bg-gray-50 rounded-2xl shadow-sm mb-12 border border-gray-200">
					<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-3">
						Duty & Tax Info for {country || "Selected Country"}
					</h2>

					<p className="text-[#626262] text-[16px] sm:text-[18px] mb-3">
						<strong>Loose Gemstones:</strong> {dutyInfo.duty}
					</p>

					{/* Updated Jewelry Notes Rendering */}
					<div className="text-[#626262] text-[16px] sm:text-[18px]">
						<strong>Jewelry:</strong>
						{/* gap-1.5 controls the exact space between points. Change to gap-2 or gap-1 as needed */}
						<div className="mt-1 flex flex-col gap-1.5">
							{dutyInfo.notes.split('\n').map((line, index) => {
								// This skips any empty lines caused by \n\n
								if (!line.trim()) return null;

								return (
									<p key={index} className="leading-relaxed">
										{line.trim()}
									</p>
								);
							})}
						</div>
					</div>
				</div>

				<div className="px-6 py-10 w-full">
					<h2 className="text-3xl font-semibold text-center text-green-900">
						Certifications
					</h2>
					<p className="text-gray-600 text-center mt-2">
						Our all stones are certified by the world's leading gemology
						institutes and organizations.
					</p>

					<CertificationsCarousel items={certs} />
				</div>

				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					How Customs Duties & Taxes Work
				</h2>
				<p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
					When you import goods, your country’s customs authority may apply
					import duties, VAT/GST, and handling fees. These vary based on the
					product category, declared value, and trade policies. Some shipments
					may be selected for inspection, which could delay delivery or incur
					extra charges.
				</p>

				<h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
					Tips to Minimize Import Costs
				</h2>
				<ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-12">
					<li>Declare the correct product value to avoid customs penalties.</li>
					<li>Opt for DDP (Delivery Duty Paid) shipping when possible.</li>
					<li>
						Check for trade agreement benefits between your country and India.
					</li>
					<li>
						Ensure your order qualifies under duty-free import thresholds.
					</li>
				</ul>

				{/* Footer */}
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

export default CustomDuties;

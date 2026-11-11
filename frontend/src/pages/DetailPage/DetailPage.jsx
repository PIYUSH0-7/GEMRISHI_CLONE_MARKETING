import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderDetailPage from "./HeaderDetailPage";
import OrderDelivery from "./OrderDelivery";
import ProductDescription from "./ProductDescription";
import OtherGemstone from "./OtherGemstone";
import TrustBadges from "../../components/trust";
import BlueSapphireJewellery from "../../components/BlueSapphireJewellery";
import UserTestimonials from "../../components/UserTestimonals";

function DetailPage({ name: propName, sku: propSku, slug: propSlug }) {
	const { name: paramName, sku: paramSku, slug: paramSlug } = useParams();
	const activeName = propName || paramName;
	const activeSku = propSku || paramSku;
	const activeSlug = propSlug || paramSlug;
	const [gemstoneId, setGemstoneId] = useState(null);

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [activeName, activeSku, activeSlug]);

	return (
		<>
			<HeaderDetailPage slug={activeSlug} name={activeName} sku={activeSku} onSendId={(id) => setGemstoneId(id)} />
			<ProductDescription />
			{/*--------Add By Pawan for location info---------*/}
			<OtherGemstone slug={activeSlug} name={activeName} sku={activeSku} />
			{/*--------End Add By Pawan for location info-----*/}
			<BlueSapphireJewellery gemstone="blue-sapphire" gemstoneId={gemstoneId} />
			<div className="mt-24 mb-10">
				{/* <UserTestimonials/> */}
			</div>
		</>
	);
}

export default DetailPage;
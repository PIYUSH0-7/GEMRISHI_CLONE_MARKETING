import React from "react";
import Card from "./Card";

const JewelleryCard = ({ image, title, sku, origin, price, product, slug, ...rest }) => {
	return (
		<Card
			product={product}
			image={image}
			title={title || product?.jewelryName}
			sku={sku || product?.sku}
			origin={origin}
			price={price || product?.jewelryPrice}
			slug={slug || product?.slug}
			itemType="Jewelry"
			{...rest}
		/>
	);
};

export default JewelleryCard;

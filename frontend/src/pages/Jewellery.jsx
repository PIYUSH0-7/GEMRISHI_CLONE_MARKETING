import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useGemstoneCategories } from "../hooks/usegemstone";
import { getJewelryBySubCategory } from "../api/jewelryapi";
import { Helmet } from "react-helmet-async";
import { fixImageUrl } from "../utils/imageUtils";
import { appendRandomString } from "../utils/randomString";

const Jewellery = () => {
	const navigate = useNavigate();
	const { data: gemstones } = useGemstoneCategories();

	const [ringCollections, setRingCollections] = useState([
		{
			name: "Emerald Rings",
			type: "gemstone",
			gemstoneName: "emerald",
			image: "/ring.png",
		},
		{
			name: "Yellow Sapphire Rings",
			type: "gemstone",
			gemstoneName: "yellow sapphire",
			image: "/ring.png",
		},
		{
			name: "Blue Sapphire Rings",
			type: "gemstone",
			gemstoneName: "blue sapphire",
			image: "/ring.png",
		},
		{
			name: "Ruby Rings",
			type: "gemstone",
			gemstoneName: "ruby",
			image: "/ring.png",
		},
	]);

	// Fetch jewelry subcategories for each ring collection
	const [jewelrySlugs, setJewelrySlugs] = useState([]);

	useEffect(() => {
		if (!gemstones || gemstones.length === 0) return;

		const normalize = (text = "") => text.toLowerCase().trim();
		const findGemstoneByName = (name) =>
			gemstones.find(
				(stone) =>
					normalize(stone.name).includes(normalize(name)) ||
					normalize(stone.alternateName).includes(normalize(name))
			);

		const updatedCollections = ringCollections.map((item) => {
			if (item.type !== "gemstone") return item;

			const stone = findGemstoneByName(item.gemstoneName);
			const baseSlug = stone?.slug || item.gemstoneName.toLowerCase().replace(/\s+/g, "-");
			const slug = baseSlug.endsWith("-rings") ? baseSlug : `${baseSlug}-rings`;

			return {
				...item,
				gemstoneId: stone?._id || null,
				slug,
			};
		});

		setRingCollections(updatedCollections);
		setJewelrySlugs(updatedCollections.map(c => c.slug));
	}, [gemstones]);

	// Fetch jewelry subcategory images
	useEffect(() => {
		if (jewelrySlugs.length === 0) return;

		const fetchImages = async () => {
			try {
				const updatedCollections = await Promise.all(
					ringCollections.map(async (collection) => {
						if (!collection.slug) return collection;

						try {
							const response = await getJewelryBySubCategory(collection.slug, 1);
							const subcategoryImage = response?.subcategory?.image?.url ||
								response?.subcategory?.image;

							return {
								...collection,
								image: fixImageUrl(subcategoryImage) || collection.image,
							};
						} catch {
							return collection;
						}
					})
				);

				setRingCollections(updatedCollections);
			} catch (error) {
				console.error("Error fetching jewelry subcategory images:", error);
			}
		};

		fetchImages();
	}, [jewelrySlugs]);

	const handleCollectionClick = (collection) => {
		if (collection?.slug) {
			navigate(appendRandomString(`/jewelry/${collection.slug}`), { replace: true });
			return;
		}

		if (collection.gemstoneId) {
			const queryParams = new URLSearchParams({
				jewelryType: "Ring",
				gemstoneType: collection.gemstoneId,
				page: 1,
			});
			navigate(`/jewellery-results?${queryParams.toString()}`, { replace: true });
		}
	};

	return (
		<div className="">
			<Helmet>
				<title>Jewelry | GemRishi India</title>
				<meta
					name="description"
					content="Explore certified natural jewelry from GemRishi India. Astrology jewelry, gemstone rings, pendants, and more with authentic certificates."
				/>
			</Helmet>

			<div className="text-gray-900 mt-2 text-sm flex items-center space-x-2 p-4 px-6 sm:px-10 md:px-20 lg:px-32">
				<span
					className="cursor-pointer hover:text-[#264A3F] transition-colors text-[16px] sm:text-[18px]"
					onClick={() => navigate("/")}
				>
					Home
				</span>
				<span>&gt;</span>
				<span
					className="cursor-pointer hover:text-[#264A3F] transition-colors text-[16px] sm:text-[18px]"
					onClick={() => navigate("/ring")}
				>
					Gemstone
				</span>
			</div>

			<div className="px-6 sm:px-10 md:px-20 lg:px-32 mt-4">
				<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
					<div>
						<h1 className="text-[28px] sm:text-[32px] lg:text-[35px] font-bold text-gray-900 mb-2">
							Jewellery
						</h1>
						<p className="text-gray-700 text-[16px] sm:text-[18px] lg:text-[20px] leading-relaxed">
							Explore our ring collections with one click. Choose from all rings or gemstone-specific ring collections and jump straight to the product results.
						</p>
					</div>
				</div>

				<div className="mt-12">
					<h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">Ring Collections</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
						{ringCollections.map((collection, index) => (
							<div
								key={index}
								onClick={() => handleCollectionClick(collection)}
								className="flex flex-col items-center justify-center bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:translate-y-[-8px] border-2 border-transparent hover:border-[#264A3F] group"
							>
								<div className="w-full h-64 sm:h-72 bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden relative">
									<img
										src={collection.image}
										alt={collection.name}
										className="w-40 h-40 sm:w-48 sm:h-48 object-contain group-hover:scale-110 transition-transform duration-300"
										onError={(e) => {
											e.target.src = "/ring.png";
										}}
									/>
								</div>
								<div className="w-full px-6 py-6 text-center border-t border-gray-200">
									<p className="font-semibold text-gray-900 text-base sm:text-lg group-hover:text-[#264A3F] transition-colors duration-300">
										{collection.name}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

		</div>
	);
};

export default Jewellery;

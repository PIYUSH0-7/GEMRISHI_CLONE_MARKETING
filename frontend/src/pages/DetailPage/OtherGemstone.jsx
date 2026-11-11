import React from "react";
import { useParams } from "react-router-dom";
import { useGemstoneBySlug } from "../../hooks/usesinglegemstone";
import MapIcon from "../../assets/DetailPage/MapIcon.svg";

//----------------Add By Pawan for location info------------------
function OtherGemstone({ name: propName, sku: propSku, slug: propSlug }) {
	const { name: paramName, sku: paramSku, slug: paramSlug } = useParams();

	const activeName = propName || paramName;
	const activeSku = propSku || paramSku;
	const activeSlug = propSlug || paramSlug;

	const { product, countryData, loading, error } = useGemstoneBySlug(
		activeName || activeSlug,
		activeSku
	);
//-------------- End Add By Pawan for location info---------------

	if (loading) {
		return (
			<div className="w-full flex justify-center items-center py-20">
				<p className="text-gray-600">Loading country information...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full text-center text-red-500 py-10">
				Failed to load gemstone details.
			</div>
		);
	}

	if (!countryData) {
		return (
			<div className="w-full text-center text-gray-500 py-10">
				No country information available.
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="w-full flex justify-center items-center py-4 lg:py-0 h-auto lg:h-[646px]">
				<div className="w-full bg-gray-100 px-2 sm:px-4 md:px-10 lg:px-20 flex items-center justify-center h-auto lg:h-[446px]">
					<div className="w-full max-w-[1218px] flex flex-col lg:flex-row justify-between h-auto lg:h-[348px]">
						<div className="w-full max-w-[313px] h-[180px] sm:h-[220px] md:h-[260px] lg:h-full mx-auto flex items-center justify-center">
							<img
								src={countryData?.image?.url || "/placeholder.svg"}
								alt={countryData?.countryName || "Country"}
								className="w-full h-full object-contain"
							/>
						</div>

						<div className="w-full lg:w-[860px] h-auto lg:h-full mt-4 lg:mt-0">
							<div className="flex items-center w-full h-[40px] sm:h-[50px] gap-2 sm:gap-3">
								<img
									src={MapIcon}
									alt="MapIconImg"
									className="w-[20px] h-[20px] sm:w-[27px] sm:h-[27px]"
								/>
								<h1 className="text-[18px] sm:text-[22px] md:text-[24px] text-[#1D11A4]">
									{countryData?.countryName || "Unknown Country"}
								</h1>
							</div>

							<p className="text-[14px] sm:text-[16px] md:text-[18px] text-gray-600 leading-[20px] sm:leading-[22px] pl-1 sm:pl-2">
								{countryData?.description ||
									`No detailed description available for ${countryData?.countryName || "this origin"
									}.`}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default OtherGemstone;
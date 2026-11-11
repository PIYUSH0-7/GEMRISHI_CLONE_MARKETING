import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RingsModal = ({ onHover, onMouseLeave }) => {
	const [rings, setRings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	const URL = import.meta.env.VITE_URL;

	useEffect(() => {
		const fetchRings = async () => {
			try {
				const response = await axios.get(
					`${URL}/jewelry/get-all-jewelry?jewelryType=Ring`
				);

				const fetchedRings = response.data.jeweleries;

				if (Array.isArray(fetchedRings)) {
					const ringNames = fetchedRings.map((ring) => ring.jewelryName);
					setRings(ringNames);
				} else {
					console.error(
						"API response 'jeweleries' is not an array:",
						fetchedRings
					);
					setError("Invalid data format from API.");
				}
			} catch (err) {
				console.error("Error fetching rings:", err);
				setError("Failed to fetch rings data.");
			} finally {
				setLoading(false);
			}
		};

		fetchRings();
	}, []);

	// Show skeletal loading state
	if (loading) {
		return (
			<div
				className="absolute top-[100%] z-50 bg-[#e4ecec] shadow-2xl rounded-b-[20px] p-8 transition-opacity duration-300 opacity-100 left-1/2 transform -translate-x-1/2 w-full md:w-[250px] h-auto"
				onMouseEnter={onHover}
				onMouseLeave={onMouseLeave}>
				<div className="flex flex-col space-y-2">
					{[...Array(8)].map((_, index) => (
						<div key={index} className="animate-pulse">
							<div
								className="h-4 bg-gray-300 rounded"
								style={{
									width: `${60 + Math.random() * 40}%`,
									animationDelay: `${index * 0.1}s`,
								}}></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div
				className="absolute top-[100%] z-50 bg-[#e4ecec] shadow-2xl rounded-b-[20px] p-8 transition-opacity duration-300 opacity-100 left-1/2 transform -translate-x-1/2 w-full md:w-[250px] h-auto"
				onMouseEnter={onHover}
				onMouseLeave={onMouseLeave}>
				<div className="text-center text-red-500">{error}</div>
			</div>
		);
	}

	// Show fetched rings data
	return (
		<div
			className="absolute top-[100%] z-50 bg-[#e4ecec] shadow-2xl rounded-b-[20px] p-8 transition-opacity duration-300 opacity-100 left-1/2 transform -translate-x-1/2 w-full md:w-[250px] h-auto"
			onMouseEnter={onHover}
			onMouseLeave={onMouseLeave}>
			<div className="flex flex-col space-y-2">
				{rings.map((ringName, index) => (
					<div
						key={index}
						className="text-gray-700 hover:text-[#264A3F] transition-colors cursor-pointer">
						<span onClick={() => navigate("/products")}>{ringName}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default RingsModal;

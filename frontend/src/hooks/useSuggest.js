// hooks/useGemSuggestion.js
import { useState } from "react";
import { getGemSuggestion } from "../api/gemsuggest";

/**
 * Custom hook for fetching gemstone suggestion
 * Handles loading, error, and data states
 */
export const useGemSuggestion = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

	/**
	 * Fetch gemstone suggestion based on user input
	 * @param {Object} birthDetails - { dateOfBirth, timeOfBirth, placeOfBirth }
	 */
	const fetchGemSuggestion = async (birthDetails) => {
		try {
			setLoading(true);
			setError(null);
			const response = await getGemSuggestion(birthDetails);
			////console.log("Fetch response:", response);
			setData(response);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to fetch suggestion");
			console.error("Gem suggestion error:", err);
		} finally {
			setLoading(false);
		}
	};

	return {
		data,
		loading,
		error,
		fetchGemSuggestion,
	};
};

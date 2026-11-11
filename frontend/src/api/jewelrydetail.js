import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

export const getAllJewelryTypes = async () => {
	try {
		const response = await axios.get(
			`${API_URL}/jewelrySubCategory/get_all_jewelry_type_list`
		);
		////console.log("Response of:", response);
		return response.data;
	} catch (error) {
		console.error(
			"Error fetching jewelry type list:",
			error.response?.data || error.message
		);
		throw error;
	}
};

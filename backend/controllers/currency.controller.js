import { getRates } from "../services/currency.services.js";

 const getCurrencyRates = async (req, res) => {
    try {
        const rates = await getRates();

        res.status(200).json({
            success: true,
            base: "INR",
            rates,
            updatedAT: new Date().toDateString(),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch currency rates",
        });
    }
};
export default  getCurrencyRates;
import { useSelector, useDispatch } from "react-redux";
import { setCurrency } from "../redux/currencySlice";
import { trackCustomEvent } from "../utils/autoTracking";

const options = [
  { label: "India", currency: "INR" },
  { label: "USA", currency: "USD" },
  { label: "UK", currency: "GBP" },
  { label: "UAE", currency: "AED" },
  { label: "Australia", currency: "AUD" },
  { label: "Canada", currency: "CAD" },
  { label: "Germany", currency: "EUR" },
];

const CurrencySelector = () => {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.currency.currency);

  const handleChange = (e) => {
    const val = e.target.value;
    dispatch(setCurrency(val));
    trackCustomEvent("Currency_Switched", {
      selected_currency: val,
      category: "Cross Border",
    });
    if (typeof window.clarity === "function") {
      window.clarity("set", "currency_preference", val);
      window.clarity("set", "buyer_region", val === "INR" ? "Domestic_India" : "NRI_International");
    }
  };

  return (
    <select
      value={currency}
      onChange={handleChange}
      className="lg:text-sm text-[10px] text-black hover:text-cyan-700 font-bold bg-transparent rounded border border-gray-300 px-2 py-1"
    >
      {options.map((opt) => (
        <option
          key={opt.currency}
          value={opt.currency}
          className="py-2 px-5"
        >
          {opt.label} ({opt.currency})
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;

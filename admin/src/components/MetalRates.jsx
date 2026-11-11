import { useEffect, useState } from "react";
import { useGoldRateQuery, useSilverRateQuery } from "../features/api/apiSlice";

const MetalRates = () => {
  const [rates, setRates] = useState({
    Gold: "",
    Silver: "",
  });
  const [errors, setErrors] = useState({ Gold: "", Silver: "" });

  const { data: goldData, error: goldDataError } = useGoldRateQuery("INR");
  const { data: silverData, error: silverDataError } =
    useSilverRateQuery("INR");


  useEffect(() => {
    setErrors({
      Gold: goldDataError?.data?.error || goldDataError?.error || "",
      Silver: silverDataError?.data?.error || silverDataError?.error || "",
    });

    if (goldData || silverData) {
      setRates({
        Gold: goldData?.price_gram_24k?.toFixed(2) || "",
        Silver: silverData?.price_gram_24k?.toFixed(2) || "",
      });
    }
  }, [goldData, silverData, goldDataError, silverDataError]);

  const handleRateChange = (metal, value) => {
    setRates((prev) => ({
      ...prev,
      [metal]: Number(value),
    }));
  };

  const handleSave = () => {
    alert("Rates saved successfully!");
  };

  return (
    <div className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold">Metal Rates</h2>
      <p className="text-sm text-gray-500">Daily rate updates</p>

      {/* Gold */}
      <div className="p-3 rounded-lg border border-gray-200 bg-[#FFE1001A]">
        <span className="font-medium">Gold (Per gram)</span>
        <br />
        <span className="text-xs text-gray-600">New Rate(Rs)</span>
        <p
          type="text"
          value={rates.Gold}
          onChange={(e) => handleRateChange("Gold", e.target.value)}
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        />
       {errors.Gold && <p className="text-xs text-red-500">{errors.Gold}</p>}

      </div>

      {/* Silver */}
      <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
        <span className="font-medium">Silver (Per gram)</span>
        <br />
        <span className="text-xs text-gray-600">New Rate(Rs)</span>
        <p
          value={rates.Silver}
          onChange={(e) => handleRateChange("Silver", e.target.value)}
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:outline-none"
        />
        {errors.Silver && <p className="text-xs text-red-500">{errors.Silver}</p>}
      </div>

      {/* Save Button */}

      <div className="p-4 border border-blue-300 rounded-lg bg-blue-50 text-blue-700 max-w-md">
        <h3 className="text-sm font-semibold">Quick Tip</h3>
        <p className="text-sm mt-1">
          Update rates daily to ensure accurate pricing calculation for jewelry
          items
        </p>
      </div>
    </div>
  );
};

export default MetalRates;

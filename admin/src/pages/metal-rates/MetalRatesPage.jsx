import { useState } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import DashboardTable from "../../components/DashboardTable";
import Stone1 from "../../assets/Stone1.svg";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAddRatesMutation,
  useSyncJewelryPricesMutation,
  useGetFeaturedProductsQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useSalesDataQuery,
} from "../../features/api/apiSlice";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Search,
  Filter,
  ChevronDown,
  Calendar,
  X,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Info,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200 p-1 rounded-lg",
  InProgress: "bg-blue-100 text-blue-800 border-blue-200 p-1 rounded-lg",
  Completed: "bg-purple-100 text-purple-800 border-purple-200 p-1 rounded-lg",
  Cancelled: "bg-red-100 text-red-800 border-red-200 p-1 rounded-lg",
};

function MetalRatesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [date] = useState("11-02-2025");
  const [errors, setErrors] = useState({});

  const [goldGst, setGoldGst] = useState("3");
  const [silverGst, setSilverGst] = useState("3");
  const [platGst, setPlatGst] = useState("3");
  const [brassGst, setBrassGst] = useState("3");

  const [goldRates, setGoldRates] = useState({
    24: "",
    22: "",
    18: "",
  });

  const [silverRate, setSilverRate] = useState("");
  const [platRate, setPlatRate] = useState("");
  const [brassRate, setBrassRate] = useState("");

  const calculateWithGst = (rate, gst) => {
    const numRate = Number.parseFloat(rate.replace(",", ""));
    const numGst = Number.parseFloat(gst);
    if (isNaN(numRate) || isNaN(numGst)) return rate;
    const withGst = numRate + (numRate * numGst) / 100;
    return withGst.toLocaleString("en-IN");
  };
  const parseRate = (rate) => Number(rate.replace(/,/g, "")) || 0;

  const [
    addMetalRates,
    { isLoading: metalRatesLoading, error: metalRatesError },
  ] = useAddRatesMutation();

  const [syncJewelryPrices, { isLoading: isSyncing }] =
    useSyncJewelryPricesMutation();

  const handleManualSync = async () => {
    try {
      const res = await syncJewelryPrices().unwrap();
      toast.success(
        res?.message || "All jewellery making prices recalculated successfully!"
      );
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || "Failed to sync jewellery prices"
      );
    }
  };

  const handleSave = async () => {
    // ✅ Basic validations
    const newErrors = {};
    if (!goldRates[24]) newErrors.gold24 = "24k gold rate is required";
    if (!goldRates[22]) newErrors.gold22 = "22k gold rate is required";
    if (!goldRates[18]) newErrors.gold18 = "18k gold rate is required";
    if (!silverRate) newErrors.silver = "Silver rate is required";
    if (!platRate) newErrors.platinum = "Platinum rate is required";
    if (!brassRate) newErrors.brass = "Brass rate is required";
    if (!goldGst) newErrors.goldGst = "Gold GST is required";
    if (!silverGst) newErrors.silverGst = "Silver GST is required";
    if (!platGst) newErrors.platinumGst = "Platinum GST is required";
    if (!brassGst) newErrors.brassGst = "Brass GST is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await addMetalRates({
        gold_gstpergram: Number(goldGst),
        gold24k: parseRate(goldRates[24]),
        gold22k: parseRate(goldRates[22]),
        gold18k: parseRate(goldRates[18]),

        silver_gstpergram: Number(silverGst),
        silver_rate: parseRate(silverRate),

        platinum_gstpergram: Number(platGst),
        platinum_rate: parseRate(platRate),

        panchadhatu_gstpergram: Number(brassGst),
        panchadhatu_rate: parseRate(brassRate),

        note: `Rates updated for ${new Date().toLocaleDateString()}`,
      }).unwrap();

      toast.success(
        res?.message ||
          "Metal rates and jewellery making prices updated successfully!"
      );

      setGoldRates({
        24: "",
        22: "",
        18: "",
      });
      setSilverRate("");
      setPlatRate("");
      setBrassRate("");
      setGoldGst("3");
      setSilverGst("3");
      setPlatGst("3");
      setBrassGst("3");
      
    } catch (error) {
      toast.error(error?.data?.msg || error?.data?.message || error?.error || "Something went wrong");
    }
  };

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100">
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <Navbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
            onClick={closeSidebar}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-[230px] bg-white border-r border-gray-200 lg:hidden"
          >
            <Navbar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              closeSidebar={closeSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <UpperBar toggleSidebar={toggleSidebar} />
        </div>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Metal Rates
                  </h1>
                  <p className="text-sm text-gray-500">
                    Daily rate updates (automatically recalculates all jewellery making prices)
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="bg-[#214436] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1a352a] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSyncing ? "Syncing..." : "🔄 Recalculate All Jewellery Prices"}
                  </button>
                  <div onClick={() => navigate("/metal-rates-history")}>
                    <button className="bg-[#264A3F] text-white px-4 py-2 rounded-md text-sm w-full hover:bg-[#1f3a31] cursor-pointer">View History
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString()} </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Gold Section */}
              <div className="bg-[#FFF7BD80] rounded-lg p-6 border border-yellow-200 w-[70%]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <h2 className="font-medium text-gray-900">Gold (Per gram)</h2>
                </div>

                {/* GST Input */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      GST (Per Gram)
                    </span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="Number"
                        value={goldGst}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (
                            (value >= 0 && value <= 100) ||
                            e.target.value === ""
                          )
                            setGoldGst(e.target.value);
                        }}
                        className="w-12 h-8 text-center text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  {errors.goldGst && (
                    <span className="text-red-500 text-xs">
                      {errors.goldGst}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Headers */}
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600">
                    <div>New Rate(Rs)</div>
                    <div></div>
                    <div className="text-center mb-2">With GST</div>
                    <div className="text-center mb-2">Without GST</div>
                  </div>

                  {/* Gold Rates */}
                  {["24", "22", "18"].map((carat) => (
                    <div
                      key={carat}
                      className="grid grid-cols-4 gap-2 items-center"
                    >
                      {/* Label + Input */}
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">{carat} Carat</div>
                        <div className="flex items-center mt-1">
                          <div className="relative w-32">
                            <span className="absolute inset-y-0 left-2 flex items-center text-gray-500 text-sm">
                              ₹
                            </span>
                            <Input
                              type="Number"
                              value={goldRates[carat]}
                              onChange={(e) => {
                                const value = e.target.value;
                                const num = Number(value);

                                if (value === "" || num >= 0) {
                                  setGoldRates((prev) => ({
                                    ...prev,
                                    [carat]: value,
                                  }));
                                  // clear error when valid
                                  setErrors((prev) => ({
                                    ...prev,
                                    [`gold${carat}`]: "",
                                  }));
                                } else {
                                  // set error when negative
                                  setErrors((prev) => ({
                                    ...prev,
                                    [`gold${carat}`]:
                                      "Value cannot be negative",
                                  }));
                                }
                              }}
                              className="h-8 text-lg pl-6" // padding so value doesn't overlap ₹
                            />
                          </div>
                        </div>
                        {errors[`gold${carat}`] && (
                          <span className="text-red-500 text-xs">
                            {errors[`gold${carat}`]}
                          </span>
                        )}
                      </div>

                      {/* Empty column (original second column) */}
                      <div></div>

                      {/* With GST */}
                      <div className="text-center text-sm">
                        ₹ {calculateWithGst(goldRates[carat], goldGst)}
                      </div>

                      {/* Without GST */}
                      <div className="text-center text-sm">
                        ₹ {goldRates[carat]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Silver Section */}
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mt-4 w-[70%]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <h2 className="font-medium text-gray-900">
                    Silver (Per gram)
                  </h2>
                </div>

                {/* GST Input */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      GST (Per Gram)
                    </span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="Number"
                        value={silverGst}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (
                            (value >= 0 && value <= 100) ||
                            e.target.value === ""
                          )
                            setSilverGst(e.target.value);
                        }}
                        className="w-12 h-8 text-center text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  {errors.silverGst && (
                    <span className="text-red-500 text-xs">
                      {errors.silverGst}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Headers */}
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600">
                    <div>New Rate(Rs)</div>
                    <div></div>
                    <div className="text-center mb-2">With GST</div>
                    <div className="text-center mb-2">Without GST</div>
                  </div>

                  {/* Silver Rates */}
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium">Silver</div>
                      <div className="flex items-center mt-1">
                        <div className="relative w-32">
                          <span className="absolute inset-y-0 left-2 flex items-center text-gray-500 text-sm">
                            ₹
                          </span>
                          <Input
                            type="Number"
                            value={silverRate}
                            onChange={(e) => {
                              const value = e.target.value;
                              const num = Number(value);

                              if (value === "" || num >= 0) {
                                setSilverRate(value);

                                // clear error when valid
                                setErrors((prev) => ({
                                  ...prev,
                                  silver: "",
                                }));
                              } else {
                                // set error when negative
                                setErrors((prev) => ({
                                  ...prev,
                                  silver: "Value cannot be negative",
                                }));
                              }
                            }}
                            className="h-8 text-lg pl-6" // add padding-left so text doesn’t overlap the ₹
                          />
                        </div>
                      </div>
                      {errors.silver && (
                        <span className="text-red-500 text-xs">
                          {errors.silver}
                        </span>
                      )}
                    </div>

                    <div></div>

                    <div className="text-center text-sm">
                      ₹ {calculateWithGst(silverRate, silverGst)}
                    </div>

                    <div className="text-center text-sm">₹ {silverRate}</div>
                  </div>
                </div>
              </div>

              {/* Plat Section */}
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mt-4 w-[70%]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <h2 className="font-medium text-gray-900">
                    Platinum (Per gram)
                  </h2>
                </div>

                {/* GST Input */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      GST (Per Gram)
                    </span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="Number"
                        value={platGst}
                        onChange={(e) => setPlatGst(e.target.value)}
                        className="w-12 h-8 text-center text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  {errors.platinumGst && (
                    <span className="text-red-500 text-xs">
                      {errors.platinumGst}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Headers */}
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600">
                    <div>New Rate(Rs)</div>
                    <div></div>
                    <div className="text-center mb-2">With GST</div>
                    <div className="text-center mb-2">Without GST</div>
                  </div>

                  {/* Plat Rates */}
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium">Platinum</div>
                      <div className="flex items-center mt-1">
                        <div className="relative w-32">
                          <span className="absolute inset-y-0 left-2 flex items-center text-gray-500 text-sm">
                            ₹
                          </span>
                          <Input
                            type="Number"
                            value={platRate}
                            onChange={(e) => {
                              const value = e.target.value;
                              const num = Number(value);

                              if (value === "" || num >= 0) {
                                setPlatRate(value);

                                // clear error when valid
                                setErrors((prev) => ({
                                  ...prev,
                                  platinum: "",
                                }));
                              } else {
                                // set error when negative
                                setErrors((prev) => ({
                                  ...prev,
                                  platinum: "Value cannot be negative",
                                }));
                              }
                            }}
                            className="h-8 text-lg pl-6" // add padding-left so text doesn’t overlap the ₹
                          />
                        </div>
                      </div>
                      {errors.platinum && (
                        <span className="text-red-500 text-xs">
                          {errors.platinum}
                        </span>
                      )}
                    </div>

                    <div></div>

                    <div className="text-center text-sm">
                      ₹ {calculateWithGst(platRate, platGst)}
                    </div>

                    <div className="text-center text-sm">₹ {platRate}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mt-4 w-[70%]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <h2 className="font-medium text-gray-900">
                    Brass (Per gram)
                  </h2>
                </div>

                {/* GST Input */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      GST (Per Gram)
                    </span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="Number"
                        value={brassGst}
                        onChange={(e) => setBrassGst(e.target.value)}
                        className="w-12 h-8 text-center text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  {errors.brassGst && (
                    <span className="text-red-500 text-xs">
                      {errors.brassGst}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Headers */}
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600">
                    <div>New Rate(Rs)</div>
                    <div></div>
                    <div className="text-center mb-2">With GST</div>
                    <div className="text-center mb-2">Without GST</div>
                  </div>

                  {/* Brass Rates */}
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium">Brass</div>
                      <div className="flex items-center mt-1">
                        <div className="relative w-32">
                          <span className="absolute inset-y-0 left-2 flex items-center text-gray-500 text-sm">
                            ₹
                          </span>
                          <Input
                            type="Number"
                            value={brassRate}
                            onChange={(e) => {
                              const value = e.target.value;
                              const num = Number(value);

                              if (value === "" || num >= 0) {
                                setBrassRate(value);

                                // clear error when valid
                                setErrors((prev) => ({
                                  ...prev,
                                  brass: "",
                                }));
                              } else {
                                // set error when negative
                                setErrors((prev) => ({
                                  ...prev,
                                  brass: "Value cannot be negative",
                                }));
                              }
                            }}
                            className="h-8 text-lg pl-6" // add padding-left so text doesn’t overlap the ₹
                          />
                        </div>
                      </div>
                      {errors.brass && (
                        <span className="text-red-500 text-xs">
                          {errors.brass}
                        </span>
                      )}
                    </div>

                    <div></div>

                    <div className="text-center text-sm">
                      ₹ {calculateWithGst(brassRate, brassGst)}
                    </div>

                    <div className="text-center text-sm">₹ {brassRate}</div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white mt-4 h-10 rounded-lg w-[70%]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetalRatesPage;

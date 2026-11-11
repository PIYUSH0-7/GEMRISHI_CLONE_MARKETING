import { useRef, useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { motion, AnimatePresence } from "framer-motion";
import { useGetCountriesDataQuery } from "../../features/api/apiSlice";
import { useNavigate } from "react-router-dom";
import { Edit2Icon } from "lucide-react";
import CountryOriginEditCard from "./CountryOriginEditCard";
export const CountryOriginList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false)
  const [country, setCountry] = useState(null)
  const navigate = useNavigate();

  const { data: originCountryList, isLoading: originCountryListLoading } =
    useGetCountriesDataQuery();
  const countries = originCountryList?.countryList;


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
          <div className="mb-4">
            <span
              className="text-gray-500 text-sm cursor-pointer"
              onClick={() => navigate("/country-origin")}
            >
              Add Country
            </span>
            <span className="text-gray-400 mx-2">{">"}</span>
            <span className="text-gray-700 text-sm font-medium">Countries</span>
          </div>
          <div className="bg-white w-full h-auto rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Country List Mapping
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {countries?.map((country) => (
                <div
                  key={country._id}
                  className="flex flex-col items-center bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-full flex justify-end">
                    <button onClick={() => {
                        setOpen(true);
                        setCountry(country)
                    }}>
                      <Edit2Icon className="w-5 h-5" />
                    </button>
                  </div>
                  <img
                    src={country?.image?.url}
                    alt={country.countryName}
                    className="w-24 h-24 object-cover rounded-md mb-3"
                  />
                  <p className="text-sm font-medium text-gray-700 text-center">
                    {country.countryName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CountryOriginEditCard setOpen={setOpen} open={open} country={country}/>
    </div>
  );
};

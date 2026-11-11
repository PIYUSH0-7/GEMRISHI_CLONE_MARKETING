import { useRef, useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import UpperBar from "../../components/UpperBar";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../../ui/dropdown-menu";
import { toast } from "react-toastify";
import countries from "../../JSON/countries.json";
import { useCreateCountryOriginMutation } from "../../features/api/apiSlice";
import { useNavigate } from "react-router-dom";

export const CountryOrigin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    countryName: "",
    countryCode: "",
  });
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState("");
  const fileRef = useRef();
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  // Debounce effect: updates debouncedSearch 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // delay in ms

    return () => clearTimeout(timer); // cleanup previous timer
  }, [search]);

  // Use debouncedSearch for filtering
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const [createCountryOrigin] = useCreateCountryOriginMutation();

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.description) newErrors.description = "pls add description";
    if (!formData.countryName) newErrors.countryName = "pls add country";
    if (!image) newErrors.image = "pls add image";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // stop saving if validation fails
    }
    try {
      const data = new FormData();
      data.append("description", formData.description);
      data.append("image", image);
      data.append("countryName", formData.countryName);
      data.append("countryCode", formData.countryCode);

      await createCountryOrigin(data).unwrap();

      toast.success("Origin added successfully");

      setFormData({
        description: "",
        countryName: "",
        countryCode: "",
      });
      setPreview("")
      setImage("")
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

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
          <div className="mb-6">
            <span className="text-gray-500 text-sm cursor-pointer">
              Add Country
            </span>
          </div>
          <div className="bg-white w-full h-auto p-4 rounded-2xl shadow-md">
            <div className="flex justify-between">
              <h1 className="text-2xl font-semibold mb-4">
                Country Origin Page
              </h1>
              <Button
                className="bg-[#264A3F] text-white cursor-pointer"
                onClick={() => navigate("/country-origin-list")}
              >
                Countries list
              </Button>
            </div>
            {/* Content for Country Origin Page goes here */}
            <div className="p-6 gap-4 flex flex-col">
              <div className="flex flex-col">
                <label
                  htmlFor="country-dropdown"
                  className="text-sm font-medium mb-1 cursor-pointer"
                >
                  Country Name:
                </label>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    id="country-dropdown"
                    className="px-3 py-2 border rounded w-auto text-left bg-white"
                  >
                    {selected || "Select Country"}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="w-full h-64 bg-white"
                  >
                    {/* <Input
                      type="text"
                      placeholder="search country"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoFocus
                    /> */}
                    {filteredCountries?.map((country) => (
                      <DropdownMenuItem
                        key={country.code}
                        onSelect={() => {
                          setSelected(country.name);
                          setFormData((prev) => ({
                            ...prev,
                            countryName: country.name,
                            countryCode: country.code,
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            countryName: "",
                          }));
                        }}
                      >
                        {country?.name}
                      </DropdownMenuItem>
                    ))}
                    {filteredCountries.length === 0 && (
                      <p className="text-sm text-gray-500 px-2 py-1">
                        No results found
                      </p>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.countryName && (
                  <p className="text-xs text-red-500">{errors.countryName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="desc"
                  className="text-sm font-medium mb-1 cursor-pointer"
                >
                  Country Description:
                </label>
                <Textarea
                  placeholder="Type here..."
                  id="desc"
                  className="mt-2"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="map"
                  className="text-sm font-medium mb-1 cursor-pointer"
                >
                  Country Map Image:
                </label>
                <Input
                  type="file"
                  id="map"
                  className="mt-2"
                  ref={fileRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImage(file);
                    setPreview(URL.createObjectURL(file));

                    setErrors((prev) => ({
                      ...prev,
                      image: "",
                    }));
                  }}
                />
                {errors.image && (
                  <p className="text-xs text-red-500">{errors.image}</p>
                )}

                {/* <Button onClick={() => {fileRef.current.click()}}>Select image for country</Button> */}
                {preview && (
                  <img
                    src={preview}
                    alt="countryimg"
                    className="mt-2 h-24 w-24 object-cover rounded"
                  />
                )}
              </div>

              <div>
                <Button
                  className="mt-4 bg-[#264A3F] text-white px-4 py-2 rounded"
                  onClick={handleSave}
                >
                  Add country
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

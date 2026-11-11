import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Textarea } from "../../ui/textarea";
import { useUpdateSingleCountryOriginMutation } from "../../features/api/apiSlice";

function CountryOriginEditCard({ setOpen, open, country }) {
  const [formData, setFormData] = useState({
    countryName: country?.countryName,
    countryCode: country?.countryCode,
    description: country?.description,
  });

  const [updateCountryOrigin] = useUpdateSingleCountryOriginMutation();

  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(country?.image?.url || null);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImg(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("id", country._id); // matches backend
      data.append("countryName", formData.countryName);
      data.append("description", formData.description);
      data.append("countryCode", formData.countryCode);

      if (img) data.append("image", img);

      await updateCountryOrigin(data).unwrap()
      toast.success("Country updated successfully!");
      setOpen(false);
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Update failed"
      );
    }
  };

  useEffect(() => {
    if (country) {
      setFormData({
        countryName: country.countryName || "",
        countryCode: country.countryCode || "",
        description: country.description || "",
      });
      setPreview(country.image?.url || null);
    }
  }, [country]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!open || !country) return null;

  return (
    <>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Edit Country
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center h-40 cursor-pointer mb-4"
              onClick={() => fileRef.current.click()}
            >
              <img
                src={preview}
                alt="country"
                className="h-32 w-32 object-cover rounded-md"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="countryName"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Country Name
                </label>
                <input
                  name="countryName"
                  id="countryName"
                  value={formData.countryName}
                  onChange={handleInputChange}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
                  placeholder="Enter country name"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Description
                </label>
                <Textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CountryOriginEditCard;

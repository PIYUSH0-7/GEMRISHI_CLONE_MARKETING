import React, { useEffect, useState } from "react";
import IsActiveSwitch from "../components/IsActiveSwitch";
import { useRef } from "react";
import { useUpdateBannerMutation } from "../features/api/apiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function PromotionEditCard({ setOpen, open, banner }) {
  const [formData, setFormData] = useState({
    name: banner?.name,
    isActive: banner?.isActive,
    image: banner?.image?.url,
  });
  const navigate = useNavigate();

  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleEditClick = () => {
    fileRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImg(file);
    setPreview(URL.createObjectURL(file));
  };

  const [
    updateBanner,
    { isLoading: updateBannerLoading, error: updateBannerError },
  ] = useUpdateBannerMutation();

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("bannerId", banner._id); // ✅ include in FormData
      data.append("name", formData.name);
      data.append("isActive", formData.isActive.toString());

      if (img) {
        data.append("image", img);
      }

      const res = await updateBanner(data).unwrap(); // ✅ send FormData directly
      toast.success("Banner updated successfully!");
      setOpen(false)
    } catch (error) {
      toast.error(error?.data?.msg || error?.data?.message || error?.error || "Update failed");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-sm w-1/2">
            <div className="flex justify-between p-2">
              <h2 className="text-gray-700 font-semibold mb-4">
                Promotion/Banner :
              </h2>
              <div className="flex gap-2">
                <button
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition cursor-pointer"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center mb-4 h-40 cursor-pointer">
              <label
                htmlFor="imageUpload"
                className="w-full h-full flex flex-col justify-center items-center cursor-pointer"
              >
                {preview ? (
                  <img
                    src={preview}
                    className="h-32 w-32 object-cover"
                    alt="preview"
                  />
                ) : (
                  <img
                    src={formData.image}
                    className="h-32 w-32 object-cover"
                    alt="banner"
                  />
                )}
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Promotion/Banner Name :
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  name="name"
                  value={formData.name}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onChange={handleInputChange}
                />
              </div>

            </div>
            
              <IsActiveSwitch
                isActive={formData.isActive}
                setFormData={setFormData}
              />
          </div>
        </div>
      )}
    </>
  );
}

export default PromotionEditCard;

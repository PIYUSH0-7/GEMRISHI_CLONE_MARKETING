import React, { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useGetSubCategoryQuery, useUpdateOfferMutation } from "../features/api/apiSlice";
import { toast } from "react-toastify";

const OfferEditModal = ({ offer, onClose }) => {
  const [offerData, setOfferData] = useState(offer);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferData({
      ...offerData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const {
    data: subcategories,
    isLoading: subcategoriesLoading,
    error: subcategoriesError,
  } = useGetSubCategoryQuery();

  const [updateOffer] = useUpdateOfferMutation();

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    try {
      await updateOffer({offerId: offer._id, data: offerData}).unwrap();

      toast.success("Offer Updated Successfully")
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.msg || error?.error || "Something went wrong")
    }
  }


  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8">
      <div className="bg-white p-6 rounded-xl w-full h-[90%] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4 text-emerald-700">
          Edit Offer
        </h3>

        <form
          onSubmit={handleUpdateOffer}
          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-8 w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Offer Name
              </label>
              <input
                name="name"
                value={offerData.name}
                onChange={handleChange}
                placeholder="Enter offer name"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {/* {errors.name ? (
                <span className="text-sm text-red-800">{errors.name}</span>
              ) : (
                ""
              )} */}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Description
              </label>
              <Textarea
                name="description"
                value={offerData.description}
                onChange={handleChange}
                placeholder="Enter offer description"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                name="isActive"
                checked={offerData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label className="text-sm font-medium text-slate-700 cursor-pointer">
                Active Offer
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={
                  offerData.expiryDate ? offerData.expiryDate.split("T")[0] : ""
                }
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Offer Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Offer Type
              </label>
              <select
                name="offerType"
                value={offerData.offerType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Offer Type</option>
                {/* <option value="unioffer">Uni Offer</option> */}
                <option value="promocode">Promo Code</option>
              </select>
            </div>

            {offerData.offerType === "promocode" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Promo Code
                </label>
                <input
                  name="promoCode"
                  value={offerData.promoCode}
                  onChange={handleChange}
                  placeholder="Enter promo code"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Product Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Product Type
              </label>
              <select
                name="productType"
                value={offerData.productType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Product Type</option>
                <option value="Product">Product</option>
                <option value="Jewelry">Jewelry</option>
              </select>
            </div>

            {/* Subcategory Section */}
            {offerData.productType === "Product" && (
              <>
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    name="isSubCategory"
                    checked={offerData.isSubCategory}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label className="text-sm font-medium text-slate-700 cursor-pointer">
                    Is Subcategory Offer
                  </label>
                </div>

                {offerData.isSubCategory && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      SubCategory Name
                    </label>
                    <select
                      name="subCategoryTypeId"
                      value={offerData.subCategoryTypeId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories?.subcategories?.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Jewelry Section */}
            {offerData.productType === "Jewelry" && (
              <>
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    name="isJewelryType"
                    checked={offerData.isJewelryType}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label className="text-sm font-medium text-slate-700 cursor-pointer">
                    Is Jewelry Type Offer
                  </label>
                </div>

                {offerData.isJewelryType && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Jewelry Type
                    </label>
                    <select
                      name="jewelryType"
                      value={offerData.jewelryType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Type</option>
                      <option value="Ring">Ring</option>
                      <option value="Pendant">Pendant</option>
                      <option value="Bracelet">Bracelet</option>
                      <option value="Brooch">Brooch</option>
                      <option value="Necklace">Necklace</option>
                      <option value="Earrings">Earrings</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    name="isJewelryMetal"
                    checked={offerData.isJewelryMetal}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label className="text-sm font-medium text-slate-700 cursor-pointer">
                    Is Jewelry Metal Offer
                  </label>
                </div>

                {offerData.isJewelryMetal && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Jewelry Metal
                    </label>
                    <select
                      name="jewelryMetal"
                      value={offerData.jewelryMetal}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Metal</option>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="platinum">Platinum</option>
                      <option value="panchdhatu">Panchdhatu</option>
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Discount Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Discount Type
              </label>
              <select
                name="discountType"
                value={offerData.discountType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Discount Type</option>
                <option value="percent">Percent</option>
                <option value="flat">Flat</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Discount Value
              </label>
              <input
                type="number"
                name="discountValue"
                min={0}
                value={offerData.discountValue}
                onChange={handleChange}
                placeholder="Enter discount value"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {/* {errors.discountValue ? (
                <span className="text-sm text-red-800">
                  {errors.discountValue}
                </span>
              ) : (
                ""
              )} */}
            </div>

            {/* Item Amount Section */}
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                name="itemAmount"
                checked={offerData.itemAmount}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label className="text-sm font-medium text-slate-700 cursor-pointer">
                Set Item Amount Limit
              </label>
            </div>

            {offerData.itemAmount && (
              <>
                <input
                  type="number"
                  name="minItemAmount"
                  value={offerData.minItemAmount}
                  onChange={handleChange}
                  placeholder="Min Item Amount"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  name="maxItemAmount"
                  value={offerData.maxItemAmount}
                  onChange={handleChange}
                  placeholder="Max Item Amount"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </>
            )}

            {/* Total Amount Section */}
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                name="totalAmount"
                checked={offerData.totalAmount}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label className="text-sm font-medium text-slate-700 cursor-pointer">
                Set Total Amount Limit
              </label>
            </div>

            {offerData.totalAmount && (
              <>
                <input
                  type="number"
                  name="minTotalAmount"
                  value={offerData.minTotalAmount}
                  onChange={handleChange}
                  placeholder="Min Total Amount"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  name="maxTotalAmount"
                  value={offerData.maxTotalAmount}
                  onChange={handleChange}
                  placeholder="Max Total Amount"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </>
            )}
          </div>

          <div className="flex justify-end mt-8 pt-6 border-t border-slate-200 gap-4">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              Save Offer
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferEditModal;

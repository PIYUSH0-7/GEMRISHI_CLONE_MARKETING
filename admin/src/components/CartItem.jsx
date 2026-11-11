import React from "react";
import { Link } from "react-router-dom";
import { useRemoveItemFromCartMutation } from "../features/api/apiSlice";
import {toast} from "react-toastify"
import deleteIcon from "../assets/DeleteIcon.svg"

const CartItem = ({ item }) => {

  const [removeItemFromCart] = useRemoveItemFromCartMutation();

    const handleRemove = async (itemId) => {
        try {
          await removeItemFromCart(itemId).unwrap();
          
        } catch (error) {
          toast.error(error?.data?.message || error?.data?.msg || error?.error || "Something went wrong")
        }
    }
  return (
    <div
      key={item?.item?._id}
      className="flex flex-col md:flex-row items-center justify-between border-b p-4"
    >
      {/* Left: Product Info */}
      <div className="flex items-start gap-4">
        <img
          src={item?.item?.images[0]?.url}
          alt={item?.item?.name}
          className="w-28 h-24 object-cover rounded-lg"
        />

        <div>
          <h3 className="font-semibold text-lg text-gray-800">
            {item?.item?.name}
          </h3>
          <p className="text-sm">
            Certificate: {item?.customization?.certificate?.certificateType}
          </p>
          <p className="text-sm">Price: {item?.customization?.certificate?.price}</p>
        </div>
      </div>

      {/* Right: Price + Delete */}
      <div className="flex flex-col items-end mt-4 md:mt-0">
        <button
          onClick={() => handleRemove(item?.item?._id)}
          className="text-red-500 hover:text-red-600 mb-2"
        >
          <img src={deleteIcon} alt="dlt-btn" />
        </button>
        <p className="font-semibold text-gray-800 text-md">
          ₹ {item?.item?.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default CartItem;

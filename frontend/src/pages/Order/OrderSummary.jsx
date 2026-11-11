"use client";
import React, { useState, useEffect } from "react";
import BlueSapphire from "../../assets/Stone/BlueSapphire.svg";
import axios from "axios";

function OrderSummary() {
    const [cartData, setCartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const URL = import.meta.env.VITE_URL;

    const fetchCartItems = async () => {
        const userInfoString = localStorage.getItem("userInfo");
        let userToken = null;

        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                userToken = userInfo.token;
            } catch (e) {
                console.error("Failed to parse userInfo from localStorage", e);
            }
        }

        if (!userToken) {
            setLoading(false);
            setError("You must be logged in to view your order summary.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `${URL}/cart/get_all_cart_list?page=1&limit=10`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            if (response.data?.success && response.data?.cart) {
                setCartData(response.data.cart);
            } else {
                setCartData([]);
            }
        } catch (err) {
            console.error("Error fetching cart items:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to load order summary. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const formatPrice = (price) => {
        return `₹ ${price?.toLocaleString("en-IN") || "0"}`;
    };

    // --- CHANGE 1: Calculate total based on item.totalPrice ---
    const calculateTotal = () => {
        return cartData.reduce(
            // Use totalPrice which includes all customizations/quantity for the item
            (total, item) => total + (item.totalPrice || 0),
            0
        );
    };

    if (loading) {
        return (
            <div className="w-full lg:w-[23%] h-auto border-t lg:border-t-0 p-4 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264A3F]"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full lg:w-[23%] h-auto border-t lg:border-t-0 p-4">
                <p className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full lg:w-[23%] h-auto border-t lg:border-t-0">
            <div className="w-full h-[72px] md:h-[90px] border-b-[1px] border-[#D2CFCF] flex items-end">
                <p className="text-[18px] md:text-[20px]  pl-4 md:pl-5 pb-4 md:pb-5">
                    Order Summary ({cartData.length}{" "}
                    {cartData.length === 1 ? "Item" : "Items"})
                </p>
            </div>
            <div className="w-full py-4 flex flex-col items-end justify-end">
                {/* Item List with Increased Scroll Height */}
                <div className="w-full h-auto overflow-y-auto px-4 md:px-5">
                    {cartData.map((cartItem) => {
                        // Get the item price (used for unit display or if totalPrice isn't reliable, though we prefer totalPrice)
                        // Get Certificate Type
                        const certificateType = cartItem.customization?.certificate?.certificateType;
                        const jewelryObj = cartItem.customization?.jewelryId;
                        const hasJewelry = !!jewelryObj;
                        const gemstoneImg = typeof cartItem.item?.images?.[0] === "string"
                          ? cartItem.item.images[0]
                          : (cartItem.item?.images?.[0]?.url || "");
                        const jewelryImg = typeof jewelryObj?.images?.[0] === "string"
                          ? jewelryObj.images[0]
                          : (jewelryObj?.images?.[0]?.url || "");
                        const showBoth = hasJewelry && !!jewelryImg;

                        return (
													<div
														key={cartItem.item?._id || cartItem._id}
														className="w-full flex flex-row mb-4">
														{showBoth ? (
															<div className="w-[34%] md:w-[32%] flex items-center justify-end gap-1 flex-shrink-0">
																<div className="w-[40px] h-[40px] md:w-[46px] md:h-[46px] border border-[#D2CFCF] rounded overflow-hidden flex items-center justify-center p-0.5 bg-gray-50 flex-shrink-0">
																	<img
																		src={gemstoneImg}
																		alt={cartItem.item?.name || "Gemstone"}
																		className="w-full h-full object-contain mix-blend-multiply"
																	/>
																</div>
																<span className="text-[10px] text-gray-400 font-bold select-none">+</span>
																<div className="w-[40px] h-[40px] md:w-[46px] md:h-[46px] border border-[#D2CFCF] rounded overflow-hidden flex items-center justify-center p-0.5 bg-gray-50 flex-shrink-0">
																	<img
																		src={jewelryImg}
																		alt={jewelryObj?.jewelryName || "Jewelry"}
																		className="w-full h-full object-contain mix-blend-multiply"
																	/>
																</div>
															</div>
														) : (
															<div className="w-[25%] md:w-[27%] flex justify-end flex-shrink-0">
																<div className="w-[60px] h-[54px] md:w-[67.66px] md:h-[60px] border border-[#D2CFCF] overflow-hidden">
																	<img
																		src={
																			gemstoneImg || cartItem.item?.images?.[0]?.url
																		}
																		alt={cartItem.item?.name || cartItem.item?.jewelryName || "Product Image"}
																		width={68}
																		height={60}
																		className="w-full h-full object-cover"
																	/>
																</div>
															</div>
														)}
														<div className={`${showBoth ? "w-[66%] md:w-[68%]" : "w-[75%] md:w-[73%]"} flex flex-col gap-[2px] pl-3 md:pl-4`}>
															<p className="text-[12px] leading-[14px] font-medium text-gray-900">
																{hasJewelry && jewelryObj?.jewelryName && cartItem.item?.name
																	? `${cartItem.item.name} + ${jewelryObj.jewelryName}`
																	: (cartItem.item?.name ||
																		cartItem.item?.jewelryName)}
															</p>
															<p className="text-[12px] ">
																Item ID:{" "}
																<span className="text-[#7D7C7C] font-mono">
																	{cartItem.item?._id?.slice(-6)}
																</span>
															</p>
															{hasJewelry && jewelryObj?.jewelryName && (
																<p className="text-[11px] text-[#7D7C7C]">
																	Jewelry: {jewelryObj.jewelryName}
																</p>
															)}

															{/* Weight */}
															{(() => {
																const jItem = cartItem.itemType === "Jewelry" ? cartItem.item : (hasJewelry ? jewelryObj : null);
																const w = jItem?.jewelryMetalWeight;
																const weight = typeof w === "object" ? w?.weight : w;
																return weight ? (
																	<p className="text-[11px] text-[#7D7C7C]">
																		Weight: {weight} g
																	</p>
																) : null;
															})()}

															{/* Metal */}
															{(() => {
																const karat = cartItem.customization?.goldKarat?.karatType;
																if (karat) {
																	const k = String(karat).toLowerCase();
																	const label = k === "gold24k" ? "24K Gold" : k === "gold22k" ? "22K Gold" : k === "gold18k" ? "18K Gold" : karat;
																	return <p className="text-[11px] text-[#7D7C7C]">Metal: {label}</p>;
																}
																const m = cartItem.customization?.metal || (cartItem.itemType === "Jewelry" ? cartItem.item?.metal : jewelryObj?.metal);
																if (m) {
																	return <p className="text-[11px] text-[#7D7C7C] capitalize">Metal: {m}</p>;
																}
																return null;
															})()}

															{/* Size */}
															{(() => {
																const sizeNum = cartItem.customization?.sizeSystem?.sizeNumber || cartItem.customization?.size?.size || cartItem.customization?.size?.sizeNumber;
																const isRing = String(cartItem.item?.jewelryType || jewelryObj?.jewelryType || cartItem.item?.jewelryName || jewelryObj?.jewelryName || "").toLowerCase().includes("ring") || String(cartItem.item?.jewelryName || jewelryObj?.jewelryName || "").toLowerCase().includes("signet");
																if (sizeNum && sizeNum !== "NA") {
																	const display = String(sizeNum).toLowerCase().includes("ring sizer") ? "Send me a ring sizer" : sizeNum;
																	return (
																		<p className="text-[11px] text-[#7D7C7C]">
																			{isRing ? "Ring Size" : "Size"}: {display}
																		</p>
																	);
																}
																if (isRing && (cartItem.itemType === "Jewelry" || hasJewelry)) {
																	return (
																		<p className="text-[11px] text-[#7D7C7C]">
																			Ring Size: Send me a ring sizer
																		</p>
																	);
																}
																return null;
															})()}

															<p className="text-[12px] ">
																Qty :{" "}
																<span className="text-[#7D7C7C]">
																	{cartItem.quantity}
																</span>
															</p>

															{/* --- CHANGE 2: Display totalPrice for the line item --- */}
															<p className="text-[12px] font-semibold text-[#656363]">
																Price: {formatPrice(cartItem.totalPrice)}
															</p>
															{/* --- ADD: Display Certificate Type if available --- */}
															{certificateType && (
																<p className="text-[12px] text-[#264A3F] font-medium">
																	Certificate: {certificateType}
																</p>
															)}
														</div>
													</div>
												);
                    })}
                </div>
                {/* Total Price Section */}
                <div className="w-full mt-2 px-4 md:px-5">
                    <p className="text-[14px]  font-bold flex justify-between md:justify-around">
                        <span>Total :</span>
                        <span className="text-[16px] font-bold  text-[#656363]">
                            {/* Use the new calculateTotal function */}
                            {formatPrice(calculateTotal())}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default OrderSummary;
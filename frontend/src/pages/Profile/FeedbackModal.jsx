import React, { useState, useRef } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import file from "../../assets/Profile/file.svg";
import { toast } from "react-toastify"; // Ensure you have ToastContainer set up somewhere in your app

function FeedbackModal({ isOpen, onClose, productId }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);
    const URL = import.meta.env.VITE_URL;

    if (!isOpen) return null;

    const handleFileUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const uploadedFiles = event.target.files;
        if (uploadedFiles && uploadedFiles.length > 0) {
            setSelectedFiles(Array.from(uploadedFiles));
        }
    };

    const handleSubmit = async () => {
        // 1. Rating Check
        if (rating === 0) {
            toast.error("Please give a rating!", { position: "top-center" }); // ⬅️ UPDATED POSITION
            return;
        }

        // 2. Auth Check
        const userInfoString = localStorage.getItem("userInfo");
        if (!userInfoString) {
            toast.error("Please login to submit review.", { position: "top-center" }); // ⬅️ UPDATED POSITION
            return;
        }

        let userToken = null;
        try {
            const userInfo = JSON.parse(userInfoString);
            userToken = userInfo.token;
        } catch (err) {
            console.error("Error parsing userInfo:", err);
            // Even if token parsing fails, continue to API call, which will likely fail with 401
        }

        const formData = new FormData();
        formData.append("rating", rating);
        formData.append("review", review);
        formData.append("productId", productId);

        selectedFiles.forEach((file) => {
            formData.append("image", file); // Assuming backend expects 'image' for multiple files
        });

        try {
            setLoading(true);
            const response = await axios.post(
                `${URL}/reviewRating/add_review_rating`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // Success Toast
            toast.success("Review submitted successfully!", { position: "top-center" }); // ⬅️ UPDATED POSITION
            onClose(); // modal band kar do
            setRating(0);
            setReview("");
            setSelectedFiles([]);
        } catch (err) {
            console.error("Error submitting review:", err);
            // Error Toast
            toast.error(err?.response?.data?.message || err?.data?.msg || err?.error || "Failed to submit review. Try again.", { position: "top-center" }); // ⬅️ UPDATED POSITION
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
            <div className="bg-white rounded-[20px] w-[499px] h-[495px] p-6 shadow-lg">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[26px]  text-[#264A3F] font-bold">
                        We'd Love Your Feedback
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition-colors">
                        <svg
                            className="w-[30px] h-[30px]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Rating Stars */}
                <div className="flex justify-center my-4">
                    {[...Array(5)].map((star, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                    className="hidden"
                                />
                                <FaStar
                                    className="cursor-pointer"
                                    size={50}
                                    color={
                                        ratingValue <= (hover || rating) ? "#FFC423" : "#D9D9D9"
                                    }
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>

                {/* Feedback Text Area */}
                <textarea
                    className="w-full h-[100px] p-4 text-sm sm:text-base border border-[#C6C6C6] rounded-[10px] resize-none focus:outline-none focus:border-[#264A3F] mb-4 "
                    placeholder="Tell us how the gemstone felt!"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}></textarea>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                />

                {/* Custom Upload */}
                <div
                    className="flex flex-col justify-center items-center mb-2 cursor-pointer"
                    onClick={handleFileUploadClick}>
                    <div className="w-[60px] h-[61px] bg-[#264A3F] rounded-[5px] flex justify-center items-center">
                        <img src={file} alt="" />
                    </div>
                    <p>
                        {selectedFiles.length > 0
                            ? `${selectedFiles.length} file(s) selected`
                            : "Upload a file"}
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-[#264A3F] text-white  rounded-[10px] text-[20px] font-bold hover:bg-[#1f3a32] transition-colors cursor-pointer">
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </div>
        </div>
    );
}

export default FeedbackModal;
// components/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ size = 10, color = "blue-500" }) => {
  return (
    <div className="flex justify-center items-center py-10">
      <div
        className={`animate-spin rounded-full h-${size} w-${size} border-t-4 border-b-4 border-${color}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;

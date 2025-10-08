import React from "react";

const Spinner = ({ size = 6, color = "border-blue-500" }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`w-${size} h-${size} border-4 border-gray-200 border-t-4 ${color} rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Spinner;

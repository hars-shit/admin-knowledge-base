import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const HomeHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-10 p-4 rounded-xl shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img
          src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/8gxGtPEVqtv0pHte3WSh/media/68da47adf00445478b6d27e4.png"
          alt="Company Logo"
          className="w-44 h-12 object-contain"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-2">
        <Button
          onClick={() => navigate("/posts")}
          className={`px-4 py-5 md:w-40 rounded-lg transition ${
            location.pathname === "/posts"
              ? "bg-[#ff6f3c] text-white"
              : "bg-[#1A2C40] border border-#1A2C40 text-white hover:bg-[#1A2C40] hover:text-white"
          }`}
        >
          All Posts
        </Button>

        <Button
          onClick={() => navigate("/posts/create")}
          className={`px-4 py-5 md:w-40 rounded-lg transition ${
            location.pathname === "/posts/create"
              ? "bg-[#ff6f3c] text-white"
              : "bg-[#1A2C40] border border-#1A2C40 text-white hover:bg-[#1A2C40] hover:text-white"
          }`}
        >
          Add Post
        </Button>
      </div>
    </div>
  );
};

export default HomeHeader;

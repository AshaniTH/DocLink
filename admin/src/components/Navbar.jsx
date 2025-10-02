import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);

  const navigate = useNavigate();

  const logout = () => {
    if (aToken) {
      setAToken("");
      localStorage.removeItem("aToken");
    } else if (dToken) {
      setDToken("");
      localStorage.removeItem("dToken");
    }
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center p-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-1 cursor-pointer"
        >
          <img className="w-15 h-15" src={logo} alt="DocLink Logo" />
          <span className="text-primary font-bold text-xl">DocLink</span>
        </div>
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? "Admin" : "Doctor"}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
      >
        Log out
      </button>
    </div>
  );
};

export default Navbar;

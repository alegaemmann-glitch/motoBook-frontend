import React from "react";
import "../../styles/landing/Header.css";
import { useNavigate } from "react-router-dom";

const SellerHeader = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // optional logic before redirect
    navigate("/seller/login");
  };

  return (
    <header className="header">
      <div className="logo">MotoBook</div>
      <nav className="navbar">
        <div className="auth-buttons">
          <button className="login-btn" onClick={handleLoginClick}>
            Login
          </button>
        </div>
      </nav>
    </header>
  );
};

export default SellerHeader;

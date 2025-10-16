// SellerSidebar.jsx
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/seller/SellerSidebar.css";

const SellerSidebar = () => {
  const { user } = useContext(AuthContext);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const navigate = useNavigate();

  if (!user || user.role !== "Seller") return null;

  const handleBusinessClick = () => {
    setIsRestaurantOpen(!isRestaurantOpen);
    navigate("/seller/business");
  };

  return (
    <aside className="sidebar">
      <Link to="/business" className="sidebar-link">
        Dashboard
      </Link>

      <div className="sidebar-section">
        <button onClick={handleBusinessClick} className="sidebar-button">
          <span className="sidebar-sublink">My Business</span>
          <span>{isRestaurantOpen ? "▾" : "▸"}</span>
        </button>
        {isRestaurantOpen && (
          <div className="sidebar-submenu">
            <Link to="menus" className="sidebar-sublink">
              Manage Menus
            </Link>
          </div>
        )}
      </div>

      <Link to="/seller/orders" className="sidebar-link">
        Orders
      </Link>
    </aside>
  );
};

export default SellerSidebar;

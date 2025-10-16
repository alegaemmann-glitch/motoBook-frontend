import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Header from "../../components/landing/Header";
import SellerSidebar from "../../components/seller/SellerSidebar";
import { Outlet } from "react-router-dom";
import "../../styles/seller/SellerDashboard.css";

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== "Seller") {
    return <div>Unauthorized</div>;
  }

  return (
    <>
      <Header />
      <div className="seller-dashboard">
        <SellerSidebar />
        <main className="seller-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default SellerDashboard;

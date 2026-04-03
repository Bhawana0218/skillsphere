import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AccountStatusBanner from "../features/user/AccountStatusBanner";

function MainLayout({ children }: any) {
  
   const [showBanner, setShowBanner] = useState(false);

   useEffect(() => {
    const dismissed = localStorage.getItem("hideAccountBanner");

    if (!dismissed) {
      setShowBanner(true);
    }
  }, []);

  return (
   <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />

      {/* Floating Banner */}
      <div className="mt-28">
      {showBanner && (
        <AccountStatusBanner onClose={() => {
          localStorage.setItem("hideAccountBanner", "true");
          setShowBanner(false);
        }} />
      )}
      </div>

      <div>{children}</div>
    </div>
  );
}

export default MainLayout;
import Navbar from "../components/Navbar";
import AccountStatusBanner from "../components/AccountStatusBanner";

function MainLayout({ children }: any) {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      <div className="p-4">
        <AccountStatusBanner />
        {children}
      </div>
    </div>
  );
}

export default MainLayout;
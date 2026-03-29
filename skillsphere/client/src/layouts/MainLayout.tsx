import Navbar from "../components/Navbar";

function MainLayout({ children }: any) {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      <div className="p-4">{children}</div>
    </div>
  );
}

export default MainLayout;
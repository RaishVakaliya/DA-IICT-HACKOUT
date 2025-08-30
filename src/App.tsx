import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketplacePage from "./pages/MarketplacePage";
import CertificationPage from "./pages/CertificationPage";
import AboutPage from "./pages/AboutPage";
import RetirePage from "./pages/RetirePage";
import WalletPage from "./pages/WalletPage";
import WithdrawPage from "./pages/WithdrawPage";
import AdminPage from "./pages/AdminPage";
import CertifierPage from "./pages/CertifierPage"; // Import the new page
import Footer from "./components/Footer";
import Registry from "./pages/Registry";
import PurchasePage from "./pages/PurchasePage";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-600 flex flex-col">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} /> {/* New route for public profiles */}
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/certification" element={<CertificationPage />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/retire" element={<RetirePage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/certifier" element={<CertifierRoute><CertifierPage /></CertifierRoute>} />
            <Route path="/purchase/:listingId" element={<PurchasePage />} /> {/* New route for purchase page */}

            {/* Catch all other routes and redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = useQuery(api.users.isAdminUser);
  if (isAdmin === undefined) return <div>Loading...</div>;
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const CertifierRoute = ({ children }: { children: React.ReactNode }) => {
  const isCertifierOrAdmin = useQuery(api.users.isCertifierOrAdmin);
  if (isCertifierOrAdmin === undefined) return <div>Loading...</div>;
  return isCertifierOrAdmin ? <>{children}</> : <Navigate to="/" />;
};

export default App;

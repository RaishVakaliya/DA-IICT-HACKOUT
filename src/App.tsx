import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketplacePage from "./pages/MarketplacePage";
import CertificationPage from "./pages/CertificationPage";
import AboutPage from "./pages/AboutPage";
import PurchasePage from "./pages/PurchasePage";
import RetirePage from "./pages/RetirePage";
import WithdrawPage from "./pages/WithdrawPage";
import AdminPage from "./pages/AdminPage";
import Footer from "./components/Footer";
import Registry from "./pages/Registry";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-600 flex flex-col">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/certification" element={<CertificationPage />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/purchase" element={<PurchasePage />} />
              <Route path="/retire" element={<RetirePage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
              <Route path="/admin" element={<AdminPage />} />

            {/* Catch all other routes and redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/Navbar";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import MarketplacePage from "./components/MarketplacePage";
import CertificationPage from "./components/CertificationPage";
import AboutPage from "./components/AboutPage";
import Footer from "./components/Footer";

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
              <Route path="/about" element={<AboutPage />} />

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

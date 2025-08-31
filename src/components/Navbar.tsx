import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

// Custom RotateLoader component
const RotateLoader = ({ color = "#059669", size = 8, speedMultiplier = 1 }) => (
  <div className="animate-spin">
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="31.416"
        className="animate-ping"
        style={{
          animationDuration: `${1 / speedMultiplier}s`,
        }}
      />
    </svg>
  </div>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoading, isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const balance = useQuery(api.hydcoin.getBalance);
  const isAdmin = useQuery(
    api.users.isAdminUser,
    isLoading || !isAuthenticated ? "skip" : undefined
  );
  const isCertifierOrAdmin = useQuery(
    api.users.isCertifierOrAdmin,
    isLoading || !isAuthenticated ? "skip" : undefined
  );
  const location = useLocation();

  const navItems = [
    { name: "Registry", path: "/registry" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Certification", path: "/certification" },
    { name: "Wallet", path: "/wallet" },
    { name: "About", path: "/about" },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 left-0 z-20 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 hover:scale-105 transition-all duration-300 transform"
          >
            <img
              src="/logo.jpg"
              alt="HyDit Logo"
              className="w-10 h-10 rounded-lg object-cover shadow-md"
            />
            <span className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-300">
              HyDit
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-1 bg-gray-50 rounded-xl p-1 shadow-inner">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActivePath(item.path)
                      ? "bg-white text-emerald-600 shadow-md border border-emerald-100"
                      : "text-gray-600 hover:text-emerald-600 hover:bg-white/80"
                  }`}
                >
                  {item.name}
                  {isActivePath(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                  )}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActivePath("/admin")
                      ? "bg-white text-red-600 shadow-md border border-red-100"
                      : "text-gray-600 hover:text-red-600 hover:bg-white/80"
                  }`}
                >
                  Admin
                  {isActivePath("/admin") && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full"></div>
                  )}
                </Link>
              )}
              {isCertifierOrAdmin && (
                <Link
                  to="/certifier"
                  className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActivePath("/certifier")
                      ? "bg-white text-blue-600 shadow-md border border-blue-100"
                      : "text-gray-600 hover:text-blue-600 hover:bg-white/80"
                  }`}
                >
                  Certifier Dashboard
                  {isActivePath("/certifier") && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Right Side - Auth & Profile */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              {isLoading ? (
                // Loading state with RotateLoader
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <RotateLoader color="#059669" size={10} speedMultiplier={1} />
                  <span className="text-gray-600 text-sm font-medium">
                    Loading profile...
                  </span>
                </div>
              ) : currentUser ? (
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md active:scale-95 group"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-700 transition-colors duration-300 shadow-md group-hover:shadow-lg">
                    {currentUser.image ? (
                      <img
                        src={currentUser.image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-white font-bold">
                        {currentUser.fullname?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-gray-900 font-medium group-hover:text-emerald-600 transition-colors duration-300">
                      {currentUser.fullname || currentUser.username || "User"}
                    </span>
                    <span className="text-xs text-emerald-600 font-bold">
                      {balance !== null ? `${balance} Hydcoin` : "..."}
                    </span>
                  </div>
                  {/* Hover arrow indicator */}
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ) : (
                // Fallback when user is authenticated but no user data
                <div className="flex items-center space-x-3 px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <RotateLoader color="#d97706" size={8} speedMultiplier={1} />
                  <span className="text-yellow-700 text-sm font-medium">
                    Setting up profile...
                  </span>
                </div>
              )}
            </SignedIn>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12" // X icon
                      : "M4 6h16M4 12h16M4 18h16" // Hamburger
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          {/* Mobile Logo Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3"
            >
              <img
                src="/logo.jpg"
                alt="HyDit Logo"
                className="w-8 h-8 rounded-lg object-cover shadow-md"
              />
              <span className="text-xl font-bold text-emerald-600">HyDit</span>
            </Link>
          </div>

          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isActivePath(item.path)
                    ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600"
                    : "text-gray-900 hover:bg-gray-50 hover:text-emerald-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isCertifierOrAdmin && (
              <Link
                to="/certifier"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isActivePath("/certifier")
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-900 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                Certifier Dashboard
              </Link>
            )}

            {/* Mobile Profile Link */}
            <SignedIn>
              {isLoading ? (
                <div className="flex items-center space-x-3 px-4 py-3">
                  <RotateLoader
                    color="#059669"
                    size={6}
                    speedMultiplier={0.8}
                  />
                  <span className="text-gray-500 text-sm">Loading...</span>
                </div>
              ) : currentUser ? (
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-emerald-600 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Profile
                </Link>
              ) : null}
            </SignedIn>

            {/* Mobile Sign In */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

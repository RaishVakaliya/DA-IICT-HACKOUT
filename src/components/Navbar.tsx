import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading } = useUser();
  const location = useLocation();

  const navItems = [
    { name: "Registry", path: "/registry" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Certification", path: "/certification" },
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
            className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            HyDit
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
                  {/* Active indicator */}
                  {isActivePath(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                  )}
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Auth & Profile */}
          <div className="flex items-center space-x-4">
            {/* Show Sign In when user is not logged in */}
            <Unauthenticated>
              <SignInButton mode="modal">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </Unauthenticated>

            {/* Show User Profile when logged in */}
            <Authenticated>
              {!isLoading && user && (
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md active:scale-95 group"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-700 transition-colors duration-300 shadow-md group-hover:shadow-lg">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-white font-bold">
                        {user.fullname?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-900 font-medium group-hover:text-emerald-600 transition-colors duration-300">
                    {user.fullname || user.username || "User"}
                  </span>
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
              )}
            </Authenticated>
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

            {/* Mobile Profile Link */}
            <Authenticated>
              {!isLoading && user && (
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-emerald-600 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Profile
                </Link>
              )}
            </Authenticated>

            {/* Mobile Sign In */}
            <Unauthenticated>
              <SignInButton mode="modal">
                <button className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

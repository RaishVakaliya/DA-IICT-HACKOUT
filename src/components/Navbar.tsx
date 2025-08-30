import { useState } from "react";
import { Link } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useUser } from "../context/UserContext";
import { useAuth } from "@clerk/clerk-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading } = useUser();
  const { isSignedIn } = useAuth();

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-emerald-600">
            HyDit
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className="text-gray-900 hover:text-emerald-600 px-3 py-2 font-medium"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className="text-gray-500 hover:text-emerald-600 px-3 py-2 font-medium"
            >
              Marketplace
            </Link>
            <Link
              to="/certification"
              className="text-gray-500 hover:text-emerald-600 px-3 py-2 font-medium"
            >
              Certification
            </Link>
            <Link
              to="/about"
              className="text-gray-500 hover:text-emerald-600 px-3 py-2 font-medium"
            >
              About
            </Link>
            
            {/* Show Sign In when user is not logged in */}
            <Unauthenticated>
              <SignInButton mode="modal">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </Unauthenticated>

            {/* Show User Profile when logged in */}
            <Authenticated>
              {!isLoading && user && (
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
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
                  <span className="text-gray-900 font-medium">
                    {user.fullname || user.username || "User"}
                  </span>
                </Link>
              )}
            </Authenticated>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50"
            >
              Marketplace
            </Link>
            <Link
              to="/certification"
              className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50"
            >
              Certification
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50"
            >
              About
            </Link>
            
            {/* Mobile Profile Link */}
            <Authenticated>
              {!isLoading && user && (
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                >
                  Profile
                </Link>
              )}
            </Authenticated>
            
            {/* Mobile Sign In */}
            <Unauthenticated>
              <SignInButton mode="modal">
                <button className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium">
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

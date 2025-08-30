import { useState } from "react";
import { Link } from "react-router-dom";
import { SignInButton, SignUp } from "@clerk/clerk-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

            {/* Clerk Sign In */}
            <SignInButton mode="modal">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
            {/* ✅ Sign Up Modal with Role Dropdown */}
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            formFieldInput: "rounded-lg border p-2",
          },
        }}
        signUpField={[
          {
            name: "role",
            label: "Select your role",
            type: "select",
            options: [
              { value: "customer", label: "Customer" },
              { value: "owner", label: "Owner" },
            ],
          },
        ]}
      />
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
            <SignInButton mode="modal">
              <button className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

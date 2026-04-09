import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-100 shadow-md text-gray-800"
          : "bg-white/90 backdrop-blur-sm shadow-sm text-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex-1">
          <Link to="/" className="text-2xl font-bold text-green-600">
            ReVastra ♻️
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8 font-medium">
          <Link to="/" className="hover:text-green-600 transition">
            Home
          </Link>
          <Link to="/sell" className="hover:text-green-600 transition">
            Sell Device
          </Link>
          <Link to="/dashboard" className="hover:text-green-600 transition">
            Dashboard
          </Link>
        </div>

        {/* Mobile Button */}
        <div className="flex-1 flex justify-end md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div className="hidden md:block flex-1"></div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-white rounded-xl shadow-md p-4 flex flex-col gap-4 font-medium text-gray-700">
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/sell" onClick={() => setIsOpen(false)}>Sell Device</Link>
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
        </div>
      )}
    </nav>
  );
}
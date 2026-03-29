import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, Menu, X, User, LogOut } from "lucide-react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[#d4e0d7] z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-1">
          <span className="text-2xl font-bold text-[#111a14]">CheapPlug</span>
          <span className="bg-[#1a7a4a] text-white text-[10px] px-1 rounded font-mono">.KE</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Tafuta fundi, plumber, mechanic..."
            className="w-full bg-[#f7faf8] border border-[#d4e0d7] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#1a7a4a]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6b7a6e]" />
        </form>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/list-your-business" className="text-sm font-medium text-[#1a7a4a] hover:underline">
            List Your Business
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-sm font-medium">
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <button onClick={() => signOut(auth)} className="text-[#6b7a6e] hover:text-[#111a14]">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/dashboard" className="bg-[#1a7a4a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2ea868] transition">
              Login
            </Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-[#d4e0d7] px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#f7faf8] border border-[#d4e0d7] rounded-lg py-2 pl-10 pr-4 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6b7a6e]" />
          </form>
          <Link to="/list-your-business" className="block text-sm font-medium text-[#1a7a4a]">
            List Your Business
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm font-medium">Dashboard</Link>
              <button onClick={() => signOut(auth)} className="block text-sm font-medium text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/dashboard" className="block bg-[#1a7a4a] text-white px-4 py-2 rounded-lg text-center text-sm font-medium">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

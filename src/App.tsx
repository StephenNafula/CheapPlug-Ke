import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CategoryPage from "./pages/Category";
import ProviderProfile from "./pages/ProviderProfile";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import SearchResults from "./pages/SearchResults";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a7a4a]"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[#f7faf8] text-[#111a14] font-sans">
          <Navbar user={user} />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/provider/:id" element={<ProviderProfile />} />
              <Route path="/list-your-business" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/admin" element={<Admin user={user} />} />
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </main>
          <footer className="bg-[#111a14] text-white py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">CheapPlug<span className="text-[#2ea868]">.ke</span></h3>
                <p className="text-[#6b7a6e] text-sm">Empowering Kenyans with price transparency. Never get overcharged again.</p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-[#6b7a6e]">
                  <li><a href="/" className="hover:text-white transition">Home</a></li>
                  <li><a href="/list-your-business" className="hover:text-white transition">List Your Business</a></li>
                  <li><a href="/search" className="hover:text-white transition">Search Providers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-[#6b7a6e]">
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition">Safety Tips</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {/* Social icons would go here */}
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-[#6b7a6e]">
              © 2025 CheapPlug Kenya. All rights reserved.
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

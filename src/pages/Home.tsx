import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, CheckCircle, Star, ArrowRight } from "lucide-react";
import { CATEGORIES, COUNTIES } from "../constants";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Provider } from "../types";
import ProviderCard from "../components/ProviderCard";
import PriceReportWidget from "../components/PriceReportWidget";
import { motion } from "motion/react";

export default function Home() {
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "providers"), where("certified", "==", true), limit(6));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
        setFeaturedProviders(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "providers");
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${service}&location=${location}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-[#111a14] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/seed/nairobi/1920/1080')] bg-cover bg-center"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-tight"
          >
            Stop Getting Overcharged. <br />
            <span className="text-[#2ea868]">Find Kenya's Cheapest Plugs.</span>
          </motion.h1>
          <p className="text-lg md:text-xl text-[#6b7a6e] max-w-2xl mx-auto">
            Verified prices. Real reviews. Cheapest service providers in your area.
          </p>

          <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-[#d4e0d7]">
              <Search className="h-5 w-5 text-[#6b7a6e] mr-3" />
              <select 
                className="w-full py-3 bg-transparent text-[#111a14] focus:outline-none appearance-none"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">What service do you need?</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center px-4">
              <MapPin className="h-5 w-5 text-[#6b7a6e] mr-3" />
              <input 
                type="text" 
                placeholder="Where are you? (e.g. Westlands)"
                className="w-full py-3 bg-transparent text-[#111a14] focus:outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-[#1a7a4a] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#2ea868] transition">
              Tafuta
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#6b7a6e]">
            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-[#2ea868] mr-2" /> 500+ Verified Providers</div>
            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-[#2ea868] mr-2" /> 12 Service Categories</div>
            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-[#2ea868] mr-2" /> 100% Free for Customers</div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Browse Categories</h2>
          <Link to="/search" className="text-[#1a7a4a] font-medium flex items-center hover:underline">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.slug} 
              to={`/category/${cat.slug}`}
              className="bg-white border border-[#d4e0d7] p-6 rounded-2xl text-center hover:border-[#1a7a4a] hover:shadow-lg transition group"
            >
              <span className="text-4xl mb-4 block group-hover:scale-110 transition">{cat.icon}</span>
              <h3 className="font-bold text-sm">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#f0f4f1] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How CheapPlug Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Search", desc: "Find the service you need in your specific location." },
              { step: "02", title: "Compare Prices", desc: "See verified price ranges and real customer reviews." },
              { step: "03", title: "Contact Directly", desc: "WhatsApp or call the provider directly. No middleman." }
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="text-5xl font-bold text-[#1a7a4a] opacity-20">{item.step}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-[#6b7a6e]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">CheapPlug Certified Plugs</h2>
          <div className="flex items-center text-sm text-[#c8861a] font-medium">
            <Star className="h-4 w-4 fill-current mr-1" /> Top Rated
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredProviders.length > 0 ? (
            featuredProviders.map(p => <ProviderCard key={p.id} provider={p} />)
          ) : (
            <div className="col-span-3 text-center py-12 text-[#6b7a6e]">
              Loading top-rated providers...
            </div>
          )}
        </div>
      </section>

      {/* Community Price Widget */}
      <section className="max-w-4xl mx-auto px-4">
        <PriceReportWidget />
      </section>
    </div>
  );
}

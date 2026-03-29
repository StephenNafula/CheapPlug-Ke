import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Provider, Category } from "../types";
import { CATEGORIES, COUNTIES } from "../constants";
import ProviderCard from "../components/ProviderCard";
import PriceReportWidget from "../components/PriceReportWidget";
import MapView from "../components/MapView";
import { Filter, SlidersHorizontal, Map as MapIcon, Grid } from "lucide-react";
import { cn } from "../lib/utils";

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'map'>('grid');

  // Filters
  const [county, setCounty] = useState(searchParams.get("county") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const category = CATEGORIES.find(c => c.slug === slug);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, "providers"), 
          where("categoryId", "==", slug),
          where("isActive", "==", true)
        );

        if (county) {
          q = query(q, where("county", "==", county));
        }

        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
        
        if (verifiedOnly) {
          data = data.filter(p => p.verified);
        }

        setProviders(data);
      } catch (error) {
        console.error("Error fetching providers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [slug, county, verifiedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-2">
        <div className="text-sm text-[#6b7a6e]">
          <Link to="/" className="hover:text-[#1a7a4a]">Home</Link> / {category?.name}
        </div>
        <h1 className="text-3xl font-bold">Cheapest {category?.name} in Kenya</h1>
        <p className="text-[#6b7a6e]">{category?.description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0 space-y-8">
          <div className="bg-white border border-[#d4e0d7] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center"><Filter className="h-4 w-4 mr-2" /> Filters</h3>
              <button className="text-xs text-[#1a7a4a] font-medium">Reset</button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6b7a6e]">County</label>
              <select 
                className="w-full bg-[#f7faf8] border border-[#d4e0d7] rounded-lg p-2 text-sm focus:outline-none focus:border-[#1a7a4a]"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              >
                <option value="">All Counties</option>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-[#d4e0d7] text-[#1a7a4a] focus:ring-[#1a7a4a]" 
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span className="ml-2 text-sm">Verified Only</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="rounded border-[#d4e0d7] text-[#1a7a4a] focus:ring-[#1a7a4a]" />
                <span className="ml-2 text-sm">Certified Only</span>
              </label>
            </div>
          </div>

          <PriceReportWidget categoryId={slug} county={county} />
        </aside>

        {/* Results */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#6b7a6e]">
              Showing <span className="font-bold text-[#111a14]">{providers.length}</span> results
            </div>
            <div className="flex bg-white border border-[#d4e0d7] rounded-lg overflow-hidden">
              <button 
                onClick={() => setView('grid')}
                className={cn("p-2", view === 'grid' ? "bg-[#1a7a4a] text-white" : "text-[#6b7a6e] hover:bg-gray-50")}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setView('map')}
                className={cn("p-2", view === 'map' ? "bg-[#1a7a4a] text-white" : "text-[#6b7a6e] hover:bg-gray-50")}
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-80 rounded-2xl"></div>
              ))}
            </div>
          ) : view === 'map' ? (
            <MapView providers={providers} />
          ) : providers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-dashed border-[#d4e0d7] rounded-3xl">
              <h3 className="text-xl font-bold mb-2">No plugs found here yet</h3>
              <p className="text-[#6b7a6e]">Try changing your filters or location.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Provider } from "../types";
import ProviderCard from "../components/ProviderCard";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const [results, setResults] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Simple search logic for now (matching category or business name)
        const providersRef = collection(db, "providers");
        const snapshot = await getDocs(providersRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
        
        const filtered = data.filter(p => {
          const matchQuery = p.businessName.toLowerCase().includes(q.toLowerCase()) || 
                             p.categoryId.toLowerCase().includes(q.toLowerCase());
          const matchLocation = location ? p.town.toLowerCase().includes(location.toLowerCase()) || 
                                           p.county.toLowerCase().includes(location.toLowerCase()) : true;
          return matchQuery && matchLocation;
        });

        setResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [q, location]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-[#6b7a6e]">
          Showing results for "{q}" {location && `in ${location}`}
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-80 rounded-2xl"></div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {results.map(p => <ProviderCard key={p.id} provider={p} />)}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-dashed border-[#d4e0d7] rounded-3xl">
          <h3 className="text-xl font-bold mb-2">No plugs found</h3>
          <p className="text-[#6b7a6e]">Try a different search term or location.</p>
        </div>
      )}
    </div>
  );
}

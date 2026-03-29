import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Provider, Lead } from "../types";
import { formatKES } from "../lib/utils";
import { MessageCircle, Phone, Eye, Star, TrendingUp } from "lucide-react";

export default function Dashboard({ user }: { user: any }) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Fetch provider listing
      const qP = query(collection(db, "providers"), where("userId", "==", user.uid));
      const snapP = await getDocs(qP);
      if (!snapP.empty) {
        const pData = { id: snapP.docs[0].id, ...snapP.docs[0].data() } as Provider;
        setProvider(pData);

        // Fetch leads
        const qL = query(collection(db, "leads"), where("providerId", "==", pData.id), orderBy("createdAt", "desc"));
        const snapL = await getDocs(qL);
        setLeads(snapL.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="p-20 text-center">Please login to view dashboard.</div>;
  if (loading) return <div className="p-20 text-center">Loading dashboard...</div>;

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-3xl font-bold">You don't have a listing yet</h2>
        <p className="text-[#6b7a6e]">Start growing your business by listing your services on CheapPlug.</p>
        <a href="/list-your-business" className="inline-block bg-[#1a7a4a] text-white px-8 py-4 rounded-2xl font-bold">
          List Your Business
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <span className={cn(
          "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
          provider.plan === 'business' ? "bg-purple-100 text-purple-700" : 
          provider.plan === 'pro' ? "bg-gold-100 text-gold-700" : "bg-gray-100 text-gray-700"
        )}>
          {provider.plan} Plan
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length, icon: TrendingUp, color: "text-blue-600" },
          { label: "WhatsApp Taps", value: leads.filter(l => l.contactMethod === 'whatsapp').length, icon: MessageCircle, color: "text-green-600" },
          { label: "Calls", value: leads.filter(l => l.contactMethod === 'call').length, icon: Phone, color: "text-orange-600" },
          { label: "Rating", value: provider.ratingAvg, icon: Star, color: "text-yellow-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-[#d4e0d7] p-6 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-[#6b7a6e] font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Leads Table */}
        <div className="lg:col-span-2 bg-white border border-[#d4e0d7] rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-[#d4e0d7] flex items-center justify-between">
            <h3 className="font-bold">Recent Leads</h3>
            <button className="text-sm text-[#1a7a4a] font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7faf8] text-[#6b7a6e] uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">User Phone</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4e0d7]">
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        lead.contactMethod === 'whatsapp' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {lead.contactMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{lead.userPhone || "Anonymous"}</td>
                    <td className="px-6 py-4 text-[#6b7a6e]">{new Date(lead.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-[#6b7a6e]">No leads yet. Keep your profile updated!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#111a14] text-white rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold">Upgrade to Pro</h3>
            <p className="text-sm text-[#6b7a6e]">Get 3x more leads, a verified badge, and appear at the top of search results.</p>
            <button className="w-full bg-[#1a7a4a] text-white py-4 rounded-2xl font-bold hover:bg-[#2ea868] transition">
              Upgrade via M-Pesa
            </button>
          </div>
          <div className="bg-white border border-[#d4e0d7] rounded-3xl p-6 space-y-4">
            <h3 className="font-bold">Listing Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active on CheapPlug</span>
              <div className="w-10 h-5 bg-[#1a7a4a] rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <button className="w-full border border-[#d4e0d7] py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
              Edit Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

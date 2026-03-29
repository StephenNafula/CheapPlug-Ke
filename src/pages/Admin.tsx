import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, getDocs, updateDoc, doc, where } from "firebase/firestore";
import { Provider } from "../types";
import { CheckCircle, XCircle, Star } from "lucide-react";

export default function Admin({ user }: { user: any }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      // In a real app, we'd check a custom claim or a specific user doc
      if (user.email === "stevebranny254@gmail.com") {
        setIsAdmin(true);
        const snapshot = await getDocs(collection(db, "providers"));
        setProviders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider)));
      }
      setLoading(false);
    };
    checkAdmin();
  }, [user]);

  const toggleVerify = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "providers", id), { verified: !current });
    setProviders(providers.map(p => p.id === id ? { ...p, verified: !current } : p));
  };

  const toggleCertify = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "providers", id), { certified: !current });
    setProviders(providers.map(p => p.id === id ? { ...p, certified: !current } : p));
  };

  if (loading) return <div className="p-20 text-center">Checking permissions...</div>;
  if (!isAdmin) return <div className="p-20 text-center">Access Denied. Admin only.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      
      <div className="bg-white border border-[#d4e0d7] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[#d4e0d7]">
          <h3 className="font-bold">Provider Verification Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7faf8] text-[#6b7a6e] uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4e0d7]">
              {providers.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4 font-bold">{p.businessName}</td>
                  <td className="px-6 py-4 uppercase text-xs">{p.categoryId}</td>
                  <td className="px-6 py-4">{p.town}, {p.county}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {p.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {p.certified && <Star className="h-4 w-4 text-yellow-600 fill-current" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleVerify(p.id, p.verified)}
                        className="text-xs font-bold text-[#1a7a4a] hover:underline"
                      >
                        {p.verified ? "Unverify" : "Verify"}
                      </button>
                      <button 
                        onClick={() => toggleCertify(p.id, p.certified)}
                        className="text-xs font-bold text-[#c8861a] hover:underline"
                      >
                        {p.certified ? "Decertify" : "Certify"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

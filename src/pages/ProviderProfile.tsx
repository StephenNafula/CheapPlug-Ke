import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Provider, Review } from "../types";
import { formatKES, cn } from "../lib/utils";
import { Star, MapPin, CheckCircle, MessageCircle, Phone, Share2, AlertTriangle, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export default function ProviderProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) return;
      const docRef = doc(db, "providers", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProvider({ id: docSnap.id, ...docSnap.data() } as Provider);
      }
      setLoading(false);
    };
    fetchProvider();
  }, [id]);

  const trackLead = async (method: 'whatsapp' | 'call') => {
    if (!id) return;
    await addDoc(collection(db, "leads"), {
      providerId: id,
      contactMethod: method,
      createdAt: serverTimestamp()
    });
  };

  if (loading) return <div className="p-20 text-center">Loading profile...</div>;
  if (!provider) return <div className="p-20 text-center">Provider not found.</div>;

  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hi ${provider.name}, I found you on CheapPlug. I need services in ${provider.town}. What is your best price?`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left: Photos & Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100">
              <img 
                src={provider.photos?.[activePhoto] || `https://picsum.photos/seed/${provider.id}/800/600`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {(provider.photos?.length ? provider.photos : [1,2,3]).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActivePhoto(i)}
                  className={cn(
                    "w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition",
                    activePhoto === i ? "border-[#1a7a4a]" : "border-transparent"
                  )}
                >
                  <img src={`https://picsum.photos/seed/${provider.id + i}/200/200`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold">{provider.businessName}</h1>
                  {provider.certified && <Star className="h-6 w-6 text-[#c8861a] fill-current" />}
                </div>
                <p className="text-lg text-[#6b7a6e]">{provider.name}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-[#c8861a]">
                    <Star className="h-5 w-5 fill-current mr-1" />
                    <span className="font-bold">{provider.ratingAvg}</span>
                    <span className="text-[#6b7a6e] ml-1">({provider.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center text-[#6b7a6e] text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {provider.town}, {provider.county}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-full border border-[#d4e0d7] hover:bg-gray-50"><Share2 className="h-5 w-5" /></button>
                <button className="p-2 rounded-full border border-[#d4e0d7] hover:bg-gray-50"><AlertTriangle className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="bg-white border border-[#d4e0d7] rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-bold">About this Plug</h3>
              <p className="text-[#6b7a6e] leading-relaxed">{provider.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-[#d4e0d7]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7a6e] mb-2">Pricing</h4>
                  <div className="text-2xl font-mono font-bold text-[#1a7a4a]">
                    {formatKES(provider.priceMin)} – {formatKES(provider.priceMax)}
                  </div>
                  <p className="text-sm text-[#6b7a6e]">{provider.priceUnit}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7a6e] mb-2">Trust Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.verified && <span className="bg-[#f0f4f1] text-[#1a7a4a] px-3 py-1 rounded-full text-xs font-bold flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Phone Verified</span>}
                    {provider.certified && <span className="bg-[#fcf8f0] text-[#c8861a] px-3 py-1 rounded-full text-xs font-bold flex items-center"><Star className="h-3 w-3 mr-1 fill-current" /> CheapPlug Certified</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Sticky */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border border-[#d4e0d7] rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="font-bold text-lg">Contact Provider</h3>
              <div className="space-y-3">
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackLead('whatsapp')}
                  className="w-full bg-[#2ea868] text-white py-4 rounded-2xl flex items-center justify-center font-bold text-lg hover:bg-[#1a7a4a] transition"
                >
                  <MessageCircle className="mr-2" /> WhatsApp Plug
                </a>
                <a 
                  href={`tel:${provider.phone}`}
                  onClick={() => trackLead('call')}
                  className="w-full bg-[#f7faf8] text-[#111a14] border border-[#d4e0d7] py-4 rounded-2xl flex items-center justify-center font-bold text-lg hover:bg-[#d4e0d7] transition"
                >
                  <Phone className="mr-2" /> Call Now
                </a>
              </div>
              <p className="text-[10px] text-center text-[#6b7a6e]">
                By contacting, you agree to CheapPlug's terms. Always meet in public places.
              </p>
            </div>

            <div className="bg-[#111a14] text-white rounded-3xl p-6 space-y-4">
              <h4 className="font-bold flex items-center"><Star className="h-4 w-4 text-[#c8861a] mr-2 fill-current" /> Price Comparison</h4>
              <p className="text-xs text-[#6b7a6e]">Community says others paid KSh 800–2,500 for this service in {provider.county}.</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#2ea868] w-3/4"></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#6b7a6e]">
                <span>Cheapest</span>
                <span>Average</span>
                <span>Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

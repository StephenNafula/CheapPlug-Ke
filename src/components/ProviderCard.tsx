import { Link } from "react-router-dom";
import { Star, MapPin, CheckCircle, MessageCircle, Phone } from "lucide-react";
import { Provider } from "../types";
import { formatKES, cn } from "../lib/utils";
import { motion } from "motion/react";

export default function ProviderCard({ provider }: { provider: Provider }) {
  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hi ${provider.name}, I found you on CheapPlug. I need services in ${provider.town}. What is your best price?`
  )}`;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white border border-[#d4e0d7] rounded-2xl overflow-hidden hover:shadow-xl transition flex flex-col"
    >
      <div className="relative h-48">
        <img 
          src={provider.photos?.[0] || `https://picsum.photos/seed/${provider.id}/400/300`} 
          alt={provider.businessName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {provider.verified && (
            <span className="bg-[#1a7a4a] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" /> VERIFIED
            </span>
          )}
          {provider.certified && (
            <span className="bg-[#c8861a] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
              <Star className="h-3 w-3 mr-1 fill-current" /> CERTIFIED
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div>
          <h3 className="font-bold text-lg leading-tight">{provider.businessName}</h3>
          <p className="text-sm text-[#6b7a6e]">{provider.name}</p>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <div className="flex text-[#c8861a]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("h-3.5 w-3.5", i < Math.floor(provider.ratingAvg) ? "fill-current" : "text-gray-300")} />
            ))}
          </div>
          <span className="text-[#6b7a6e]">({provider.reviewCount})</span>
        </div>

        <div className="flex items-center text-sm text-[#6b7a6e]">
          <MapPin className="h-4 w-4 mr-1" />
          {provider.town}, {provider.county}
        </div>

        <div className="pt-2">
          <span className="text-xs text-[#6b7a6e] uppercase font-bold tracking-wider">Price Range</span>
          <div className="text-[#111a14] font-mono font-bold">
            {formatKES(provider.priceMin)} – {formatKES(provider.priceMax)}
            <span className="text-xs font-normal text-[#6b7a6e] ml-1">{provider.priceUnit}</span>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-2 gap-2">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#2ea868] text-white py-2.5 rounded-xl flex items-center justify-center font-bold text-sm hover:bg-[#1a7a4a] transition"
          >
            <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
          </a>
          <a 
            href={`tel:${provider.phone}`}
            className="bg-[#f7faf8] text-[#111a14] border border-[#d4e0d7] py-2.5 rounded-xl flex items-center justify-center font-bold text-sm hover:bg-[#d4e0d7] transition"
          >
            <Phone className="h-4 w-4 mr-2" /> Call
          </a>
        </div>
      </div>
    </motion.div>
  );
}

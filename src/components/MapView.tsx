import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { useState } from "react";
import { Provider } from "../types";
import { formatKES } from "../lib/utils";
import { Star, Phone, MessageCircle } from "lucide-react";

interface MapViewProps {
  providers: Provider[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 }; // Nairobi

export default function MapView({ providers, center = DEFAULT_CENTER, zoom = 12 }: MapViewProps) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="bg-gray-100 rounded-3xl h-[600px] flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">Google Maps API Key missing.</p>
          <p className="text-xs text-gray-400">Please set VITE_GOOGLE_MAPS_API_KEY in your environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-[#d4e0d7] shadow-sm">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="bf50a913425154ee" // Optional: for advanced markers
          className="h-full w-full"
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          {providers.map((provider) => (
            provider.lat && provider.lng && (
              <AdvancedMarker
                key={provider.id}
                position={{ lat: provider.lat, lng: provider.lng }}
                onClick={() => setSelectedProvider(provider)}
              >
                <Pin 
                  background={provider.certified ? "#1a7a4a" : "#2ea868"} 
                  glyphColor={"#fff"} 
                  borderColor={"#111a14"}
                />
              </AdvancedMarker>
            )
          ))}

          {selectedProvider && (
            <InfoWindow
              position={{ lat: selectedProvider.lat!, lng: selectedProvider.lng! }}
              onCloseClick={() => setSelectedProvider(null)}
            >
              <div className="p-2 max-w-[200px] space-y-2">
                <h3 className="font-bold text-sm leading-tight">{selectedProvider.businessName}</h3>
                <div className="flex items-center text-xs text-[#c8861a]">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  {selectedProvider.ratingAvg} ({selectedProvider.reviewCount})
                </div>
                <div className="text-xs font-bold text-[#1a7a4a]">
                  {formatKES(selectedProvider.priceMin)} - {formatKES(selectedProvider.priceMax)}
                </div>
                <div className="flex gap-2 pt-1">
                  <a 
                    href={`tel:${selectedProvider.phone}`}
                    className="p-1.5 bg-[#f7faf8] border border-[#d4e0d7] rounded-lg hover:bg-gray-50 transition"
                  >
                    <Phone className="h-3 w-3" />
                  </a>
                  <a 
                    href={`https://wa.me/${selectedProvider.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}

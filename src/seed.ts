import { collection, addDoc, getDocs, query, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import { CATEGORIES, COUNTIES } from "./constants";

const SEED_PROVIDERS = [
  {
    name: "John Kamau",
    businessName: "Kamau Plumbers & Fittings",
    phone: "254712345678",
    whatsapp: "254712345678",
    categoryId: "plumbing",
    county: "Nairobi",
    town: "Westlands",
    description: "Expert plumbing services for residential and commercial buildings. We fix leaks, blocked drains, and install new bathroom fittings.",
    priceMin: 800,
    priceMax: 2500,
    priceUnit: "per job",
    verified: true,
    certified: true,
    ratingAvg: 4.8,
    reviewCount: 42,
    isActive: true,
    plan: "business",
    createdAt: new Date(),
    lat: -1.2633,
    lng: 36.8011
  },
  {
    name: "Sarah Wanjiku",
    businessName: "Wanjiku Beauty Parlour",
    phone: "254722334455",
    whatsapp: "254722334455",
    categoryId: "beauty",
    county: "Nairobi",
    town: "Kilimani",
    description: "Professional hair styling, braiding, and nail services. We bring the salon experience to your home or visit our studio.",
    priceMin: 1500,
    priceMax: 5000,
    priceUnit: "per session",
    verified: true,
    certified: false,
    ratingAvg: 4.5,
    reviewCount: 28,
    isActive: true,
    plan: "pro",
    createdAt: new Date(),
    lat: -1.2921,
    lng: 36.7827
  },
  {
    name: "David Otieno",
    businessName: "Otieno Tech Solutions",
    phone: "254733112233",
    whatsapp: "254733112233",
    categoryId: "tech-repair",
    county: "Mombasa",
    town: "Nyali",
    description: "Fast and reliable laptop and smartphone repairs. Screen replacements, battery changes, and software troubleshooting.",
    priceMin: 1000,
    priceMax: 15000,
    priceUnit: "per repair",
    verified: true,
    certified: true,
    ratingAvg: 4.9,
    reviewCount: 15,
    isActive: true,
    plan: "business",
    createdAt: new Date(),
    lat: -4.0351,
    lng: 39.7126
  },
  {
    name: "Mercy Njeri",
    businessName: "Njeri Home Helpers",
    phone: "254744556677",
    whatsapp: "254744556677",
    categoryId: "house-help",
    county: "Kiambu",
    town: "Thika",
    description: "Reliable and vetted domestic helpers for cleaning, laundry, and general house maintenance. Available for daily or weekly bookings.",
    priceMin: 500,
    priceMax: 1200,
    priceUnit: "per day",
    verified: true,
    certified: false,
    ratingAvg: 4.2,
    reviewCount: 35,
    isActive: true,
    plan: "free",
    createdAt: new Date(),
    lat: -1.0333,
    lng: 37.0693
  }
];

export async function seedDatabase() {
  const providersRef = collection(db, "providers");
  try {
    const snapshot = await getDocs(query(providersRef, limit(100)));
    
    if (snapshot.empty) {
      console.log("Seeding database...");
      for (const provider of SEED_PROVIDERS) {
        try {
          await addDoc(providersRef, provider);
        } catch (error) {
          console.warn("Could not seed provider:", error);
        }
      }
      console.log("Seeding complete.");
    } else {
      console.log("Updating existing providers with coordinates...");
      const { doc, updateDoc } = await import("firebase/firestore");
      for (const provider of SEED_PROVIDERS) {
        const existing = snapshot.docs.find(d => d.data().name === provider.name);
        if (existing && !existing.data().lat) {
          await updateDoc(doc(db, "providers", existing.id), {
            lat: provider.lat,
            lng: provider.lng
          });
        }
      }
      console.log("Update complete.");
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "providers");
  }
}

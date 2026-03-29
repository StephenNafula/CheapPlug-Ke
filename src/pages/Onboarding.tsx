import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { COUNTIES, CATEGORIES } from "../constants";
import { CheckCircle, ChevronRight, ChevronLeft, Upload, Phone } from "lucide-react";
import { normalizePhone } from "../lib/utils";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    whatsapp: "",
    categoryId: "",
    county: "",
    town: "",
    description: "",
    priceMin: "",
    priceMax: "",
    priceUnit: "per job",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const photoUrls = await Promise.all(
        photos.map(async (file) => {
          const storageRef = ref(storage, `providers/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      await addDoc(collection(db, "providers"), {
        ...formData,
        phone: normalizePhone(formData.phone),
        whatsapp: normalizePhone(formData.whatsapp || formData.phone),
        priceMin: parseInt(formData.priceMin),
        priceMax: parseInt(formData.priceMax),
        photos: photoUrls,
        verified: false,
        certified: false,
        ratingAvg: 0,
        reviewCount: 0,
        isActive: true,
        plan: "free",
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid
      });

      setStep(4);
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition",
                step >= s ? "bg-[#1a7a4a] text-white" : "bg-gray-200 text-gray-400"
              )}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="h-1 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-[#1a7a4a] transition-all duration-500 rounded-full" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white border border-[#d4e0d7] rounded-3xl p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Business Basics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">Your Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]" placeholder="e.g. John Kamau" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Business Name</label>
                <input name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]" placeholder="e.g. Kamau Plumbers" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]">
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]" placeholder="07XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">County</label>
                <select name="county" value={formData.county} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]">
                  <option value="">Select County</option>
                  {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Town / Area</label>
                <input name="town" value={formData.town} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]" placeholder="e.g. Westlands" />
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-[#1a7a4a] text-white py-4 rounded-2xl font-bold flex items-center justify-center">
              Next Step <ChevronRight className="ml-2" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pricing & Services</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">Min Price (KSh)</label>
                <input name="priceMin" type="number" value={formData.priceMin} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]" placeholder="500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Max Price (KSh)</label>
                <input name="priceMax" type="number" value={formData.priceMax} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]" placeholder="2000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Price Unit</label>
                <select name="priceUnit" value={formData.priceUnit} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a]">
                  <option value="per job">per job</option>
                  <option value="per hour">per hour</option>
                  <option value="per day">per day</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Service Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-[#d4e0d7] rounded-xl p-3 focus:outline-none focus:border-[#1a7a4a] h-32" placeholder="Tell customers what you do best..."></textarea>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#d4e0d7] py-4 rounded-2xl font-bold flex items-center justify-center">
                <ChevronLeft className="mr-2" /> Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 bg-[#1a7a4a] text-white py-4 rounded-2xl font-bold flex items-center justify-center">
                Next Step <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Photos</h2>
            <p className="text-sm text-[#6b7a6e]">Upload up to 8 photos of your work or business.</p>
            <div className="grid grid-cols-3 gap-4">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative">
                  <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" />
                </div>
              ))}
              {photos.length < 8 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-[#d4e0d7] flex flex-col items-center justify-center cursor-pointer hover:border-[#1a7a4a] transition">
                  <Upload className="text-[#6b7a6e] mb-2" />
                  <span className="text-xs font-bold text-[#6b7a6e]">Add Photo</span>
                  <input type="file" multiple className="hidden" onChange={handlePhotoChange} accept="image/*" />
                </label>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 border border-[#d4e0d7] py-4 rounded-2xl font-bold flex items-center justify-center">
                <ChevronLeft className="mr-2" /> Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 bg-[#1a7a4a] text-white py-4 rounded-2xl font-bold flex items-center justify-center disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Listing"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-[#f0f4f1] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-[#1a7a4a]" />
            </div>
            <h2 className="text-3xl font-bold">Listing Submitted!</h2>
            <p className="text-[#6b7a6e]">We'll verify your details within 24 hours. You'll receive an SMS once your listing is live.</p>
            <button onClick={() => navigate("/dashboard")} className="bg-[#1a7a4a] text-white px-8 py-4 rounded-2xl font-bold">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

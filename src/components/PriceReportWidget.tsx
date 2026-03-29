import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { PriceReport } from "../types";
import { CATEGORIES, COUNTIES } from "../constants";
import { cn, formatKES } from "../lib/utils";
import { TrendingUp, Plus, X, MessageSquare, MapPin, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PriceReportWidgetProps {
  categoryId?: string;
  county?: string;
  className?: string;
}

export default function PriceReportWidget({ categoryId, county, className }: PriceReportWidgetProps) {
  const [reports, setReports] = useState<PriceReport[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formCategory, setFormCategory] = useState(categoryId || "");
  const [formCounty, setFormCounty] = useState(county || "");
  const [formPrice, setFormPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let q = query(
      collection(db, "price_reports"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    if (categoryId) {
      q = query(q, where("categoryId", "==", categoryId));
    }
    if (county) {
      q = query(q, where("county", "==", county));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PriceReport));
      setReports(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "price_reports");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryId, county]);

  const averagePrice = useMemo(() => {
    if (reports.length === 0) return 0;
    const sum = reports.reduce((acc, report) => acc + report.reportedPrice, 0);
    return Math.round(sum / reports.length);
  }, [reports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formCounty || !formPrice) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "price_reports"), {
        categoryId: formCategory,
        county: formCounty,
        reportedPrice: parseInt(formPrice),
        createdAt: serverTimestamp(),
      });
      setIsReporting(false);
      setFormPrice("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "price_reports");
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategoryName = CATEGORIES.find(c => c.slug === (categoryId || formCategory))?.name;

  return (
    <div className={cn("bg-white border border-[#d4e0d7] rounded-3xl overflow-hidden shadow-sm", className)}>
      <div className="p-6 border-b border-[#d4e0d7] bg-[#f7faf8] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#1a7a4a] p-2 rounded-xl">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[#111a14]">Community Price Report</h3>
            <p className="text-xs text-[#6b7a6e]">Live crowdsourced averages</p>
          </div>
        </div>
        <button 
          onClick={() => setIsReporting(true)}
          className="bg-[#1a7a4a] text-white p-2 rounded-full hover:bg-[#145d38] transition shadow-md"
          title="Report a price"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-100 rounded-2xl"></div>
            <div className="h-24 bg-gray-100 rounded-2xl"></div>
          </div>
        ) : (
          <>
            <div className="bg-[#f7faf8] border border-[#d4e0d7] rounded-2xl p-6 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#6b7a6e] mb-2 block">
                {currentCategoryName || "All Categories"} {county ? `in ${county}` : "Average"}
              </span>
              <div className="text-4xl font-black text-[#1a7a4a]">
                {averagePrice > 0 ? formatKES(averagePrice) : "---"}
              </div>
              <p className="text-xs text-[#6b7a6e] mt-2">
                Based on {reports.length} community reports
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#111a14] flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" /> Recent Reports
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-white border border-[#f0f4f1] rounded-xl text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#111a14]">{formatKES(report.reportedPrice)}</span>
                      <span className="text-[10px] text-[#6b7a6e] flex items-center">
                        <MapPin className="h-2 w-2 mr-1" /> {report.county} • {CATEGORIES.find(c => c.slug === report.categoryId)?.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6b7a6e]">
                      {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-center text-xs text-[#6b7a6e] py-4 italic">No reports yet. Be the first!</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isReporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-[#d4e0d7] flex items-center justify-between bg-[#f7faf8]">
                <h3 className="font-bold text-lg">Report a Price Quote</h3>
                <button onClick={() => setIsReporting(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7a6e] flex items-center">
                    <Tag className="h-3 w-3 mr-1" /> Category
                  </label>
                  <select 
                    className="w-full bg-[#f7faf8] border border-[#d4e0d7] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a]"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                    disabled={!!categoryId}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7a6e] flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> County
                  </label>
                  <select 
                    className="w-full bg-[#f7faf8] border border-[#d4e0d7] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a]"
                    value={formCounty}
                    onChange={(e) => setFormCounty(e.target.value)}
                    required
                    disabled={!!county}
                  >
                    <option value="">Select County</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7a6e]">Quoted Price (KES)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1500"
                    className="w-full bg-[#f7faf8] border border-[#d4e0d7] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a]"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[#1a7a4a] text-white font-bold py-4 rounded-xl hover:bg-[#145d38] transition shadow-lg shadow-[#1a7a4a]/20 disabled:opacity-50 mt-4"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
                <p className="text-[10px] text-center text-[#6b7a6e]">
                  Your report helps fellow Kenyans avoid being overcharged. Thank you!
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

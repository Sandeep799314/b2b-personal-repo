"use client";

import { useState, useEffect } from "react";
import { Wallet, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAuthHeaders } from "@/lib/client-auth";

export function UserWallet() {
  const [credits, setCredits] = useState<number | null>(null);
  const [deduction, setDeduction] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const fetchCredits = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/user/credits", { headers });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  useEffect(() => {
    fetchCredits();
    
    // Listen for custom event to refresh credits
    const handleRefresh = () => fetchCredits();
    
    // Listen for deduction animation
    const handleDeduction = (e: any) => {
      const amount = e.detail?.amount || 1;
      setDeduction(amount);
      setShowAnimation(true);
      fetchCredits();
      
      // Reset animation after it finishes
      setTimeout(() => {
        setShowAnimation(false);
        setDeduction(null);
      }, 2000);
    };

    window.addEventListener("refresh-credits", handleRefresh);
    window.addEventListener("credits-deducted", handleDeduction);
    
    return () => {
      window.removeEventListener("refresh-credits", handleRefresh);
      window.removeEventListener("credits-deducted", handleDeduction);
    };
  }, []);

  if (credits === null) return null;

  return (
    <div className="flex items-center gap-2 px-3 h-9 bg-white border border-slate-200 rounded-md shadow-sm no-print relative overflow-visible group hover:border-brand-primary-200 transition-all">
      {/* Deduction Animation */}
      {showAnimation && deduction && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-float-up-fade pointer-events-none z-50">
          <span className="text-sm font-bold text-red-600 bg-white px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1 shadow-sm">
            -{deduction} <span className="text-[10px] uppercase">Credits</span>
          </span>
        </div>
      )}
      
      <Wallet className="w-4 h-4 text-brand-primary-500" />
      <div className="flex items-center gap-1.5 border-r border-slate-100 pr-2 mr-0.5">
        <span className="text-sm font-bold text-slate-900">{credits}</span>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">Credits</span>
      </div>
      
      <button 
        className="p-1 rounded-sm hover:bg-slate-50 text-slate-400 hover:text-brand-primary-600 transition-colors"
        title="Add Credits"
      >
        <PlusCircle className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

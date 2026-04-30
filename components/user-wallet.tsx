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
    <Card className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-brand-primary-50 to-white border-brand-primary-100 shadow-sm transition-all hover:shadow-md no-print relative overflow-visible">
      {/* Deduction Animation */}
      {showAnimation && deduction && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-float-up-fade pointer-events-none z-50">
          <span className="text-xl font-extrabold text-red-600 drop-shadow-sm whitespace-nowrap bg-white/80 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
            -{deduction} <span className="text-xs uppercase">Credits</span>
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary-500 text-white">
        <Wallet className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Your Balance</span>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-neutral-900">{credits}</span>
          <span className="text-xs font-semibold text-brand-primary-600">Credits</span>
        </div>
      </div>
      <div className="ml-auto">
        <button 
          className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors"
          title="Add Credits"
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

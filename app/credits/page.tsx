"use client";

import { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Check, CreditCard, Sparkles, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/client-auth";
import { cn } from "@/lib/utils";

const RECHARGE_PLANS = [
  {
    id: "basic",
    name: "Starter Pack",
    credits: 50,
    price: 499,
    description: "Perfect for exploring the platform",
    popular: false,
    color: "bg-blue-50 border-blue-200 text-blue-800"
  },
  {
    id: "pro",
    name: "Business Pro",
    credits: 200,
    price: 1499,
    description: "Best for active travel agents",
    popular: true,
    color: "bg-brand-primary-50 border-brand-primary-200 text-brand-primary-800"
  },
  {
    id: "premium",
    name: "Enterprise",
    credits: 1000,
    price: 4999,
    description: "Maximum value for large teams",
    popular: false,
    color: "bg-purple-50 border-purple-200 text-purple-800"
  }
];

export default function CreditsPage() {
  const [currentCredits, setCredits] = useState<number | null>(null);
  const [isRecharging, setIsRecharging] = useState<string | null>(null);
  const { toast } = useToast();

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
  }, []);

  const handleRecharge = async (planId: string, amount: number) => {
    setIsRecharging(planId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/user/credits/recharge", {
        method: "POST",
        headers,
        body: JSON.stringify({ amount })
      });

      if (res.ok) {
        const data = await res.json();
        setCredits(data.newBalance);
        
        // Trigger global wallet refresh
        window.dispatchEvent(new CustomEvent('refresh-credits'));
        
        toast({
          title: "Payment Successful",
          description: data.message,
        });
      } else {
        throw new Error("Failed to recharge");
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong with the transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRecharging(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50/30">
      <TopHeader showWallet={true} />
      
      <main className="flex-1 overflow-auto p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-neutral-900">Wallet & Credits</h1>
            <p className="text-neutral-500 font-medium">Manage your credits and subscription plans</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-white to-blue-50/30 border-neutral-200">
            <CardHeader className="pb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Usage Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Create Itinerary</span>
                  <Badge variant="secondary" className="bg-blue-100/50 text-blue-700">-2 Credits</Badge>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Create Product/Quote</span>
                  <Badge variant="secondary" className="bg-blue-100/50 text-blue-700">-1 Credit</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-brand-primary-50/30 border-neutral-200">
            <CardHeader className="pb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary-100 flex items-center justify-center text-brand-primary-600 mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Bonus Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Refer a colleague and get <span className="font-bold text-brand-primary-700">10 free credits</span> when they make their first itinerary.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-emerald-50/30 border-neutral-200">
            <CardHeader className="pb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Secure Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 leading-relaxed">
                All transactions are encrypted and processed securely through our trusted payment partners.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900">Recharge Your Wallet</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">Choose a plan that fits your business needs. Credits never expire and can be used for all premium features.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {RECHARGE_PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                  plan.popular ? "border-brand-primary-400 ring-4 ring-brand-primary-50 shadow-brand-md" : "border-neutral-200"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg z-10">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 border-b border-neutral-100">
                  <CardTitle className="text-xl font-bold mb-2">{plan.name}</CardTitle>
                  <div className="flex flex-col items-center justify-center py-4 bg-neutral-50 rounded-2xl mb-4">
                    <span className="text-4xl font-black text-neutral-900 leading-none">{plan.credits}</span>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Credits</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-neutral-900">₹{plan.price}</span>
                    <span className="text-xs font-medium text-neutral-500 italic">one-time</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 py-8">
                  <p className="text-sm text-neutral-500 text-center mb-6">{plan.description}</p>
                  <ul className="space-y-4">
                    {[
                      "Unlocks All Destinations",
                      "Full PDF Downloads",
                      "Priority AI Support",
                      "Unlimited Drafts"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-neutral-700 font-medium">
                        <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <Check className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pb-8 px-8">
                  <Button 
                    className={cn(
                      "w-full h-12 rounded-xl font-bold text-md transition-all shadow-md active:scale-95",
                      plan.popular 
                        ? "bg-brand-primary-500 hover:bg-brand-primary-600 text-white" 
                        : "bg-white border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                    )}
                    onClick={() => handleRecharge(plan.id, plan.credits)}
                    disabled={isRecharging !== null}
                  >
                    {isRecharging === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Banner */}
        <div className="bg-neutral-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold">Need a Custom Volume?</h3>
            <p className="text-neutral-400 text-sm max-w-md font-medium">Contact our sales team for enterprise-grade credit volumes and exclusive agency benefits.</p>
          </div>
          <Button variant="outline" className="h-12 px-8 rounded-xl border-white/20 text-white hover:bg-white hover:text-black font-bold">
            Talk to Sales
          </Button>
        </div>
      </main>
    </div>
  );
}

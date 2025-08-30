import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const PurchasePage = () => {
  const [credits, setCredits] = useState(10);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const pay = useAction(api.stripe.pay);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const url = await pay({ credits });
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("There was an error with your purchase.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Purchase Hydcoin</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Securely add Hydcoin credits to your account using Stripe.</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">New Purchase</CardTitle>
            <CardDescription>1 Hydcoin = $1.00 USD</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="credits" className="font-semibold">Number of Credits (H)</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  value={credits}
                  onChange={(e) => setCredits(Math.max(1, Number(e.target.value)))}
                  className="mt-1 text-lg"
                  placeholder="e.g., 100"
                />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Cost</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${credits.toFixed(2)}</p>
              </div>
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700"
              >
                {isPurchasing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Proceed to Checkout"}
              </Button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">You will be redirected to Stripe to complete your purchase securely.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchasePage;

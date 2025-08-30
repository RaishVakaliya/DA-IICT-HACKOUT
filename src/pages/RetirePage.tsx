import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RetirePage = () => {
  const [amount, setAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const retireCredits = useMutation(api.hydcoin.retire);
  const balance = useQuery(api.hydcoin.getBalance);

  const handleRetire = async () => {
    if (amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (balance === undefined || balance === null || amount > balance) {
      setError("You do not have enough credits to retire.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await retireCredits({ amount });
      setSuccess(`${amount} Hydcoin(s) retired successfully!`);
      setAmount(1);
    } catch (err: any) {
      setError(err.message || "An error occurred while retiring credits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Retire Hydcoin</h1>
            <p className="text-gray-600">Permanently remove your Hydcoin from circulation.</p>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 font-medium">Your Active Balance</p>
              <p className="text-2xl font-bold text-gray-900">{balance ?? "..."} Hydcoin</p>
            </div>

            <div>
              <Label htmlFor="amount" className="text-sm font-semibold">Amount to Retire</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mt-2"
                placeholder="e.g., 10"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center">{success}</p>}

            <Button
              onClick={handleRetire}
              disabled={isLoading || balance === null || balance === 0}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Retiring...
                </>
              ) : (
                'Retire Credits'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirePage;

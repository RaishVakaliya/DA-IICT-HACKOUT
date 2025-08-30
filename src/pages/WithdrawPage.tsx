import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

const WithdrawPage = () => {
  const [amount, setAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const balance = useQuery(api.hydcoin.getBalance);
  const withdrawalHistory = useQuery(api.hydcoin.getWithdrawalHistory);
  const requestStripePayout = useMutation(api.hydcoin.requestStripePayout);
  const currentUser = useQuery(api.users.getCurrentUser);
  const createStripeAccountLink = useAction(api.stripe.createStripeAccountLink);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (balance === undefined || balance === null || amount > balance) {
      setError("Insufficient balance for this withdrawal request.");
      return;
    }

    setIsLoading(true);
    try {
      await requestStripePayout({ amount });
      setSuccess("Your withdrawal request has been submitted for review.");
      setAmount(1);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    setIsLoading(true);
    try {
      const url = await createStripeAccountLink();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to Stripe.");
    } finally {
      setIsLoading(false);
    }
  };


  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24">
      <div className="container mx-auto px-4 py-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Withdraw Hydcoin</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Securely cash out your Hydcoin credits to your preferred account.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Side: Withdrawal Form */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">New Withdrawal Request</CardTitle>
                <CardDescription>Connect your bank account to withdraw funds.</CardDescription>
              </CardHeader>
              <CardContent>
                {!currentUser ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  </div>
                ) : !currentUser.stripeAccountId ? (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-semibold mb-4">Connect to Stripe</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">To withdraw funds, you need to connect your bank account via Stripe. This is a secure, one-time setup.</p>
                    <Button onClick={handleStripeConnect} disabled={isLoading} className="w-full max-w-xs mx-auto text-lg py-6">
                      {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...</> : "Connect Bank Account"}
                    </Button>
                    {error && <p className="text-red-500 text-sm font-medium text-center mt-4">{error}</p>}
                  </div>
                ) : (
                  <div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center mb-6 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Available to Withdraw</p>
                      <p className="text-3xl font-bold text-blue-800 dark:text-blue-100">{balance ?? "..."} H</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="amount" className="font-semibold">Amount (H)</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                          className="mt-1 text-lg"
                          placeholder="e.g., 100"
                        />
                      </div>
                      {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                      {success && <p className="text-green-500 text-sm font-medium text-center">{success}</p>}
                      <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : "Submit for Review"}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Withdrawal History */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Withdrawal History</CardTitle>
                <CardDescription>Track the status of your past requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {withdrawalHistory?.map((item) => (
                    <li key={item._id} className="p-4 border rounded-lg flex items-start space-x-4">
                      <StatusIcon status={item.status} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">{item.amount} H</span>
                          <span className={`capitalize font-semibold text-sm ${item.status === 'pending' ? 'text-yellow-600' : item.status === 'processed' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(item._creationTime).toLocaleString()}</p>
                        {item.method === "upi" && <p className="text-xs text-gray-400">To: {item.details.upiId}</p>}
                        {item.method === "credit_card" && <p className="text-xs text-gray-400">To: {item.details.cardNumber}</p>}
                      </div>
                    </li>
                  ))}
                  {withdrawalHistory?.length === 0 && <p className="text-center text-gray-500 py-8">No withdrawal history.</p>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;


import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, Clock, XCircle, Loader2, Banknote, Landmark } from "lucide-react";

const StatusInfo: Record<string, { icon: React.ElementType, color: string, text: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", text: "Pending" },
  processed: { icon: CheckCircle, color: "text-green-500", text: "Processed" },
  failed: { icon: XCircle, color: "text-red-500", text: "Failed" },
};

const WithdrawPage = () => {
  const [activeTab, setActiveTab] = useState("withdraw");
  const balance = useQuery(api.hydcoin.getBalance);
  const currentUser = useQuery(api.users.getCurrentUser);
  const createStripeAccountLink = useAction(api.stripe.createStripeAccountLink);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!currentUser.stripeAccountId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <Landmark className="mx-auto h-12 w-12 text-blue-500" />
              <CardTitle className="text-2xl mt-4">Connect Your Bank Account</CardTitle>
              <CardDescription className="mt-2">To withdraw funds, you need to connect your bank account via Stripe. This is a secure, one-time setup process.</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Button onClick={async () => {
                setIsLoading(true);
                try {
                  const url = await createStripeAccountLink();
                  if (url) window.location.href = url;
                } catch (err: any) {
                  setError(err.message || "Failed to connect to Stripe.");
                } finally {
                  setIsLoading(false);
                }
              }} disabled={isLoading} size="lg" className="w-full max-w-sm mx-auto text-base">
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...</> : "Connect with Stripe"}
              </Button>
              {error && <p className="text-red-500 text-sm font-medium text-center mt-4">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-800 dark:text-white">Withdraw Funds</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Securely cash out your Hydcoin credits.</p>
        </header>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center mb-8 border border-blue-200 dark:border-blue-800 shadow-sm">
          <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Available Balance</p>
          <p className="text-4xl font-bold text-blue-800 dark:text-blue-100 tracking-tight">{balance?.toFixed(2) ?? "0.00"} H</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="withdraw">New Withdrawal</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="withdraw">
            <WithdrawalForm />
          </TabsContent>
          <TabsContent value="history">
            <WithdrawalHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const WithdrawalForm = () => {
  const [amount, setAmount] = useState(10);
  const [method, setMethod] = useState<"stripe" | "upi">("stripe");
  const [upiId, setUpiId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const balance = useQuery(api.hydcoin.getBalance);
  const requestWithdrawal = useMutation(api.hydcoin.requestWithdrawal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!balance || amount > balance) {
      setError("Insufficient balance.");
      return;
    }
    if (method === 'upi' && !upiId.match(/^[\w.-]+@[\w.-]+$/)) {
      setError("Please enter a valid UPI ID.");
      return;
    }

    setIsLoading(true);
    try {
      await requestWithdrawal({ 
        amount, 
        method, 
        details: method === 'upi' ? { upiId } : {}
      });
      setSuccess(`Withdrawal request for ${amount} H submitted successfully.`);
      setAmount(10);
      setUpiId("");
    } catch (err: any) {
      setError(err.data?.message || err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl mt-6 border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Create Withdrawal Request</CardTitle>
        <CardDescription>Funds will be sent to your selected account after admin approval.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="amount" className="font-semibold text-base">Amount (H)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max={balance ?? 1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="mt-2 text-lg h-12"
              placeholder="e.g., 100"
            />
          </div>

          <div>
            <Label className="font-semibold text-base">Withdrawal Method</Label>
            <RadioGroup value={method} onValueChange={(value: "stripe" | "upi") => setMethod(value)} className="mt-2 grid grid-cols-2 gap-4">
              <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 dark:has-[:checked]:bg-blue-900/30">
                <RadioGroupItem value="stripe" id="stripe" />
                <Landmark className="h-6 w-6 text-gray-600"/>
                <span className="font-semibold">Stripe Payout</span>
              </Label>
              <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 dark:has-[:checked]:bg-blue-900/30">
                <RadioGroupItem value="upi" id="upi" />
                <Banknote className="h-6 w-6 text-gray-600"/>
                <span className="font-semibold">UPI Transfer</span>
              </Label>
            </RadioGroup>
          </div>

          {method === 'upi' && (
            <div>
              <Label htmlFor="upiId" className="font-semibold text-base">UPI ID</Label>
              <Input
                id="upiId"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="mt-2 text-lg h-12"
                placeholder="yourname@bank"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm font-medium text-center py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</p>}
          {success && <p className="text-green-500 text-sm font-medium text-center py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">{success}</p>}

          <Button type="submit" size="lg" className="w-full text-base" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : `Request Withdrawal`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const WithdrawalHistory = () => {
  const withdrawalHistory = useQuery(api.hydcoin.getWithdrawalHistory);

  if (!withdrawalHistory) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (withdrawalHistory.length === 0) {
    return <p className="text-center text-gray-500 py-12">You have no withdrawal history.</p>;
  }

  return (
    <Card className="shadow-xl mt-6 border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Transaction History</CardTitle>
        <CardDescription>A record of your past withdrawal requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="-mx-6 -mb-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {withdrawalHistory.map((item: any) => {
                const status = StatusInfo[item.status] || { icon: Clock, color: 'text-gray-500', text: 'Unknown' };
                return (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.amount.toFixed(2)} H</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        {item.method === 'upi' ? <Banknote className="h-4 w-4 mr-2"/> : <Landmark className="h-4 w-4 mr-2"/>}
                        {item.method === 'upi' ? `UPI: ${item.details.upiId}` : 'Stripe Payout'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(item._creationTime).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color.replace('text-', 'bg-').replace('-500', '-100')} ${status.color} dark:bg-opacity-20`}>
                        <status.icon className={`-ml-0.5 mr-1.5 h-4 w-4 ${status.color}`} />
                        {status.text}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawPage;


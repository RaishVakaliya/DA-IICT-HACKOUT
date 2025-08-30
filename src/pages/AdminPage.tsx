import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const AdminPage = () => {
  const pendingWithdrawals = useQuery(api.hydcoin.getPendingWithdrawals);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (withdrawalId: string) => {
    setLoadingId(withdrawalId);
    setError(null);
    try {
      const response = await fetch("/processStripePayout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to approve payout.");
      }
      // The list will automatically update via Convex's reactivity.
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Manage pending withdrawal requests.</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Pending Withdrawals</CardTitle>
          <CardDescription>Review and approve payout requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
          {pendingWithdrawals === undefined ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : pendingWithdrawals.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending withdrawals.</p>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((req) => (
                <Card key={req._id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{req.username}</p>
                    <p className="text-sm text-gray-500">Amount: <span className="font-bold">{req.amount} H</span></p>
                    <p className="text-xs text-gray-400">{new Date(req._creationTime).toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={() => handleApprove(req._id)}
                    disabled={loadingId === req._id}
                    size="sm"
                  >
                    {loadingId === req._id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving...</>
                    ) : (
                      "Approve Payout"
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, FileText, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AdminPage = () => {
  const isAdmin = useQuery(api.users.isAdminUser); // Check admin status
  const pendingWithdrawals = useQuery(api.hydcoin.getPendingWithdrawals);
  const pendingProducerApplications = useQuery(api.users.getPendingProducerApplications);
  const updateDocumentStatus = useMutation(api.users.updateDocumentStatusPublic);
  const updateProducerApplicationStatus = useMutation(api.users.updateProducerApplicationStatusPublic);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentActionLoading, setDocumentActionLoading] = useState<string | null>(null);
  const [applicationActionLoading, setApplicationActionLoading] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<string | null>(null);

  // Handle access control
  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        <p className="ml-4 text-gray-600 dark:text-gray-300">Loading admin status...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Unauthorized Access</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </Card>
      </div>
    );
  }

  const handleApproveWithdrawal = async (withdrawalId: string) => {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDocumentStatusUpdate = async (applicationId: string, documentIndex: number, status: "verified" | "rejected") => {
    setDocumentActionLoading(`${applicationId}-${documentIndex}-${status}`);
    try {
      await updateDocumentStatus({ applicationId: applicationId as Id<"producer_applications">, documentIndex, status });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDocumentActionLoading(null);
    }
  };

  const handleApplicationStatusUpdate = async (applicationId: string, status: "approved" | "rejected") => {
    setApplicationActionLoading(`${applicationId}-${status}`);
    try {
      await updateProducerApplicationStatus({
        applicationId: applicationId as Id<"producer_applications">,
        status,
        reviewNotes: reviewNotes[applicationId] || undefined, // Include review notes if available
      });
      setIsRejectDialogOpen(null); // Close dialog on success
      setReviewNotes(prev => {
        const newState = { ...prev };
        delete newState[applicationId];
        return newState;
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApplicationActionLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-10 pt-20">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Manage pending withdrawal requests and producer applications.</p>
      </header>

      {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}

      {/* Pending Producer Applications Section */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Pending Producer Applications</CardTitle>
          <CardDescription>Review and approve new producer applications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {pendingProducerApplications === undefined ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : pendingProducerApplications.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending producer applications.</p>
          ) : (
            <div className="space-y-6">
              {pendingProducerApplications.map((app) => (
                <Card key={app._id} className="p-6 space-y-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{app.user?.fullname || "Unknown User"}</p>
                      <p className="text-gray-600">@{app.user?.username || "unknown"} - {app.user?.email || "N/A"}</p>
                      <p className="text-sm text-gray-500">Applied On: {new Date(app._creationTime).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApplicationStatusUpdate(app._id, "approved")}
                        disabled={applicationActionLoading === `${app._id}-approved`}
                        variant="outline"
                        className="bg-green-500 text-white hover:bg-green-600"
                      >
                        {applicationActionLoading === `${app._id}-approved` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />} Approve
                      </Button>

                      <Dialog open={isRejectDialogOpen === app._id} onOpenChange={(open) => setIsRejectDialogOpen(open ? app._id : null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Producer Application</DialogTitle>
                            <CardDescription>Please provide notes for rejecting this application.</CardDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="reviewNotes" className="sr-only">Review Notes</Label>
                            <Textarea
                              id="reviewNotes"
                              placeholder="Enter rejection reasons or notes..."
                              value={reviewNotes[app._id] || ""}
                              onChange={(e) => setReviewNotes(prev => ({ ...prev, [app._id]: e.target.value }))}
                              className="min-h-[100px]"
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              onClick={() => handleApplicationStatusUpdate(app._id, "rejected")}
                              disabled={applicationActionLoading === `${app._id}-rejected` || !reviewNotes[app._id]}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              {applicationActionLoading === `${app._id}-rejected` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Rejection"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {app.producerDetails && (
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">Producer Details:</h3>
                      <p><strong>Company:</strong> {app.producerDetails.companyName}</p>
                      <p><strong>Registration No:</strong> {app.producerDetails.registrationNumber}</p>
                      <p><strong>Address:</strong> {app.producerDetails.businessAddress}</p>
                      <p><strong>Contact:</strong> {app.producerDetails.contactPerson}</p>
                      {app.producerDetails.website && <p><strong>Website:</strong> <a href={app.producerDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{app.producerDetails.website}</a></p>}
                    </div>
                  )}

                  {app.documents && app.documents.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Documents:</h3>
                      {app.documents.map((doc, docIndex) => (
                        <div key={docIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-600" />
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              {doc.type} <ExternalLink className="h-4 w-4" />
                            </a>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === "verified" ? "bg-green-100 text-green-800" : doc.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {doc.status.replace("_", " ").charAt(0).toUpperCase() + doc.status.replace("_", " ").slice(1)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDocumentStatusUpdate(app._id, docIndex, "verified")}
                              disabled={documentActionLoading === `${app._id}-${docIndex}-verified` || doc.status === "verified"}
                              size="sm"
                              variant="outline"
                              className="bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              {documentActionLoading === `${app._id}-${docIndex}-verified` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />} Verify
                            </Button>
                            <Button
                              onClick={() => handleDocumentStatusUpdate(app._id, docIndex, "rejected")}
                              disabled={documentActionLoading === `${app._id}-${docIndex}-rejected` || doc.status === "rejected"}
                              size="sm"
                              variant="outline"
                              className="bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              {documentActionLoading === `${app._id}-${docIndex}-rejected` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />} Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Pending Withdrawals Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Pending Withdrawals</CardTitle>
          <CardDescription>Review and approve payout requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    onClick={() => handleApproveWithdrawal(req._id)}
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

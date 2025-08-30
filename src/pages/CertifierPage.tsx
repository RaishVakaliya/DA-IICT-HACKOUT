import { useQuery, useMutation } from "convex/react";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Hourglass, XCircle, CheckCircle } from "lucide-react";

const CertifierPage = () => {
  const pendingApplications = useQuery(api.users.getPendingProducerApplications);
  const pendingWithdrawals = useQuery(api.hydcoin.getPendingWithdrawals);
  const updateApplicationStatus = useMutation(api.users.updateProducerApplicationStatusPublic);
  const updateWithdrawalStatus = useMutation(api.users.updateWithdrawalRequestStatus);

  const handleApplicationUpdate = (applicationId: Id<"producer_applications">, status: "approved" | "rejected") => {
    updateApplicationStatus({ applicationId, status });
  };

  const handleWithdrawalUpdate = (requestId: Id<"withdrawal_requests">, status: "processed" | "failed") => {
    updateWithdrawalStatus({ requestId, status });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 rounded-lg shadow-lg text-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Certifier Dashboard</h1>
        <div className="flex items-center text-gray-500">
          <Hourglass className="mr-2 h-5 w-5" />
          <span>Review Panel</span>
        </div>
      </div>
      
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Pending Producer Applications</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          {pendingApplications === undefined && <p className="text-center py-8">Loading applications...</p>}
          
          {pendingApplications && pendingApplications.length === 0 && (
            <Card className="mt-4 text-center">
              <CardHeader>
                <div className="mx-auto bg-gray-100 rounded-full p-3 w-fit">
                  <FileText className="h-8 w-8 text-gray-500" />
                </div>
                <CardTitle className="mt-4">No Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">All producer applications have been reviewed. Check back later.</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {pendingApplications?.map((app) => (
              app && (
                <Card key={app._id} className="shadow-md hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{app.producerDetails.companyName}</CardTitle>
                    <CardDescription>User: {app.user?.fullname} ({app.user?.email})</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm">Registration #:</p>
                      <p className="text-gray-700">{app.producerDetails.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Address:</p>
                      <p className="text-gray-700">{app.producerDetails.businessAddress}</p>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2">Documents:</h4>
                      <ul className="space-y-2">
                        {app.documents.map((doc, index) => (
                          <li key={index} className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              {doc.type}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 bg-gray-50 p-4">
                    <Button variant="outline" onClick={() => handleApplicationUpdate(app._id, "rejected")}>
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button onClick={() => handleApplicationUpdate(app._id, "approved")}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                  </CardFooter>
                </Card>
              )
            ))}
          </div>
        </TabsContent>
        <TabsContent value="withdrawals">
          {pendingWithdrawals === undefined && <p className="text-center py-8">Loading requests...</p>}

          {pendingWithdrawals && pendingWithdrawals.length === 0 && (
            <Card className="mt-4 text-center">
              <CardHeader>
                <div className="mx-auto bg-gray-100 rounded-full p-3 w-fit">
                  <Hourglass className="h-8 w-8 text-gray-500" />
                </div>
                <CardTitle className="mt-4">No Pending Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">All withdrawal requests have been reviewed.</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {pendingWithdrawals?.map((req) => (
              req && (
                <Card key={req._id} className="shadow-md hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">Request from {req.username}</CardTitle>
                    <CardDescription>Amount: {req.amount} Hydcoin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm">Method:</p>
                      <p className="text-gray-700 uppercase">{req.method}</p>
                    </div>
                    {req.details.upiId && (
                      <div>
                        <p className="font-semibold text-sm">UPI ID:</p>
                        <p className="text-gray-700">{req.details.upiId}</p>
                      </div>
                    )}
                    {req.details.stripeAccountId && (
                      <div>
                        <p className="font-semibold text-sm">Stripe Account:</p>
                        <p className="text-gray-700">{req.details.stripeAccountId}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 bg-gray-50 p-4">
                    <Button variant="outline" onClick={() => handleWithdrawalUpdate(req._id, "failed")}>
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button onClick={() => handleWithdrawalUpdate(req._id, "processed")}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                  </CardFooter>
                </Card>
              )
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CertifierPage;

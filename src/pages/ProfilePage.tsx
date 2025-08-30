import { useState } from "react";
import { useUser } from "../context/UserContext";
import { SignOutButton } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Wallet, Factory, Upload, FileText, CheckCircle, XCircle } from "lucide-react"; // Added icons

const ProfilePage = () => {
  const { user, isLoading } = useUser();
  const { isSignedIn, userId } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const transactions = useQuery(api.hydcoin.getTransactions);

  // Convex mutation for updating user
  const updateUser = useMutation(api.users.updateUser);
  const submitProducerApplication = useMutation(api.users.submitProducerApplication);

  const [isSaving, setIsSaving] = useState(false);
  const [producerFormSaving, setProducerFormSaving] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullname: user?.fullname || "",
    username: user?.username || "",
    image: user?.image || "",
    phone: user?.phone || "",
  });
  const [imagePreview, setImagePreview] = useState(user?.image || "");
  const [producerFormData, setProducerFormData] = useState({
    companyName: user?.producerDetails?.companyName || "",
    registrationNumber: user?.producerDetails?.registrationNumber || "",
    businessAddress: user?.producerDetails?.businessAddress || "",
    contactPerson: user?.producerDetails?.contactPerson || "",
    website: user?.producerDetails?.website || "",
  });
  const [documentsToUpload, setDocumentsToUpload] = useState<{
    type: string;
    url: string;
    uploadDate: number;
  }[]>([]);

  const [documentType, setDocumentType] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-white">🔒</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-600 text-lg">
              You need to be signed in to view your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-6 text-lg">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update image preview when image URL changes
    if (name === 'image') {
      setImagePreview(value);
    }
  };

  const handleProducerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProducerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddDocument = () => {
    if (documentType && documentUrl) {
      setDocumentsToUpload(prev => [...prev, {
        type: documentType,
        url: documentUrl,
        uploadDate: Date.now(),
      }]);
      setDocumentType("");
      setDocumentUrl("");
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentsToUpload(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      await updateUser({
        clerkId: userId,
        fullname: profileFormData.fullname,
        username: profileFormData.username,
        image: profileFormData.image,
        phone: profileFormData.phone,
      });
      setIsEditDialogOpen(false);
      // TODO: Refresh user data or show success message
    } catch (error) {
      console.error("Error updating user:", error);
      // TODO: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitProducerApplication = async () => {
    if (!userId) return;
    setProducerFormSaving(true);
    try {
      await submitProducerApplication({
        producerDetails: producerFormData,
        documents: documentsToUpload,
      });
      alert("Producer application submitted successfully!");
      // TODO: Refresh user data or show success message
    } catch (error: any) {
      console.error("Error submitting producer application:", error);
      alert(error.message || "Failed to submit producer application.");
    } finally {
      setProducerFormSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileFormData({
      fullname: user?.fullname || "",
      username: user?.username || "",
      image: user?.image || "",
      phone: user?.phone || "",
    });
    setImagePreview(user?.image || "");
    setIsEditDialogOpen(false);
  };

  const stats = [
    { label: "Credits Earned", value: "2,450", icon: "🏆", color: "from-yellow-400 to-orange-500" },
    { label: "Projects", value: "12", icon: "🚀", color: "from-blue-400 to-cyan-500" },
    { label: "Verifications", value: "8", icon: "✅", color: "from-green-400 to-emerald-500" },
    { label: "Member Since", value: "2024", icon: "📅", color: "from-purple-400 to-pink-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={user?.image} alt="Profile" />
                <AvatarFallback className="text-4xl font-bold bg-white/10 text-white">
                  {user?.fullname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{user?.fullname || "User"}</h1>
            <p className="text-xl text-sky-100 mb-6">{user?.username || "username"}</p>
            <p className="text-lg text-sky-100 mb-8">{user?.email}</p>

            <div className="flex flex-wrap justify-center gap-4">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm">
                    ✏️ Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information and image.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Profile Image Section */}
                    <div className="space-y-3">
                      <Label htmlFor="image" className="text-sm font-semibold">Profile Image URL</Label>
                      <Input
                        id="image"
                        name="image"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={profileFormData.image}
                        onChange={handleInputChange}
                        className="w-full"
                      />

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="text-center">
                          <Label className="text-sm text-gray-600 mb-2 block">Preview:</Label>
                          <Avatar className="w-20 h-20 mx-auto border-2 border-gray-200">
                            <AvatarImage src={imagePreview} alt="Preview" />
                            <AvatarFallback className="text-lg">?</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="fullname"
                        name="fullname"
                        type="text"
                        placeholder="Enter your full name"
                        value={profileFormData.fullname}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter username"
                        value={profileFormData.username}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={profileFormData.phone}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-sky-600 hover:bg-sky-700"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <SignOutButton>
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm">
                  🚪 Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-fit mx-auto h-auto p-1 rounded-xl bg-gray-200 dark:bg-gray-800">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
              <User className="h-5 w-5" /> Profile Details
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
              <Wallet className="h-5 w-5" /> Wallet
            </TabsTrigger>
            <TabsTrigger value="producer" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
              <Factory className="h-5 w-5" /> Become a Producer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8">
            {/* Existing Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-white/20">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Existing Profile Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">👤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👤</span>
                      <span className="text-sm font-medium text-gray-600">Full Name</span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-lg font-semibold text-gray-900">{user?.fullname || "Not set"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏷️</span>
                      <span className="text-sm font-medium text-gray-600">Username</span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-lg font-semibold text-gray-900">@{user?.username || "Not set"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📧</span>
                      <span className="text-sm font-medium text-gray-600">Email</span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📱</span>
                      <span className="text-sm font-medium text-gray-600">Phone Number</span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-lg font-semibold text-gray-900">{user?.phone || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">⚙️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Role</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role || "Not assigned"}</p>
                    </div>
                    <span className="text-2xl">🎭</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Verification Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {user?.verified ? '✅ Verified' : '⏳ Pending Verification'}
                      </span>
                    </div>
                    <span className="text-2xl">🔒</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Member Since</p>
                      <p className="text-lg font-semibold text-gray-900">January 2024</p>
                    </div>
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="mt-8">
            {/* Wallet content will go here */}
            {/* This will include the transaction history and potentially credit breakdown */}
            {/* Existing Transaction History Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📜</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
              </div>

              <div className="space-y-4">
                {transactions && transactions.length > 0 ? (
                  [...new Map(transactions.map(tx => [tx._id, tx])).values()].map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {tx.type === 'purchase' ? 'Hydcoin Purchase' : `Transfer to @${tx.toUsername}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(tx._creationTime).toLocaleString()}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${tx.currentUserIsSender ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.currentUserIsSender ? '-' : '+'}{tx.amount} Hydcoin
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No transactions yet.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="producer" className="mt-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Green Hydrogen Producer</h2>
              <p className="text-gray-600 mb-6">Apply to become a verified producer and issue your own green hydrogen credits on the platform. Please fill out the details below and upload the required documents.</p>
              
              {user?.producerApplicationStatus === "approved" ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Approved!</h3>
                  <p className="text-gray-600">Congratulations! You are now a verified Green Hydrogen Producer.</p>
                  {/* Display producer details */}
                  {user.producerDetails && (
                    <div className="mt-6 text-left inline-block bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold">Company Name: <span className="font-normal">{user.producerDetails.companyName}</span></p>
                      <p className="font-semibold">Registration No.: <span className="font-normal">{user.producerDetails.registrationNumber}</span></p>
                      <p className="font-semibold">Contact Person: <span className="font-normal">{user.producerDetails.contactPerson}</span></p>
                      <p className="font-semibold">Website: <span className="font-normal">{user.producerDetails.website || 'N/A'}</span></p>
                    </div>
                  )}
                </div>
              ) : user?.producerApplicationStatus === "pending" ? (
                <div className="text-center py-8">
                  <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Pending Review</h3>
                  <p className="text-gray-600">Your application is currently being reviewed by our team. We will notify you once a decision has been made.</p>
                </div>
              ) : user?.producerApplicationStatus === "rejected" ? (
                <div className="text-center py-8">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Rejected</h3>
                  <p className="text-gray-600">Unfortunately, your application was not approved. Please review the requirements and reapply if necessary.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitProducerApplication(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName" className="font-semibold">Company Name</Label>
                      <Input id="companyName" name="companyName" value={producerFormData.companyName} onChange={handleProducerInputChange} placeholder="Your Company Name" required />
                    </div>
                    <div>
                      <Label htmlFor="registrationNumber" className="font-semibold">Registration Number</Label>
                      <Input id="registrationNumber" name="registrationNumber" value={producerFormData.registrationNumber} onChange={handleProducerInputChange} placeholder="Company Registration Number" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="businessAddress" className="font-semibold">Business Address</Label>
                    <Input id="businessAddress" name="businessAddress" value={producerFormData.businessAddress} onChange={handleProducerInputChange} placeholder="Full Business Address" required />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson" className="font-semibold">Contact Person</Label>
                    <Input id="contactPerson" name="contactPerson" value={producerFormData.contactPerson} onChange={handleProducerInputChange} placeholder="Contact Person Name" required />
                  </div>
                  <div>
                    <Label htmlFor="website" className="font-semibold">Website (Optional)</Label>
                    <Input id="website" name="website" type="url" value={producerFormData.website} onChange={handleProducerInputChange} placeholder="https://yourcompany.com" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Upload Documents</h3>
                    <p className="text-sm text-gray-600">Please upload relevant certification documents (e.g., green hydrogen production certificate, facility audit reports, legal registration documents). Provide direct URLs to your documents.</p>
                    
                    <div className="flex gap-2">
                      <Input 
                        type="text"
                        placeholder="Document Type (e.g., 'Production Certificate')"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        type="url"
                        placeholder="Document URL (e.g., https://link.to/doc.pdf)"
                        value={documentUrl}
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddDocument} variant="outline" className="shrink-0">
                        <Upload className="h-4 w-4 mr-2" /> Add Document
                      </Button>
                    </div>

                    {documentsToUpload.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-semibold text-gray-700">Documents to be submitted:</p>
                        {documentsToUpload.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <span>{doc.type} - <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Document</a></span>
                            </div>
                            <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveDocument(index)}>
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={producerFormSaving || documentsToUpload.length === 0}>
                    {producerFormSaving ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Application...</>) : "Submit Producer Application"}
                  </Button>
                </form>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;

import { useState } from "react";
import { useUser } from "../context/UserContext";
import { SignOutButton } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Wallet, Factory, Upload, FileText, CheckCircle, XCircle, Package } from "lucide-react"; // Added icons
import { useParams } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel";
// import { skipToken } from "convex/react"; // Removed incorrect import

const ProfilePage = () => {
  const { user, isLoading } = useUser(); // Logged-in user
  const { isSignedIn, userId: loggedInUserId } = useAuth(); // Logged-in user's Clerk ID

  const { userId } = useParams<{ userId: Id<"users"> }>(); // Get user ID from URL for public profile
  const viewingOwnProfile = !userId || (isSignedIn && userId === user?._id);

  const userToDisplay = viewingOwnProfile ? user : useQuery(api.users.getUserProfile, { userId: userId as Id<"users"> });
  const isLoadingUserToDisplay = viewingOwnProfile ? isLoading : userToDisplay === undefined;

  const myProducerApplication = useQuery(
    api.users.getMyProducerApplication,
    !isSignedIn ? "skip" : undefined
  ); // New query, conditionally skipped

  const isProducer = userToDisplay?.role === "producer";
  const producerListings = useQuery(
    api.hydrogen_listings.getProducerListings,
    isProducer && userToDisplay?._id ? { producerId: userToDisplay._id as Id<"users"> } : "skip"
  );

  const transactions = useQuery(api.hydcoin.getTransactions);
  const userToDisplayTransactions = useQuery(
    api.hydcoin.getUserTransactions,
    userToDisplay?._id ? { userId: userToDisplay._id as Id<"users"> } : "skip"
  );

  // New query for seller's own listings
  const myOwnListings = useQuery(
    api.hydrogen_listings.getMyListings,
    viewingOwnProfile && isProducer && userToDisplay?._id ? {} : "skip"
  );

  // Convex mutation for updating user
  const updateUser = useMutation(api.users.updateUser);
  const submitProducerApplication = useMutation(api.users.submitProducerApplication);
  const createListing = useMutation(api.hydrogen_listings.createListing);
  const setPin = useMutation(api.users.setTransactionPin);
  const hashPin = useAction(api.users.hashPin);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [producerFormSaving, setProducerFormSaving] = useState(false);
  const [listingFormSaving, setListingFormSaving] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullname: user?.fullname || "",
    username: user?.username || "",
    image: user?.image || "",
    phone: user?.phone || "",
  });
  const [imagePreview, setImagePreview] = useState(user?.image || "");
  const [producerFormData, setProducerFormData] = useState({
    companyName: myProducerApplication?.producerDetails?.companyName || "",
    registrationNumber: myProducerApplication?.producerDetails?.registrationNumber || "",
    businessAddress: myProducerApplication?.producerDetails?.businessAddress || "",
    contactPerson: myProducerApplication?.producerDetails?.contactPerson || "",
    website: myProducerApplication?.producerDetails?.website || "",
  });
  const [documentsToUpload, setDocumentsToUpload] = useState<
    {
      type: string;
      url: string;
      uploadDate: number;
    }[]
  >(
    myProducerApplication?.documents.map((doc: any) => ({
      type: doc.type,
      url: doc.url,
      uploadDate: doc.uploadDate,
    })) || []
  );

  const [documentType, setDocumentType] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [newListingFormData, setNewListingFormData] = useState({
    quantityKg: 0,
    pricePerKg: 0,
    location: "",
    energySource: "",
    certificationDetails: "",
  });

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

  if (isLoadingUserToDisplay) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-6 text-lg">Loading profile...</p>
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

  const handleNewListingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewListingFormData(prev => ({
      ...prev,
      [name]: name === "quantityKg" || name === "pricePerKg" ? Number(value) : value,
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
    if (!loggedInUserId) return;

    setIsSaving(true);
    try {
      await updateUser({
        clerkId: loggedInUserId,
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
    if (!loggedInUserId) return;
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

  const handleCreateListing = async () => {
    if (!loggedInUserId) return;
    setListingFormSaving(true);
    try {
      await createListing(newListingFormData);
      alert("Hydrogen listing created successfully!");
      // Reset form
      setNewListingFormData({
        quantityKg: 0,
        pricePerKg: 0,
        location: "",
        energySource: "",
        certificationDetails: "",
      });
      // TODO: Refresh listings or show success message
    } catch (error: any) {
      console.error("Error creating listing:", error);
      alert(error.message || "Failed to create listing.");
    } finally {
      setListingFormSaving(false);
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

  const handleSetPin = async () => {
    if (!loggedInUserId) return;
    if (newPin.length !== 4) {
      alert("Transaction PIN must be 4 digits long.");
      return;
    }
    if (newPin !== confirmNewPin) {
      alert("New PIN and confirm PIN do not match.");
      return;
    }

    setIsSettingPin(true);
    try {
      const hashedPin = await hashPin({ pin: newPin });
      await setPin({ hashedPin });
      alert("Transaction PIN set successfully!");
      setNewPin("");
      setConfirmNewPin("");
    } catch (error: any) {
      console.error("Error setting transaction PIN:", error);
      alert(error.message || "Failed to set transaction PIN.");
    } finally {
      setIsSettingPin(false);
    }
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
                <AvatarImage src={userToDisplay?.image} alt="Profile" />
                <AvatarFallback className="text-4xl font-bold bg-white/10 text-white">
                  {userToDisplay?.fullname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{userToDisplay?.fullname || "User"}</h1>
            <p className="text-xl text-sky-100 mb-6">{userToDisplay?.username || "username"}</p>
            <p className="text-lg text-sky-100 mb-8">{userToDisplay?.email}</p>

            <div className="flex flex-wrap justify-center gap-4">
              {viewingOwnProfile && (
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
              )}
              {viewingOwnProfile && (
                <SignOutButton>
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm">
                    🚪 Sign Out
                  </Button>
                </SignOutButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-fit mx-auto h-auto p-1 rounded-xl bg-gray-200 dark:bg-gray-800">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
              <User className="h-5 w-5" /> Profile Details
            </TabsTrigger>
            {viewingOwnProfile && (
              <TabsTrigger value="wallet" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
                <Wallet className="h-5 w-5" /> Wallet
              </TabsTrigger>
            )}
            {viewingOwnProfile && (
              <TabsTrigger value="producer" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
                <Factory className="h-5 w-5" /> Become a Producer
              </TabsTrigger>
            )}
            {isProducer && viewingOwnProfile && (
              <TabsTrigger value="my-listings" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
                <Package className="h-5 w-5" /> My Listings
              </TabsTrigger>
            )}
            {isProducer && !viewingOwnProfile && (
              <TabsTrigger value="producer-transactions" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
                <Wallet className="h-5 w-5" /> Transactions
              </TabsTrigger>
            )}
            {isProducer && !viewingOwnProfile && (
              <TabsTrigger value="listings" className="flex items-center gap-2 py-2 px-4 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-white rounded-lg shadow-sm">
                <Package className="h-5 w-5" /> Listings
              </TabsTrigger>
            )}
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
                      <p className="text-lg font-semibold text-gray-900">{userToDisplay?.fullname || "Not set"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏷️</span>
                      <span className="text-sm font-medium text-gray-600">Username</span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-lg font-semibold text-gray-900">@{userToDisplay?.username || "Not set"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📧</span>
                      <span className="text-sm font-medium text-gray-600">Email</span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-lg font-semibold text-gray-900">{userToDisplay?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📱</span>
                      <span className="text-sm font-medium text-gray-600">Phone Number</span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-lg font-semibold text-gray-900">{userToDisplay?.phone || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Producer Information (if applicable) */}
              {isProducer && userToDisplay?.organization && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">🏢</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Producer Information</h2>
                  </div>

                  <div className="space-y-4">
                    {userToDisplay?.companyName && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💼</span>
                          <span className="text-sm font-medium text-gray-600">Company Name</span>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-lg font-semibold text-gray-900">{userToDisplay.companyName}</p>
                        </div>
                      </div>
                    )}
                    {userToDisplay?.organization && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏛️</span>
                          <span className="text-sm font-medium text-gray-600">Organization</span>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-lg font-semibold text-gray-900">{userToDisplay.organization}</p>
                        </div>
                      </div>
                    )}
                    {userToDisplay?.email && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📧</span>
                          <span className="text-sm font-medium text-gray-600">Email</span>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-lg font-semibold text-gray-900">{userToDisplay.email}</p>
                        </div>
                      </div>
                    )}
                    {userToDisplay?.phone && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📱</span>
                          <span className="text-sm font-medium text-gray-600">Phone</span>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-lg font-semibold text-gray-900">{userToDisplay.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                      <p className="text-lg font-semibold text-gray-900 capitalize">{userToDisplay?.role || "Not assigned"}</p>
                    </div>
                    <span className="text-2xl">🎭</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Verification Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userToDisplay?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {userToDisplay?.verified ? '✅ Verified' : '⏳ Pending Verification'}
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

          {viewingOwnProfile && (
            <TabsContent value="wallet" className="mt-8">
              {/* Transaction PIN Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction PIN</h2>
                <p className="text-gray-600 mb-6">Set or change your 4-digit transaction PIN for secure Hydcoin payments.</p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newPin" className="font-semibold">New PIN (4 digits)</Label>
                    <Input
                      id="newPin"
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="mt-1 w-full max-w-xs text-lg text-center tracking-widest"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmNewPin" className="font-semibold">Confirm New PIN</Label>
                    <Input
                      id="confirmNewPin"
                      type="password"
                      maxLength={4}
                      value={confirmNewPin}
                      onChange={(e) => setConfirmNewPin(e.target.value)}
                      className="mt-1 w-full max-w-xs text-lg text-center tracking-widest"
                    />
                  </div>
                  <Button onClick={handleSetPin} disabled={isSettingPin || newPin.length !== 4 || newPin !== confirmNewPin} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSettingPin ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Setting PIN...</>) : "Set / Change PIN"}
                  </Button>
                </div>
              </div>
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
                    [...new Map(transactions.map((tx: any) => [tx._id, tx])).values()].map(
                      (tx: any) => (
                        <div
                          key={tx._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div>
                            <p className="text-lg font-semibold text-gray-900 capitalize">
                              {tx.type === "purchase"
                                ? "Hydcoin Purchase"
                                : `Transfer to @${tx.toUsername}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(tx._creationTime).toLocaleString()}
                            </p>
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              tx.currentUserIsSender
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {tx.currentUserIsSender ? "-" : "+"}
                            {tx.amount} Hydcoin
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      No transactions yet.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {isProducer && !viewingOwnProfile && (
            <TabsContent value="producer-transactions" className="mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction History for {userToDisplay?.fullname || "This Seller"}</h2>
                <div className="space-y-4">
                  {userToDisplayTransactions === undefined ? (
                    <div className="text-center py-8"><Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" /><p className="text-gray-600">Loading transactions...</p></div>
                  ) : userToDisplayTransactions.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No transactions found for this seller.</p>
                  ) : (
                    <div className="space-y-4">
                      {userToDisplayTransactions.map((tx: any) => (
                        <div key={tx._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-lg font-semibold text-gray-900 capitalize">
                              {tx.type === 'purchase' ? 'Hydrogen Purchase' : `Transfer to @${tx.toUsername}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(tx._creationTime).toLocaleString()}
                            </p>
                          </div>
                          <div className={`text-lg font-bold ${tx.isProfileOwnerSender ? 'text-red-500' : 'text-green-500'}`}>
                            {tx.isProfileOwnerSender ? '-' : '+'}{tx.amount} Hydcoin
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {viewingOwnProfile && (
            <TabsContent value="producer" className="mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Green Hydrogen Producer</h2>
                <p className="text-gray-600 mb-6">Apply to become a verified producer and issue your own green hydrogen credits on the platform. Please fill out the details below and upload the required documents.</p>
                
                {myProducerApplication === undefined ? (
                  <div className="text-center py-8"><Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" /><p className="text-gray-600">Loading application status...</p></div>
                ) : myProducerApplication?.status === "approved" && viewingOwnProfile ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application Approved!</h3>
                    <p className="text-gray-600">Congratulations! You are now a verified Green Hydrogen Producer.</p>
                    {/* Display producer details */}
                    {myProducerApplication.producerDetails && (
                      <div className="mt-6 text-left inline-block bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold">Company Name: <span className="font-normal">{myProducerApplication.producerDetails.companyName}</span></p>
                        <p className="font-semibold">Registration No.: <span className="font-normal">{myProducerApplication.producerDetails.registrationNumber}</span></p>
                        <p className="font-semibold">Contact Person: <span className="font-normal">{myProducerApplication.producerDetails.contactPerson}</span></p>
                        <p className="font-semibold">Website: <span className="font-normal">{myProducerApplication.producerDetails.website || 'N/A'}</span></p>
                      </div>
                    )}
                    {myProducerApplication.documents && myProducerApplication.documents.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-semibold text-gray-700">Submitted Documents:</p>
                        {myProducerApplication.documents.map((doc: any, index: any) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <span>{doc.type} - <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Document</a></span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === "verified" ? "bg-green-100 text-green-800" : doc.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                                {doc.status.replace("_", " ").charAt(0).toUpperCase() + doc.status.replace("_", " ").slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : myProducerApplication?.status === "pending" && viewingOwnProfile ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application Pending Review</h3>
                    <p className="text-gray-600">Your application is currently being reviewed by our team. We will notify you once a decision has been made.</p>
                    {/* Display submitted producer details */}
                    {myProducerApplication.producerDetails && (
                      <div className="mt-6 text-left inline-block bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold">Company Name: <span className="font-normal">{myProducerApplication.producerDetails.companyName}</span></p>
                        <p className="font-semibold">Registration No.: <span className="font-normal">{myProducerApplication.producerDetails.registrationNumber}</span></p>
                        <p className="font-semibold">Contact Person: <span className="font-normal">{myProducerApplication.producerDetails.contactPerson}</span></p>
                        <p className="font-semibold">Website: <span className="font-normal">{myProducerApplication.producerDetails.website || 'N/A'}</span></p>
                      </div>
                    )}
                    {myProducerApplication.documents && myProducerApplication.documents.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-semibold text-gray-700">Submitted Documents:</p>
                        {myProducerApplication.documents.map((doc: any, index: any) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <span>{doc.type} - <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Document</a></span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === "verified" ? "bg-green-100 text-green-800" : doc.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                                {doc.status.replace("_", " ").charAt(0).toUpperCase() + doc.status.replace("_", " ").slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : myProducerApplication?.status === "rejected" && viewingOwnProfile ? (
                  <div className="text-center py-8">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application Rejected</h3>
                    <p className="text-gray-600">Unfortunately, your application was not approved. Please review the requirements and reapply if necessary.</p>
                    {myProducerApplication.reviewNotes && (
                      <p className="text-red-700 mt-4"><strong>Reviewer Notes:</strong> {myProducerApplication.reviewNotes}</p>
                    )}
                  </div>
                ) : viewingOwnProfile ? (
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
                ) : (
                  <div className="text-center py-8">
                    <Factory className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Not a Seller</h3>
                    <p className="text-gray-600">This user is not a registered seller or their application is not public.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {viewingOwnProfile && isProducer && (
            <TabsContent value="my-listings" className="mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Hydrogen Listings</h2>

                {/* Form to create new listing */}
                <form onSubmit={(e) => { e.preventDefault(); handleCreateListing(); }} className="space-y-4 mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900">Create New Listing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantityKg" className="font-semibold">Quantity (kg)</Label>
                      <Input
                        id="quantityKg"
                        name="quantityKg"
                        type="number"
                        value={newListingFormData.quantityKg}
                        onChange={handleNewListingInputChange}
                        placeholder="e.g., 1000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerKg" className="font-semibold">Price per kg (Hydcoin)</Label>
                      <Input
                        id="pricePerKg"
                        name="pricePerKg"
                        type="number"
                        value={newListingFormData.pricePerKg}
                        onChange={handleNewListingInputChange}
                        placeholder="e.g., 50"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location" className="font-semibold">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      value={newListingFormData.location}
                      onChange={handleNewListingInputChange}
                      placeholder="e.g., Gujarat, India"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="energySource" className="font-semibold">Energy Source</Label>
                    <Input
                      id="energySource"
                      name="energySource"
                      type="text"
                      value={newListingFormData.energySource}
                      onChange={handleNewListingInputChange}
                      placeholder="e.g., Solar, Wind, Hydro"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificationDetails" className="font-semibold">Certification Details (Optional)</Label>
                    <Input
                      id="certificationDetails"
                      name="certificationDetails"
                      type="text"
                      value={newListingFormData.certificationDetails}
                      onChange={handleNewListingInputChange}
                      placeholder="e.g., ISO 14064 Certified"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={listingFormSaving}>
                    {listingFormSaving ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Listing...</>) : "Create Hydrogen Listing"}
                  </Button>
                </form>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Active Listings</h3>
                {myOwnListings === undefined ? (
                  <div className="text-center py-8"><Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" /><p className="text-gray-600">Loading your listings...</p></div>
                ) : myOwnListings.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">You have no active hydrogen listings.</p>
                ) : (
                  <div className="space-y-4">
                    {myOwnListings.map((listing: any) => (
                      <div key={listing._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{listing.quantityKg} kg Green Hydrogen</p>
                          <p className="text-sm text-gray-600">Price: {listing.pricePerKg} Hydcoin/kg</p>
                          <p className="text-xs text-gray-500">Location: {listing.location}</p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {listing.listingStatus.charAt(0).toUpperCase() + listing.listingStatus.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {isProducer && !viewingOwnProfile && (
            <TabsContent value="listings" className="mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hydrogen Listings by {userToDisplay?.fullname || "This Seller"}</h2>
                {producerListings === undefined ? (
                  <div className="text-center py-8"><Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" /><p className="text-gray-600">Loading listings...</p></div>
                ) : producerListings.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No active hydrogen listings found for this seller.</p>
                ) : (
                  <div className="space-y-4">
                    {producerListings.map((listing: any) => (
                      <div key={listing._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{listing.quantityKg} kg Green Hydrogen</p>
                          <p className="text-sm text-gray-600">Price: {listing.pricePerKg} Hydcoin/kg</p>
                          <p className="text-xs text-gray-500">Location: {listing.location}</p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {listing.listingStatus.charAt(0).toUpperCase() + listing.listingStatus.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;

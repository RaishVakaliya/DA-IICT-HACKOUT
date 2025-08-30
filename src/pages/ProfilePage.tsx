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

const ProfilePage = () => {
  const { user, isLoading } = useUser();
  const { isSignedIn, userId } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const transactions = useQuery(api.hydcoin.getTransactions);

  // Convex mutation for updating user
  const updateUser = useMutation(api.users.updateUser);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    username: user?.username || "",
    image: user?.image || "",
    phone: user?.phone || "",
  });
  const [imagePreview, setImagePreview] = useState(user?.image || "");

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update image preview when image URL changes
    if (name === 'image') {
      setImagePreview(value);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      await updateUser({
        clerkId: userId,
        fullname: formData.fullname,
        username: formData.username,
        image: formData.image,
        phone: formData.phone,
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

  const handleCancel = () => {
    setFormData({
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
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
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
            <p className="text-xl text-blue-100 mb-6">@{user?.username || "username"}</p>
            <p className="text-lg text-blue-100 mb-8">{user?.email}</p>
            
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
                        value={formData.image}
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
                        value={formData.fullname}
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
                         value={formData.username}
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
                         value={formData.phone}
                         onChange={handleInputChange}
                         className="w-full"
                       />
                     </div>
                   </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  🚪 Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Profile Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.fullname || "Not set"}</p>
                </div>
                <span className="text-2xl">👤</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Username</p>
                  <p className="text-lg font-semibold text-gray-900">@{user?.username || "Not set"}</p>
                </div>
                <span className="text-2xl">🏷️</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                </div>
                <span className="text-2xl">📧</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Phone Number</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.phone || "Not set"}</p>
                </div>
                <span className="text-2xl">📱</span>
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
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
      </div>

      {/* Transaction History Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📜</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          </div>

          <div className="space-y-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
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
      </div>
    </div>
  );
};

export default ProfilePage;

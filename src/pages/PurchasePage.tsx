import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react"; // Import useMutation
import { useAuth } from "@clerk/clerk-react"; // Import useAuth

const PurchasePage = () => {
  const { listingId } = useParams<{ listingId: Id<"hydrogen_listings"> }>();
  const navigate = useNavigate();
  const { userId: loggedInUserId } = useAuth(); // Get logged-in user ID
  const currentUser = useQuery(api.users.getUserByClerkId, loggedInUserId ? { clerkId: loggedInUserId } : "skip"); // Query for Convex user
  const listing = useQuery(api.hydrogen_listings.getListingById, listingId ? { listingId } : "skip");

  const [quantityToPurchase, setQuantityToPurchase] = useState(1);
  const [transactionPin, setTransactionPin] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  // const pay = useAction(api.stripe.pay); // Removed Stripe integration
  const buyListing = useMutation(api.hydrogen_listings.buyHydrogenListing); // New mutation
  const verifyTransactionPin = useAction(api.users.verifyTransactionPin); // Use the public action

  useEffect(() => {
    if (listing && quantityToPurchase === 0 && listing.quantityKg > 0) {
      setQuantityToPurchase(1);
    }
  }, [listing, quantityToPurchase]);

  const handlePurchase = async () => {
    if (!listing || quantityToPurchase <= 0) return;

    setIsPurchasing(true);
    try {
      if (!loggedInUserId || !currentUser) {
        alert("You must be logged in to make a purchase.");
        setIsPurchasing(false);
        return;
      }

      const isPinValid = await verifyTransactionPin({
        userId: currentUser._id, // Pass Convex user ID
        pin: transactionPin,
      });

      if (!isPinValid) {
        alert("Invalid transaction PIN.");
        setIsPurchasing(false);
        return;
      }

      const result = await buyListing({
        listingId: listing._id,
        quantity: quantityToPurchase,
        transactionPin,
        isPinVerified: isPinValid, // Pass the verification result
      });
      if (result.success) {
        alert("Purchase successful!");
        navigate("/wallet"); // Redirect to wallet or a success page
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      console.error("Purchase failed:", error);
      alert(error.message || "There was an error with your Hydcoin purchase.");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (listingId === undefined || listingId === "skip") {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Card className="shadow-lg text-center">
            <CardHeader>
              <CardTitle>Listing Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No listing ID provided. Please go back to the registry.</p>
              <Button onClick={() => navigate("/registry")} className="mt-4">Go to Registry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (listing === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 flex items-center justify-center">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
        <p className="text-gray-600 ml-4">Loading listing details...</p>
      </div>
    );
  }

  if (listing === null) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Card className="shadow-lg text-center">
            <CardHeader>
              <CardTitle>Listing Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The hydrogen listing you are looking for does not exist.</p>
              <Button onClick={() => navigate("/registry")} className="mt-4">Go to Registry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const availableQuantity = listing.quantityKg;
  const totalPrice = (quantityToPurchase * listing.pricePerKg).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Purchase Hydrogen</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Complete your secure purchase of green hydrogen.</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Listing Details</CardTitle>
            <CardDescription>
              Listing ID: {listing._id}
              <p className="font-semibold text-gray-700">Seller: <a href={`/profile/${listing.producerDetails?._id}`} className="text-blue-600 hover:underline">{listing.producerDetails?.companyName || listing.producerDetails?.fullname || "N/A"}</a></p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-gray-700"><span className="font-semibold">Quantity:</span> {listing.quantityKg} kg available</p>
                <p className="text-gray-700"><span className="font-semibold">Price per kg:</span> {listing.pricePerKg} Hydcoin</p>
                <p className="text-gray-700"><span className="font-semibold">Location:</span> {listing.location}</p>
                <p className="text-gray-700"><span className="font-semibold">Energy Source:</span> {listing.energySource}</p>
                {listing.certificationDetails && <p className="text-gray-700"><span className="font-semibold">Certification:</span> {listing.certificationDetails}</p>}
                <p className="text-gray-700"><span className="font-semibold">Listed On:</span> {new Date(listing.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantityToPurchase" className="font-semibold">Quantity to Purchase (kg)</Label>
                  <Input
                    id="quantityToPurchase"
                    type="number"
                    min="1"
                    max={availableQuantity}
                    value={quantityToPurchase}
                    onChange={(e) => setQuantityToPurchase(Math.max(1, Math.min(availableQuantity, Number(e.target.value))))}
                    className="mt-1 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="transactionPin" className="font-semibold">Transaction PIN</Label>
                  <Input
                    id="transactionPin"
                    type="password"
                    minLength={4}
                    maxLength={4}
                    value={transactionPin}
                    onChange={(e) => setTransactionPin(e.target.value)}
                    className="mt-1 text-lg"
                  />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Cost</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalPrice} Hydcoin</p>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || quantityToPurchase > availableQuantity || quantityToPurchase <= 0 || transactionPin.length !== 4}
                  className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isPurchasing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Proceed to Checkout"}
                </Button>
                {/* <p className="text-xs text-center text-gray-500 dark:text-gray-400">You will be redirected to Stripe to complete your purchase securely.</p> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchasePage;

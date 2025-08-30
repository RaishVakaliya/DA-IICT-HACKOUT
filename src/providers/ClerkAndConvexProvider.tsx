import { ClerkLoaded, useAuth, ClerkProvider } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL, {
  unsavedChangesWarning: false,
});

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function ClerkAndConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkLoaded>{children}</ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
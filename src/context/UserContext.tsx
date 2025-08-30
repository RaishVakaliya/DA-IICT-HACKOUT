import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser as useClerkUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type UserContextType = {
  user: any | null;
  isLoading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, userId } = useAuth();
  const { user: clerkUser, isLoaded: isClerkUserLoaded } = useClerkUser();
  const createUser = useMutation(api.users.createUser);
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    isSignedIn ? { clerkId: userId! } : "skip"
  );

  useEffect(() => {
    const syncUser = async () => {
      setError(null);
      
      if (!isSignedIn || !userId || !isClerkUserLoaded || !clerkUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        if (convexUser === undefined) {
          // Still loading
          setIsLoading(true);
          return;
        }

        if (convexUser === null) {
          // User doesn't exist in Convex, create them
          try {
            const newUserId = await createUser({
              clerkId: userId,
              email: clerkUser.emailAddresses[0]?.emailAddress || "",
              fullname: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
              username: clerkUser.username || `user_${Date.now()}`,
              image: clerkUser.imageUrl,
            });
            
            // Set a temporary user object while we wait for the query to update
            setUser({
              _id: newUserId,
              clerkId: userId,
              email: clerkUser.emailAddresses[0]?.emailAddress || "",
              fullname: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
              username: clerkUser.username || `user_${Date.now()}`,
              image: clerkUser.imageUrl,
              role: "buyer", // Default role
              posts: 0, // Default posts count
              searchable: true, // Default to searchable
            });
          } catch (createError) {
            console.error("Error creating user:", createError);
            setError("Failed to create user profile");
          }
        } else {
          // User exists in Convex
          setUser(convexUser);
        }
      } catch (error) {
        console.error("Error syncing user:", error);
        setError(error instanceof Error ? error.message : "Failed to sync user");
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [isSignedIn, userId, convexUser, createUser, clerkUser, isClerkUserLoaded, user]);

  return (
    <UserContext.Provider value={{ user, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
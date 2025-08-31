import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConvexAuth } from "convex/react";

const AdminPage = () => {
  const isAuthorized = useQuery(
    api.users.isCertifierOrAdmin,
    !useConvexAuth().isAuthenticated ? "skip" : undefined
  ); // Check admin or certifier status
  const isAdmin = useQuery(api.users.isAdminUser);
  const allUsers = useQuery(api.users.getAllUsers);
  const assignRole = useMutation(api.users.assignRole);


  // Handle access control
  if (isAuthorized === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        <p className="ml-4 text-gray-600 dark:text-gray-300">Loading admin status...</p>
      </div>
    );
  }

  if (!isAuthorized) {
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

  return (
    <div className="container mx-auto py-10 pt-20">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Manage user roles.</p>
      </header>


      {isAdmin && (
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Manage User Roles</CardTitle>
            <CardDescription>Assign roles to users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allUsers?.map((user: any) => (
                <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{user.fullname}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(role) =>
                      assignRole({
                        userId: user._id,
                        role: role as any,
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="producer">Producer</SelectItem>
                      <SelectItem value="certifier">Certifier</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="regulator">Regulator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default AdminPage;

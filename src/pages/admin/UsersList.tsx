import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/apiClient";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "@/lib/utils";

interface UserRow {
  id: string;
  email: string;
  phone?: string | null;
  subscriptionStatus?: string | null;
  listingsCount: number;
  role: string;
  createdAt: string;
  lastActiveAt?: string | null;
  isOnline: boolean;
}

const UsersList: FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/admin/users");
        const list: UserRow[] = res.data?.data || res.data;
        setData(list);
      } catch (err: any) {
        const maybe =
          err.response?.data?.error ?? err.message ?? err.toString();
        setError(typeof maybe === "string" ? maybe : JSON.stringify(maybe));
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "ADMIN") {
      fetchUsers();
    } else {
      navigate("/login", { state: { from: "/admin/users" } });
    }
  }, [isAuthenticated, user, navigate]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };



  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  if (isLoading) {
    return (
      <div className="flex justify-center mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          {error}
          <Button variant="ghost" size="sm" onClick={() => setError("")} className="ml-auto">
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </Alert>
      </div>
    );
  }

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Subscription</th>
                <th className="text-right p-4 font-medium">Listings</th>
                <th className="text-left p-4 font-medium">Created At</th>
                <th className="text-left p-4 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            u.isOnline ? "bg-green-500" : "bg-gray-400"
                          )}
                        />
                        <span>{u.isOnline ? "Online" : "Offline"}</span>
                        {!u.isOnline && u.lastActiveAt && (
                          <span className="text-xs text-muted-foreground">
                            (Last seen: {new Date(u.lastActiveAt).toLocaleString()})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{u.phone || "-"}</td>
                    <td className="p-4">
                      <span className="text-sm">{u.subscriptionStatus || "INACTIVE"}</span>
                    </td>
                    <td className="p-4 text-right">{u.listingsCount}</td>
                    <td className="p-4">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Select
                      value={u.role}
                      onValueChange={async (newRole) => {
                        const prev = u.role;
                        // optimistic update
                        setData((prevData) =>
                          prevData.map((item) =>
                            item.id === u.id
                              ? { ...item, role: newRole }
                              : item,
                          ),
                        );
                        try {
                          await apiClient.put(`/admin/users/${u.id}/role`, {
                            role: newRole,
                          });
                        } catch (err: any) {
                          // revert
                          setData((prevData) =>
                            prevData.map((item) =>
                              item.id === u.id
                                ? { ...item, role: prev }
                                : item,
                            ),
                          );
                          const maybe =
                            err.response?.data?.error ?? err.message;
                          setError(
                            typeof maybe === "string"
                              ? maybe
                              : JSON.stringify(maybe),
                          );
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "FREE_USER",
                          "PREMIUM_USER",
                          "BUSINESS_USER",
                          "ADMIN",
                          "MODERATOR",
                        ].map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </td>
                  </tr>
                ))}
              {emptyRows > 0 && (
                <tr style={{ height: 53 * emptyRows }}>
                  <td colSpan={7} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            {data.length === 0 ? 'No users' : `Showing ${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, data.length)} of ${data.length}`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(null, page - 1)}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page + 1} of {Math.ceil(data.length / rowsPerPage)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(null, page + 1)}
              disabled={(page + 1) * rowsPerPage >= data.length}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList;

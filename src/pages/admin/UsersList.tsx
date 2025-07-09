import { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Alert,
  AlertTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/apiClient";
import { useAuth } from "../../hooks/useAuth";

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

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" onClose={() => setError("")}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Subscription</TableCell>
              <TableCell align="right">Listings</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box
                        width={10}
                        height={10}
                        borderRadius="50%"
                        bgcolor={u.isOnline ? "success.main" : "grey.500"}
                        mr={1}
                      />
                      {u.isOnline ? "Online" : "Offline"}
                      {!u.isOnline && u.lastActiveAt && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          ml={1}
                        >
                          (Last seen:{" "}
                          {new Date(u.lastActiveAt).toLocaleString()})
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{u.phone || "-"}</TableCell>
                  <TableCell>{u.subscriptionStatus || "INACTIVE"}</TableCell>
                  <TableCell align="right">{u.listingsCount}</TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={u.role}
                        onChange={async (e) => {
                          const newRole = e.target.value as string;
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
                        {[
                          "FREE_USER",
                          "PREMIUM_USER",
                          "BUSINESS_USER",
                          "ADMIN",
                          "MODERATOR",
                        ].map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
};

export default UsersList;

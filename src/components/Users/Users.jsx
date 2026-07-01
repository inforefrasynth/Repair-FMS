import React, { useEffect, useState } from "react";
import { Plus, Search, Loader2Icon, ShieldAlert } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/Table";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loaderSubmit, setLoaderSubmit] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [firmName, setFirmName] = useState("Pmmpl");
  const [selectedPages, setSelectedPages] = useState({
    Dashboard: true,
    Indent: true,
    "Sent to Vendor": false,
    "Check Machin": false,
    "Store In": false,
    "Make Payment": false,
  });

  const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL;
  const SHEET_Id = import.meta.env.VITE_SHEET_ID;

  const pageOptions = [
    { key: "Dashboard", label: "Dashboard" },
    { key: "Indent", label: "Indent" },
    { key: "Sent to Vendor", label: "Sent to Vendor" },
    { key: "Check Machin", label: "Check Machine" },
    { key: "Store In", label: "Store In" },
    { key: "Make Payment", label: "Make Payment" },
  ];

  const firmOptions = ["All", "Pmmpl", "Purab", "Rkl", "Refrasynth", "Refratech"];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=Repair Login`
      );
      const result = await res.json();

      if (result.success && result.table && result.table.rows) {
        const mappedUsers = result.table.rows.map((row, idx) => {
          const cells = row.c || [];
          return {
            id: `user-${idx}`,
            username: (cells[0]?.v || "").toString().trim(),
            password: (cells[1]?.v || "").toString().trim(),
            role: (cells[2]?.v || "").toString().trim(),
            access: (cells[3]?.v || "").toString().trim(),
            firmName: (cells[4]?.v || "").toString().trim() || "N/A",
          };
        }).filter(u => u.username !== ""); // Filter out empty rows

        setUsers(mappedUsers);
      } else {
        console.error("Failed to load users:", result.message);
        toast.error("❌ Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("❌ Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageAccessChange = (pageKey) => {
    setSelectedPages((prev) => ({
      ...prev,
      [pageKey]: !prev[pageKey],
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("❌ Username and Password are required");
      return;
    }

    // Build comma-separated page access list
    const accessList = Object.entries(selectedPages)
      .filter(([_, allowed]) => allowed)
      .map(([pageKey]) => pageKey)
      .join(", ");

    try {
      setLoaderSubmit(true);

      const formPayload = new FormData();
      formPayload.append("sheetName", "Repair Login");
      formPayload.append("action", "insert");

      const userData = {
        "User Name": username.trim(),
        Password: password.trim(),
        Role: role,
        "Page Access": accessList,
        "Firm Name": firmName,
      };

      Object.entries(userData).forEach(([key, val]) => {
        formPayload.append(key, val);
      });

      const response = await fetch(`${SCRIPT_URL}?headerRow=1`, {
        method: "POST",
        body: formPayload,
      });

      const result = await response.json();

      if (result.success || response.ok) {
        toast.success("✅ User created successfully!");
        
        // Reset states
        setUsername("");
        setPassword("");
        setRole("user");
        setFirmName("Pmmpl");
        setSelectedPages({
          Dashboard: true,
          Indent: true,
          "Sent to Vendor": false,
          "Check Machin": false,
          "Store In": false,
          "Make Payment": false,
        });

        setIsModalOpen(false);
        fetchUsers();
      } else {
        throw new Error(result.message || "Failed to save user");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("❌ Failed to add user");
    } finally {
      setLoaderSubmit(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      user.firmName.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by username, firm name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">User Name</TableHead>
                <TableHead className="min-w-[150px]">Password</TableHead>
                <TableHead className="min-w-[120px]">Role</TableHead>
                <TableHead className="min-w-[150px]">Firm Name</TableHead>
                <TableHead className="min-w-[250px]">Page Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2Icon className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin text-blue-500" />
                      <p className="mt-4 text-gray-600">Loading users list...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-gray-500">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-gray-800">
                      {u.username}
                    </TableCell>
                    <TableCell className="font-mono text-gray-600">
                      {u.password}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {u.firmName}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-[300px] break-words">
                      {u.access}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          {/* User Name */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username *
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Subhash"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <input
              type="text"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. Subhash123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full py-2 rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Firm Name */}
          <div>
            <label
              htmlFor="firmName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Firm Name
            </label>
            <select
              id="firmName"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="w-full py-2 rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {firmOptions.map((firm) => (
                <option key={firm} value={firm}>
                  {firm}
                </option>
              ))}
            </select>
          </div>

          {/* Page Access */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Access
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {pageOptions.map((opt) => (
                <label key={opt.key} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPages[opt.key]}
                    onChange={() => handlePageAccessChange(opt.key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loaderSubmit}>
              {loaderSubmit && <Loader2Icon className="animate-spin mr-2" />}
              Save User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;

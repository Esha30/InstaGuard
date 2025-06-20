"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MdDeleteForever } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";

interface User {
  _id: string;
  fullname: string;
  email: string;
  role: string;
  isVerified: boolean;
  mobile: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/get-all-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched users:", res.data.users);
      setUsers(res.data.users || []);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/delete-user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error deleting user');
      }

      console.log('User deleted successfully');
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      setMessage("User deleted successfully!");

      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError("Failed to delete user!");
      setTimeout(() => setError(null), 5000);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading users...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="bg-gradient-to-b from-white to-pink-100 py-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <FaUserShield size={48} className="text-pink-600 mx-auto mb-4" />
          <h1 className="section-title py-4">Manage Users</h1>
          <p className="section-description py-2">
            Admin can manage user accounts, including deletion and verification.
          </p>
        </motion.div>

        {/* Feedback Messages */}
        {message && (
          <div className="mt-4 p-3 bg-green-600 text-white rounded-md text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-600 text-white rounded-md text-center">
            {error}
          </div>
        )}

        {/* User Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white shadow-md rounded-2xl p-6 border hover:shadow-xl transition"
            >
              <h2 className="text-lg font-semibold">{user.fullname}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="mt-2 text-sm">
                Role:{" "}
                <span className="font-medium capitalize text-pink-600">
                  {user.role}
                </span>
              </p>
              <p className="text-sm">
                Status:{" "}
                <span className={user.isVerified ? "text-green-600" : "text-red-500"}>
                  {user.isVerified ? "Verified ✅" : "Not Verified ❌"}
                </span>
              </p>

              <button
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-md flex items-center justify-center gap-2 transition"
                onClick={() => handleDeleteUser(user._id)}
              >
                <MdDeleteForever className="text-xl" />
                Delete User
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { User } from "lucide-react";

interface UserProfile {
  _id: string;
  fullname: string;
  email: string;
  mobile: string;
  role: string;
  isVerified: boolean;
}

export default function ViewProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Authorization token is missing!");
      return;
    }

    axios
      .get("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProfiles(res.data.users || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user profiles", err);
        setError("Failed to fetch user profiles!");
        setLoading(false);
      });
  }, []);

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
          <User size={48} className="text-pink-600 mx-auto mb-4" />
          <h1 className="section-title py-4">All User Profiles</h1>
          <p className="section-description py-2">
            Admin can view the list of all registered users in the system.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-600 text-white rounded-md text-center">
            {error}
          </div>
        )}

        {/* Table or Loading State */}
        {loading ? (
          <p className="text-gray-500 text-center">Loading profiles...</p>
        ) : profiles.length === 0 ? (
          <p className="text-gray-500 text-center">No user profiles found.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow border border-pink-200 mt-6">
            <table className="min-w-full bg-white">
              <thead className="bg-pink-100 text-purple-700 text-left text-sm font-semibold">
                <tr>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Verified</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="border-t hover:bg-rose-50 text-sm"
                  >
                    <td className="p-3">{user.fullname}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.mobile}</td>
                    <td className="p-3 capitalize text-pink-600 font-medium">{user.role}</td>
                    <td className="p-3">
                      <span
                        className={
                          user.isVerified ? "text-green-600 font-medium" : "text-red-500 font-medium"
                        }
                      >
                        {user.isVerified ? "Verified ✅" : "Not Verified ❌"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

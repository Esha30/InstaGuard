"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import cogImage from "@/assets/cog.png";
import { TiUser } from "react-icons/ti";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

interface User {
  fullname: string;
  email: string;
  role: string;
}

const AdminProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false); // loading for password update

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/user-info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching user info. Please try again.");
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handlePasswordUpdate = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setUpdateLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPasswordError("No token found");
        setUpdateLoading(false);
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/update-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPasswordSuccess("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordError(response.data.message || "Error updating password.");
      }
    } catch (error) {
      setPasswordError("Error updating password. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 relative">
      <motion.h1 className="section-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        Welcome back, {user?.fullname || "User"} 👋
      </motion.h1>
      <p className="section-description py-2">Your personalized dashboard overview</p>

      {/* Cog Image */}
      <motion.div
  className="absolute bottom-4 left-4 hidden md:block"
  initial={{ rotate: 0, opacity: 0.5 }}
  animate={{ rotate: 360, opacity: 1, scale: 1.2 }}
  transition={{ loop: Infinity, duration: 10, ease: "linear" }}
  whileHover={{ scale: 1.3, opacity: 0.9 }}
>
  <Image src={cogImage} alt="Cog" width={100} height={100} />
</motion.div>


      {/* Info Section */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 py-6">
  {/* Role Card */}
  <motion.div
    className="bg-white border-l-4 border-purple-500 p-5 sm:p-6 rounded-2xl shadow hover:shadow-md transition duration-300"
    whileHover={{ scale: 1.03 }}
  >
    <div className="flex items-center space-x-4">
      <div className="text-purple-500 text-2xl sm:text-3xl">
        <TiUser />
      </div>
      <div>
        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Your Role</p>
        <p className="text-base sm:text-lg font-semibold text-gray-600">{user?.role || "User"}</p>
      </div>
    </div>
  </motion.div>

  {/* Email Card */}
  <motion.div
    className="bg-white border-l-4 border-green-500 p-5 sm:p-6 rounded-2xl shadow hover:shadow-md transition duration-300"
    whileHover={{ scale: 1.03 }}
  >
    <div className="flex items-center space-x-4">
      <div className="text-green-500 text-2xl sm:text-3xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 sm:w-7 h-6 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l4-4m-4 4l4 4" />
        </svg>
      </div>
      <div>
        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Email Address</p>
        <p className="text-base sm:text-lg font-semibold text-gray-600">{user?.email || "user@example.com"}</p>
      </div>
    </div>
  </motion.div>

  {/* Verified Card */}
  <motion.div
    className="bg-white border-l-4 border-blue-500 p-5 sm:p-6 rounded-2xl shadow hover:shadow-md transition duration-300"
    whileHover={{ scale: 1.03 }}
  >
    <div className="flex items-center space-x-4">
      <div className="text-blue-500 text-2xl sm:text-3xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 sm:w-7 h-6 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Account Status</p>
        <p className="text-base sm:text-lg font-semibold text-gray-600">Verified ✅</p>
      </div>
    </div>
  </motion.div>
</div>


      {/* Change Password Card */}
      {user?.role === "admin" && (
        <>
          {/* Success & Error messages above the form */}
          <div className="max-w-2xl mx-auto mb-4">
            {passwordSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                role="alert"
              >
                {passwordSuccess}
              </motion.div>
            )}
            {passwordError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                {passwordError}
              </motion.div>
            )}
          </div>

          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordUpdate();
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6 max-w-2xl mx-auto"
          >
            <h3 className="section-title py-2">Change Your Password</h3>

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  disabled={updateLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  disabled={updateLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showNewPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  disabled={updateLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showConfirmNewPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateLoading}
              className={`w-full rounded-2xl py-3 font-semibold text-white ${
                updateLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:brightness-110 transition"
              }`}
            >
              {updateLoading ? "Updating..." : "Update Password"}
            </button>
          </motion.form>
        </>
      )}
    </div>
  );
};

export default AdminProfile;

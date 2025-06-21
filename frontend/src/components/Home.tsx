"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { TiUser } from "react-icons/ti";
import { useRouter } from "next/navigation";
import tubeImage from "@/assets/tube.png";

interface User {
  fullname: string;
  email: string;
  role: string;
}

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch user info: " + res.status);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      setError("Error fetching user info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 font-semibold">Error: {error}</div>;

  return (
    <div className="p-6 relative">
      <motion.h1
        className="section-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Welcome back, {user?.fullname || user?.email || "User"} 👋
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
        <Image src={tubeImage} alt="Tube" width={100} height={100} />
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-1 sm:px-4 mb-10 py-6">
        {/* Role Card */}
        <motion.div
          className="bg-white border-l-4 border-pink-500 px-4 py-4 rounded-2xl shadow hover:shadow-md transition duration-300"
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="text-pink-500 text-2xl sm:text-3xl">
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
          className="bg-white border-l-4 border-purple-400 px-4 py-4 rounded-2xl shadow hover:shadow-md transition duration-300"
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="text-purple-400 text-2xl sm:text-3xl">📧</div>
            <div className="break-words max-w-full">
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Email Address</p>
              <p className="text-base sm:text-lg font-semibold text-gray-600 break-all">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Verified Card */}
        <motion.div
          className="bg-white border-l-4 border-blue-400 px-4 py-4 rounded-2xl shadow hover:shadow-md transition duration-300"
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="text-blue-400 text-2xl sm:text-3xl">✅</div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Account Status</p>
              <p className="text-base sm:text-lg font-semibold text-gray-600">Verified</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 py-2">Recent Activity</h2>
        <div className="space-y-4">
          <motion.div
            className="bg-white text-gray-700 p-4 rounded-xl shadow hover:shadow-md transition"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            🔔 You logged in recently.
          </motion.div>
          <motion.div
            className="bg-white text-gray-700 p-4 rounded-xl shadow hover:shadow-md transition"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            🔒 Your profile is secured.
          </motion.div>
          <motion.div
            className="bg-white text-gray-700 p-4 rounded-xl shadow hover:shadow-md transition"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            📅 Last activity was recently.
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaChartBar,
  FaUsers,
  FaUserShield,
  FaClipboardList,
} from "react-icons/fa";

// Define the Activity type
interface Activity {
  description: string;
  timestamp: string;
}

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    verifiedUsers: 0,
    pendingReports: 0,
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalyticsAndActivities() {
      try {
        const token = localStorage.getItem("token");

        const [statsRes, activitiesRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/analytics", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/admin/recent-activities", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !activitiesRes.ok) {
          throw new Error("Failed to fetch analytics or activities");
        }

        const statsData = await statsRes.json();
        const activitiesData = await activitiesRes.json();

        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalReports: statsData.totalReports || 0,
          verifiedUsers: statsData.verifiedUsers || 0,
          pendingReports: statsData.pendingReports || 0,
        });

        setActivities(Array.isArray(activitiesData.activities) ? activitiesData.activities : []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setLoading(false);
      }
    }

    fetchAnalyticsAndActivities();
  }, []);

  if (error) {
    return (
      <div className="text-center text-red-600 mt-10">
        Error loading analytics: {error}
      </div>
    );
  }

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
          <FaChartBar size={48} className="text-pink-600 mx-auto mb-4" />
          <h1 className="section-title py-4">Admin Analytics</h1>
          <p className="section-description py-2">
            Overview of user activities, reports, and account status.
          </p>
        </motion.div>

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center text-lg text-gray-500">
            Loading analytics...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Total Users</h3>
                <p className="text-2xl font-bold text-pink-600">{stats.totalUsers}</p>
              </div>
              <FaUsers className="text-5xl text-pink-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Verified Users</h3>
                <p className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</p>
              </div>
              <FaUserShield className="text-5xl text-green-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Total Reports</h3>
                <p className="text-2xl font-bold text-red-600">{stats.totalReports}</p>
              </div>
              <FaClipboardList className="text-5xl text-red-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Pending Reports</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
              </div>
              <FaChartBar className="text-5xl text-yellow-500" />
            </motion.div>
          </div>
        )}

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <h2 className="section-description text-start">Recent Activities</h2>
          <div className="bg-white p-6 mt-4 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800">
              Latest User Actions
            </h3>
            <ul className="mt-4 space-y-4">
              {activities.length === 0 ? (
                <li className="text-gray-500">No recent activities available.</li>
              ) : (
                activities.map((activity, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <p className="text-gray-600">{activity.description}</p>
                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

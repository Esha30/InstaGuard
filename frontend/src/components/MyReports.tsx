"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineFeedback } from "react-icons/md";

interface Report {
  username: string;
  dateReported: string;
  reason: string;
  status: string;
}

const MyReportsPage = () => {
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/my-reports`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch reports");

        const data = await res.json();
        setMyReports(data || []);
      } catch (error) {
        setError("Failed to load your reports.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
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
          <MdOutlineFeedback size={48} className="text-pink-600 mx-auto mb-4" />
          <h1 className="section-title py-4">My Submitted Reports</h1>
          <p className="section-description py-2">
            A summary of the reports you have submitted to our team for review.
          </p>
        </motion.div>

        {/* Feedback Messages */}
        {isLoading && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-center">
            Loading your reports...
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-600 text-white rounded-md text-center">
            {error}
          </div>
        )}

        {!isLoading && !error && myReports.length === 0 && (
          <div className="mt-4 p-3 bg-gray-100 text-gray-600 rounded-md text-center">
            You haven’t submitted any reports yet.
          </div>
        )}

        {/* Report Cards */}
        {!isLoading && myReports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {myReports.map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-xl transition"
              >
                <div className="flex items-center mb-4">
                  <FaUserCircle className="text-5xl text-pink-500 mr-4" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {report.username}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Submitted:{" "}
                      {report.dateReported
                        ? new Date(report.dateReported).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-3 text-sm">
                  📝 <strong>Reason:</strong> {report.reason}
                </p>
                <div
                  className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                    report.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {report.status}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;

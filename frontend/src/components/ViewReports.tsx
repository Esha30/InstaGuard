"use client";

import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Report {
  id: string;
  username: string;
  reason: string;
  status: string;
  dateReported: string;
}

export default function ViewReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!API_BASE) {
        setError("API base URL not set. Please check your environment variables.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Authorization token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/admin-reports`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch reports.");
        }

        const data: Omit<Report, "id">[] = await res.json();

        const withIds: Report[] = data.map((r, i) => ({
          ...r,
          id: `${r.username}-${i}`,
        }));

        setReports(withIds);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching reports:", err.message);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-pink-100 py-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <ClipboardList size={48} className="text-pink-600 mx-auto mb-4" />
          <h2 className="section-title py-4">User Reports</h2>
          <p className="section-description py-2">
            View and manage all reports in the system.
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <p className="text-center text-red-600 font-medium mb-6">
            {error}
          </p>
        )}

        {/* Loading or Report Table */}
        {loading ? (
          <p className="text-center text-gray-500">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-500">No reports found.</p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="overflow-x-auto rounded-lg shadow-md border border-purple-100"
          >
            <table className="min-w-full bg-white text-sm text-left">
              <thead className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 text-purple-800">
                <tr>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="border-t border-purple-100 hover:bg-purple-50 transition"
                  >
                    <td className="py-3 px-4">{report.username}</td>
                    <td className="py-3 px-4">{report.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          report.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {report.dateReported
                        ? new Date(report.dateReported).toLocaleDateString()
                        : "Invalid Date"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProfileResult {
  _id: string;
  user_id: string;
  username: string;
  features: Record<string, any>;
  prediction: string;
  model_version: string;
  confidence: number;
  timestamp: string;
}

export default function AdminViewProfileResults() {
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No auth token found");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/admin/profile-results", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile results");
        }

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
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
          <ShieldCheck size={48} className="text-pink-600 mx-auto mb-4"  />
          <h2 className="section-title py-4">
            Profile Analysis Results
          </h2>
          <p className="section-description py-2">
            AI predictions of reported or checked Instagram profiles.
          </p>
        </motion.div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-gray-500">Loading profile results...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-gray-500">No results found.</p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="overflow-x-auto rounded-lg shadow-md border border-purple-100"
          >
            <table className="min-w-full bg-white text-sm text-left font-medium text-gray-700">
              <thead className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 text-purple-800">
                <tr>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Prediction</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Checked On</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <motion.tr
                    key={result._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="border-t border-purple-100 hover:bg-purple-50 transition"
                  >
                    <td className="py-3 px-4">{result.username}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          result.prediction === "Fake"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {result.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4">{(result.confidence * 100).toFixed(2)}%</td>
                    <td className="py-3 px-4">{result.model_version}</td>
                    <td className="py-3 px-4">
                      {new Date(result.timestamp).toLocaleString()}
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

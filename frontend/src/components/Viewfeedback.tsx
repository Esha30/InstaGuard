"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

interface Feedback {
  _id: string;
  email?: string;
  impression: string;
  feedback: string;
  timestamp: string;
}

export default function ViewFeedback() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!token || typeof token !== "string" || !token.split(".")[1]) {
      setErrorMessage("Invalid or missing token. Please log in as admin.");
      setLoading(false);
      return;
    }

    if (!API_BASE) {
      setErrorMessage("API base URL is not defined.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/admin/feedback`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error(data.message || "Unauthorized. Admin access required.");
          }
          throw new Error(data.error || "Failed to fetch feedback.");
        }

        return data;
      })
      .then((data) => {
        setFeedbackList(data.feedback || []);
        setErrorMessage("");
      })
      .catch((err) => {
        console.error("Feedback fetch error:", err.message);
        setErrorMessage(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-pink-100 py-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <MessageSquare size={48} className="text-pink-600 mx-auto mb-2" />
          <h2 className="section-title py-4">User Feedback</h2>
          <p className="section-description py-2">Here’s what users have shared.</p>
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-500 mt-6">Loading feedback...</p>
        ) : errorMessage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-700 bg-red-100 border-l-4 border-red-600 p-4 rounded-lg max-w-xl mx-auto mt-6"
          >
            {errorMessage}
          </motion.div>
        ) : feedbackList.length === 0 ? (
          <p className="text-center text-gray-500 mt-6">No feedback available.</p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg shadow-md overflow-x-auto bg-white border border-gray-200 mt-6"
          >
            <table className="min-w-full text-sm text-left">
              <thead className="bg-pink-100 text-purple-700">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Impression</th>
                  <th className="px-6 py-3">Feedback</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((item) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t hover:bg-pink-50"
                  >
                    <td className="px-6 py-4">{item.email || "Anonymous"}</td>
                    <td className="px-6 py-4">{item.impression}</td>
                    <td className="px-6 py-4">{item.feedback || "-"}</td>
                    <td className="px-6 py-4">
                      {new Date(item.timestamp).toLocaleString()}
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

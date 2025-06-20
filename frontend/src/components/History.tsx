"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaHistory } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface HistoryItem {
  action: string;
  timestamp: number;
  details: string;
}

const UserHistoryPage = () => {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/user/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user history.");

        const data = await res.json();
        const sortedHistory = data.history.sort(
          (a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp
        );
        setHistoryData(sortedHistory);
      } catch (err) {
        console.error(err);
        setError("Failed to load history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-[#ffeef3] py-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <FaHistory size={48} className="text-pink-600 mx-auto mb-6" />
          <h2 className="section-title py-4">Your Activity History</h2>
          <p className="section-description py-2">
            Stay updated with all your recent actions.
          </p>
        </motion.div>

        {/* Error */}
        {error && <div className="text-red-600 text-center mb-8">{error}</div>}

        {/* Loading */}
        {isLoading ? (
          <div className="text-center text-xl text-gray-600">
            <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4">Fetching your activity...</p>
          </div>
        ) : (
          <>
            {historyData.length > 0 ? (
              <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
                <table className="min-w-full table-auto">
                  <thead className="bg-pink-600 text-white text-left">
                    <tr>
                      <th className="px-6 py-4 font-semibold">#</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                      <th className="px-6 py-4 font-semibold">Timestamp</th>
                      <th className="px-6 py-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-blue-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.action}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.details}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-600 mt-8">No activity history available.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserHistoryPage;

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import Image from "next/image";
import springImage from "@/assets/spring.png";

interface Report {
  username: string;
  reason: string;
  status: string;
  dateReported?: string;
}

const ReportedProfilesPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<Report>({
    username: "",
    reason: "",
    status: "Pending",
  });

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/reports", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setReports(data);
        } else {
          console.error("Failed to fetch reports:", data.error);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.reason) {
      setErrorMsg("Please fill in both fields.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccessMsg("✅ Report submitted successfully!");
        setFormData({ username: "", reason: "", status: "Pending" });
        setReports([
          { ...formData, dateReported: new Date().toISOString(), status: "Pending" },
          ...reports,
        ]);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(`❌ Error: ${result.error}`);
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } catch (err) {
      setErrorMsg("❌ An error occurred while submitting the report.");
      console.error(err);
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#ffeef3] py-24 min-h-screen relative overflow-hidden">
      <div className="container max-w-3xl mx-auto px-4 relative">
       

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <MdOutlineReportGmailerrorred size={48} className="text-pink-600 mx-auto mb-4" />
          <h2 className="section-title py-4">Report a Suspicious Instagram Profile</h2>
          <p className="section-description mt-2">
            Help us identify fake profiles by reporting suspicious activity.
          </p>
        </motion.div>

        {successMsg && (
          <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md border border-green-300 text-center font-medium">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md border border-red-300 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <motion.form
          onSubmit={handleReportSubmit}
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-8 space-y-6"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-lg font-medium">
              Instagram Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="@username"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="text-lg font-medium">
              Reason for Reporting
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Spam, impersonation, fake giveaway..."
              rows={4}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-lg font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled
              className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-md border border-gray-300 cursor-not-allowed"
            >
              <option value="Pending">Pending</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white rounded-lg py-3 text-lg font-semibold hover:bg-blue-700 transition"
          >
            Submit Report
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default ReportedProfilesPage;

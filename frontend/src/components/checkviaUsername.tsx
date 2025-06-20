"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RiSearchEyeLine } from "react-icons/ri";
import NoodleImage from "@/assets/noodle.png";
import PyramidImage from "@/assets/pyramid.png";

export default function CheckUsername() {
  const [username, setUsername] = useState("");
  const [predictionResult, setPredictionResult] = useState<{
    prediction: "Fake" | "Real";
    username: string;
    message?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckProfile = async () => {
    if (!username.trim()) {
      setErrorMessage("⚠️ Please enter an Instagram username.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("🔐 You must be logged in to check profiles.");
      return;
    }

    setLoading(true);
    setPredictionResult(null);
    setErrorMessage("");

    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const result = await res.json();
      console.log("Prediction Response:", result);

      if (!res.ok || result?.error) {
        setErrorMessage(result?.error || "❌ Something went wrong with the server.");
        return;
      }

      if (!result.prediction || !result.username) {
        setErrorMessage("⚠️ Prediction response is incomplete or malformed.");
        return;
      }

      setPredictionResult({
        prediction: result.prediction === "Fake" ? "Fake" : "Real",
        username: result.username,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Prediction failed:", error);
      setErrorMessage("🚫 Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isGeoRestricted = predictionResult?.message?.toLowerCase().includes(
    "verified real account based on trusted sources"
  );

  return (
    <div className="bg-gradient-to-b from-white to-[#ffeef3] py-16 min-h-screen relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">

        {/* Decorative Images */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-6 right-6 w-24 md:w-32 opacity-80"
        >
          <Image src={NoodleImage} alt="Noodle" layout="responsive" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-6 left-6 w-20 md:w-28 opacity-80"
        >
          <Image src={PyramidImage} alt="Pyramid" layout="responsive" />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <RiSearchEyeLine size={48} className="text-pink-600 mx-auto mb-4" />
          <h1 className="section-title py-2">Check Instagram Profile</h1>
          <p className="section-description py-2">
            Enter the Instagram username to verify if it's real or fake using AI detection.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto"
        >
          <input
            type="text"
            placeholder="Enter Instagram Username"
            className="border-2 border-pink-300 rounded-2xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setPredictionResult(null);
              setErrorMessage("");
            }}
          />
          <button
            onClick={handleCheckProfile}
            disabled={loading}
            className={`bg-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition duration-300 ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-pink-700"
            }`}
          >
            {loading ? "Checking..." : "Check Profile"}
          </button>
        </motion.div>

        {/* Result Display */}
        {predictionResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`mt-10 text-center bg-white rounded-xl shadow-md px-6 py-6 max-w-xl mx-auto border-l-4 ${
              predictionResult.prediction === "Fake"
                ? "border-red-600"
                : isGeoRestricted
                ? "border-yellow-500"
                : "border-green-600"
            }`}
          >
            <h2
              className={`text-2xl font-bold ${
                predictionResult.prediction === "Fake"
                  ? "text-red-700"
                  : isGeoRestricted
                  ? "text-yellow-700"
                  : "text-green-700"
              }`}
            >
              {predictionResult.prediction === "Fake"
                ? "⚠️ Fake Profile"
                : isGeoRestricted
                ? "🌐 Geo-Restricted Account"
                : "✅ Real Profile"}
            </h2>

            <p className="mt-2 text-gray-700 text-lg">
              Username: <span className="font-semibold">{predictionResult.username}</span>
            </p>

            {predictionResult.message && (
              <p className="mt-4 text-gray-600 text-base">
                <span className="font-semibold">Note:</span> {predictionResult.message}
              </p>
            )}
          </motion.div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 text-center bg-red-100 text-red-700 px-4 py-3 rounded-xl max-w-xl mx-auto border-l-4 border-red-600"
          >
            {errorMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
}

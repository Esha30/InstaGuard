"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { FaUserCircle, FaUserEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import cylinderImage from "@/assets/cylinder.png";

const ProfilePage = () => {
  const router = useRouter();
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    updatedAt: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("profileUpdatedAt");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();
        setProfileData((prev) => ({
          ...prev,
          fullname: data.fullname || "",
          email: data.email || "",
          updatedAt: data.updatedAt || "",
        }));
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Failed to load profile data.");
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!captcha) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing token");

      const res = await fetch("http://localhost:5000/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname: profileData.fullname,
          password: profileData.password || undefined,
          captcha,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        const now = new Date().toISOString();
        setSuccess("Profile updated successfully.");
        setError(null);
        setProfileData({
          ...profileData,
          password: "",
          confirmPassword: "",
          updatedAt: now,
        });
        localStorage.setItem("profileUpdatedAt", now);
      } else {
        setError(result.message || "Update failed.");
      }
    } catch (err) {
      console.error("Error during update:", err);
      setError("Something went wrong while updating the profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#ffeef3] py-16 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <FaUserEdit size={52} className="text-pink-600 mx-auto mb-4" />
        <h1 className="section-title py-4">Edit Profile</h1>
        <p className="section-description py-2">
          Update your personal information and password from here.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        {/* Profile Display */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center"
        >
          <FaUserCircle size={90} className="text-pink-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">{profileData.fullname}</h2>
          <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
            <MdEmail className="text-lg" />
            {profileData.email}
          </p>

          {profileData.updatedAt && (
            <p className="text-gray-500 mt-2">
              Last updated: {new Date(profileData.updatedAt).toLocaleString()}
            </p>
          )}

          <motion.div
            className="mt-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              <Image
                src={cylinderImage}
                alt="Floating object"
                width={100}
                height={100}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Update Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
              <strong className="font-semibold">Error: </strong> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-purple-400 text-purple-700 px-4 py-3 rounded-md mb-4" role="alert">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={profileData.fullname}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={profileData.password}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={setCaptcha}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:opacity-90 text-white font-semibold py-2 rounded-xl transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default ProfilePage;

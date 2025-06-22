"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Logo from "@/assets/logosaas.png";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignupPage = () => {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!formData.fullname || !formData.email || !formData.password || !formData.mobile) {
      setErrorMessage("Please fill in all the required fields!");
      setLoading(false);
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(formData.email)) {
      setErrorMessage("Please enter a valid email address!");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordPattern.test(formData.password)) {
      setErrorMessage("Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.");
      setLoading(false);
      return;
    }

    if (!captcha) {
      setErrorMessage("Please complete the reCAPTCHA verification.");
      setLoading(false);
      return;
    }

    // ✅ Prepare only required fields
    const { fullname, email, password, mobile } = formData;
    const signupData = { fullname, email, password, mobile, captcha };

    console.log("🚀 Signup Data:", signupData); // ✅ Debug log

   try {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || "";
  const response = await fetch(`${baseUrl}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signupData),
  });


      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        throw new Error("Invalid JSON response from server");
      }

      if (response.ok) {
        setSuccessMessage(result.message || "Signup successful! Redirecting...");
        setTimeout(() => {
          localStorage.setItem("profileCreatedAt", new Date().toISOString());
          router.push("/login");
        }, 2000);
      } else {
        setErrorMessage(result.message || "Signup failed. Please try again.");
        recaptchaRef.current?.reset();
        setCaptcha(null);
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (res: CredentialResponse) => {
    if (!res.credential) {
      setErrorMessage("No credential returned from Google");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/google-signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: res.credential, captcha }),
      });

      const payload = await response.json();

      if (response.ok) {
        localStorage.setItem("token", payload.access_token);
        setSuccessMessage("Google Sign-in successful!");
        setTimeout(() => router.push("/user-dashboard"), 1500);
      } else {
        setErrorMessage(payload.message || "Google sign-in failed");
        recaptchaRef.current?.reset();
        setCaptcha(null);
      }
    } catch (err) {
      console.error("❌ Google sign-in error:", err);
      setErrorMessage("Server error during Google sign-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID!}>

      <>
        <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 shadow-sm transition-all duration-300">
          <div className="py-5">
            <div className="container flex items-center space-x-2">
              <Image src={Logo} alt="Logo here" height={40} width={40} />
              <a
                href="/"
                className="text-3xl font-bold tracking-wide font-sans bg-gradient-to-r from-[#fdc468] via-[#da0c50] to-[#b43a9c] text-transparent bg-clip-text hover:opacity-80 transition-all"
              >
                InstaGuard
              </a>
            </div>
          </div>
        </header>

        <section className="bg-gradient-to-b from-white to-[#FCE7F3] min-h-screen flex items-center justify-center px-4 py-16">
  <div className="w-full max-w-md bg-[#FCE7F3] p-8 rounded-xl shadow-xl">
    <div className="text-center mb-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#fdc468] via-[#da0c50] to-[#b43a9c] text-transparent bg-clip-text">Create an Account</h2>
      <p className="text-gray-700 mt-2 text-sm">Sign up to get started. It only takes a few seconds!</p>
    </div>

    {successMessage && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 p-3 mb-4 bg-green-100 border border-green-400 text-green-800 rounded-md text-sm"
      >
        ✅ {successMessage}
      </motion.div>
    )}

    {errorMessage && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 p-3 mb-4 bg-red-100 border border-red-400 text-red-800 rounded-md text-sm"
      >
        ❌ {errorMessage}
      </motion.div>
    )}

    <motion.form
      onSubmit={handleSubmit}
      initial={{ scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      viewport={{ once: true }}
      className="space-y-5"
    >
      <GoogleLogin onSuccess={handleGoogleLogin} onError={() => console.log("Login Failed!")} auto_select />

      <div>
        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input type="text" id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required />
      </div>

      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type={passwordVisible ? 'text' : 'password'}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1 pr-10"
          required
        />
        <button
          type="button"
          className="absolute right-3 top-[38px] text-gray-500"
          onClick={() => setPasswordVisible(!passwordVisible)}
        >
          {passwordVisible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="relative">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          type={confirmPasswordVisible ? 'text' : 'password'}
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1 pr-10"
          required
        />
        <button
          type="button"
          className="absolute right-3 top-[38px] text-gray-500"
          onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
        >
          {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
        <PhoneInput
          country={'us'}
          value={formData.mobile}
          onChange={(mobile) => setFormData({ ...formData, mobile })}
          inputProps={{ name: 'mobile', required: true }}
          inputClass="!w-full !px-3 !py-2 !border !rounded !text-sm"
          buttonClass="!border-r !bg-white"
          containerClass="!w-full"
        />
      </div>

      <div className="mt-2">
        <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={setCaptcha} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded font-semibold text-white flex justify-center items-center gap-2 transition ${
          loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-[#da0c50] hover:bg-[#b43a9c]'
        }`}
      >
        {loading && (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>

      <p className="text-center text-sm text-gray-600 mt-2">
        Already have an account?{' '}
        <a href="/login" className="text-[#da0c50] font-medium hover:underline">Login</a>
      </p>
    </motion.form>
  </div>
</section>


        <footer className="bg-black text-[#BCBCBC] text-sm py-10 text-center ">
          <div className="container">
            <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:h-full before:blur before:w-full before:bg-[linear-gradient(to-right , #FCE7F3,#fccde2,#fff)] before:absolute">
              <Image src={Logo} alt="logo here" height={40} className="relative" />
            </div>
          </div>
          <p className="mt-6 text-white">&copy; InstaGuard, Inc. All rights reserved.</p>
        </footer>
      </>
    </GoogleOAuthProvider>
  );
};

export default SignupPage;

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Logo from '@/assets/logosaas.png';
import starImage from '@/assets/star.png';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter } from 'next/navigation';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!captcha) {
      setErrorMessage("Please complete the CAPTCHA.");
      return;
    }

    try {
      const { email, password } = formData;

      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        setErrorMessage("Invalid form data.");
        return;
      }

      setLoading(true);

      const response = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captcha }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('role', result.role);
        localStorage.setItem('loginTime', new Date().toISOString());

        setSuccessMessage("Login successful! Redirecting...");

        setTimeout(() => {
          if (result.role === 'admin') {
            router.push('/admin-dashboard');
          } else {
            router.push('/user-dashboard');
          }
        }, 1500);
      } else {
        setErrorMessage(result.message || "Login failed.");
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  if (!siteKey) {
    console.error("Missing ReCAPTCHA site key");
    return <p className="text-red-600 text-center mt-10">reCAPTCHA is not configured.</p>;
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-md z-20 bg-white/70 shadow-sm">
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
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#fdc468] via-[#da0c50] to-[#b43a9c] text-transparent bg-clip-text">
        Welcome Back
      </h2>
      <p className="text-gray-700 mt-2 text-sm">Log in to continue using InstaGuard.</p>
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
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder="Enter your email"
          required
        />
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
          placeholder="Enter your password"
          required
        />
        <button
          type="button"
          className="absolute right-3 top-[38px] text-gray-500"
          onClick={() => setPasswordVisible(!passwordVisible)}
        >
          {passwordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
        </button>
      </div>

      <div className="mt-4" aria-label="CAPTCHA challenge">
        <ReCAPTCHA sitekey={siteKey} onChange={(value) => setCaptcha(value)} />
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
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-center text-sm text-gray-600 mt-2">
        Don’t have an account?{' '}
        <a href="/signup" className="text-[#da0c50] font-medium hover:underline">Sign Up</a>
      </p>
    </motion.form>
  </div>
</section>


      <footer className="bg-black text-[#BCBCBC] text-sm py-10 text-center mt-10">
        <div className="container">
          <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:h-full before:blur before:w-full before:bg-[linear-gradient(to-right , #FCE7F3,#fccde2,#fff)] before:absolute">
            <Image src={Logo} alt="logo here" height={40} className="relative" />
          </div>
        </div>
        <div>
          <p className="mt-6 text-white">&copy; InstaGuard, Inc. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import pyramidImage from "@/assets/pyramid.png";
import Logo from "@/assets/logosaas.png";
import { useRouter } from "next/navigation";

const LogoutSuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
        localStorage.removeItem("token");

    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-sm z-20">
        <div className="py-5">
          <div className="container flex items-center space-x-2">
            <Image src={Logo} alt="Logo" height={40} width={40} />
            <a
              href="/"
              className="text-3xl font-bold tracking-wide font-sans bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-transparent bg-clip-text hover:opacity-80 transition-all"
            >
              InstaGuard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="bg-gradient-to-b from-white to-[#ffeef3] py-24 overflow-x-clip min-h-[calc(100vh-150px)] flex items-center justify-center">
        <div className="max-w-2xl text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="section-title"
          >
            You have logged out successfully! 👋
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="section-description"
          >
            Redirecting you back to Login page...
          </motion.p>

          {/* Spinner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex justify-center items-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </motion.div>

          {/* Noodle Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute -right-[150px] -bottom-[100px] hidden md:block"
          >
            <Image src={pyramidImage} alt="Noodle Image" width={200} />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-[#BCBCBC] text-sm py-10 text-center">
        <div className="container">
          <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:h-full before:blur before:w-full before:bg-[linear-gradient(to-right , #F87BFF,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
            <Image src={Logo} alt="Logo" height={40} className="relative" />
          </div>
        </div>
        <div>
          <p className="mt-6 text-white"> &copy; InstaGuard, Inc. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default LogoutSuccessPage;

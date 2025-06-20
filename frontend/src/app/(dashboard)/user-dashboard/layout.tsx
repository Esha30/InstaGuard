"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import Logo from "@/assets/logosaas.png";
import Menu from "@/components/Menu";
import Home from "@/components/Home";
import CheckURL from "@/components/checkviaUsername";
import Profile from "@/components/Profile";
import History from "@/components/History";
import ReportProfile from "@/components/ReportProfile";
import MyReports from "@/components/MyReports";
import Help from "@/components/Help";
import FAQ from "@/components/FAQ";
import FeedbackPage from "@/components/feedback";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [selectedPage, setSelectedPage] = useState<string>('home');
  const [authMethod, setAuthMethod] = useState<string | null>(null);

  useEffect(() => {
    const method = localStorage.getItem("authMethod");
    setAuthMethod(method);
  }, []);

  const handleMenuClick = (page: string) => {
    setSelectedPage(page);
  };

  return (
    <div className="h-screen flex font-sans">
      {/* Sidebar (Left) */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] bg-gradient-to-b from-[#ffeef3] to-[#ffd6e8] shadow-md flex flex-col items-center py-4">
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <Image src={Logo} alt="Logo" width={30} height={30} />
          <h2 className="hidden lg:block text-xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-pink-600 text-transparent bg-clip-text hover:opacity-80">
            InstaGuard
          </h2>
        </div>
        <Menu onMenuClick={handleMenuClick} />
      </div>

      {/* Main Content (Right) */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-white p-6 overflow-y-auto">
        {{
          "home": (authMethod !== "google" && <Home />),
          "history": (authMethod !== "google" && <History />),
          "check-username": <CheckURL />,
          "report": <ReportProfile />,
          "my-reports": <MyReports />,
          "profile": <Profile />,
          "help": <Help />,
          "faq": <FAQ />,
          "feedback": <FeedbackPage />,
        }[selectedPage] || children}
      </div>
    </div>
  );
}

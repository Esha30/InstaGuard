"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "@/assets/logosaas.png";
import AdminMenu from "@/components/AdminMenu";
import ManageUsers from "@/components/ManageUsers";
import ViewProfiles from "@/components/ViewProfiles";
import ViewReport from "@/components/ViewReports";
import AdminProfile from "@/components/AdminProfile";
import Analytics from "@/components/Analytics";
import Settings from "@/components/Settings";
import ViewFeedback from "@/components/Viewfeedback";
import AdminViewProfileResults from "@/components/AdminViewProfileResults";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedPage, setSelectedPage] = useState("admin-profile");

  return (
    <div className="h-screen flex font-sans">
      {/* Left sidebar */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] bg-gradient-to-b from-[#ffeef3] to-[#ffd6e8]  shadow-md flex flex-col items-center py-4">
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <Image src={Logo} alt="Logo" width={30} height={30} />
          <h2 className="hidden lg:block text-xl font-extrabold bg-gradient-to-r font-sans bg-gradient-to-r from-yellow-400 via-pink-500 to-pink-600 text-transparent bg-clip-text hover:opacity-80">
            InstaGuard
          </h2>
        </div>
        <AdminMenu onMenuClick={(page) => setSelectedPage(page)} />
      </div>

      {/* Right content */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-white p-6 overflow-y-auto">
        {{
          "users": <ManageUsers />,
          "profiles": <ViewProfiles />,
          "reports": <ViewReport />,
          "admin-profile": <AdminProfile />,
          "profile-results": <AdminViewProfileResults />,
          "analytics": <Analytics />,
          "settings": <Settings />,
          "feedback": <ViewFeedback />,
        }[selectedPage] || children}
      </div>
    </div>
  );
}

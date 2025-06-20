"use client";

import {
  Users,
  Eye,
  Flag,
  BarChart2,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import Link from "next/link";

const adminMenuSections = [
  {
    title: "MENU",
    items: [
      { icon: <Users className="w-5 h-5" />, label: "Manage Users", page: "users" },
      { icon: <Eye className="w-5 h-5" />, label: "View Profiles", page: "profiles" },
      { icon: <Flag className="w-5 h-5" />, label: "View Reports", page: "reports" },
      { icon: <ShieldCheck className="w-5 h-5" />, label: "Profile Results", page: "profile-results" }, // ✅ New Item
      { icon: <BarChart2 className="w-5 h-5" />, label: "Analytics", page: "analytics" },
      { icon: <Settings className="w-5 h-5" />, label: "Settings", page: "settings" },
      { icon: <Eye className="w-5 h-5" />, label: "View Feedback", page: "feedback" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { icon: <ShieldCheck className="w-5 h-5" />, label: "Admin Profile", page: "admin-profile" },
      { icon: <LogOut className="w-5 h-5" />, label: "Logout", href: "/logout" },
    ],
  },
];

export default function AdminMenu({
  onMenuClick,
}: {
  onMenuClick: (page: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8 mt-10">
      {adminMenuSections.map((section, idx) => (
        <div key={idx}>
          <h2 className="text-xs text-gray-500 font-semibold mb-3 px-2 hidden lg:block">
            {section.title}
          </h2>
          <div className="flex flex-col gap-2">
            {section.items.map((item, i) => {
              const isInternal = !!item.page && !item.href;

              return (
                <div key={i}>
                  <Link
                    href={item.href || "#"}
                    onClick={(e) => {
                      if (isInternal) {
                        e.preventDefault();
                        onMenuClick(item.page!);
                      }
                    }}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-200 transition-all text-gray-800 justify-center lg:justify-start"
                  >
                    {item.icon}
                    <span className="hidden lg:inline text-sm font-medium">
                      {item.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

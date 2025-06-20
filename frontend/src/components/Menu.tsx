"use client";

import {
  Home,
  Link2,
  History,
  Flag,
  ClipboardList,
  HelpCircle,
  User,
  LogOut,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export default function Menu({ onMenuClick }: { onMenuClick: (page: string) => void }) {
  const menuSections = [
    {
      title: "MENU",
      items: [
        { icon: <Home className="w-5 h-5" />, label: "Home", page: "home" },
        { icon: <Link2 className="w-5 h-5" />, label: "Check via Username", page: "check-username" },
        { icon: <History className="w-5 h-5" />, label: "History", page: "history" },
        { icon: <Flag className="w-5 h-5" />, label: "Report Profile", page: "report" },
        { icon: <ClipboardList className="w-5 h-5" />, label: "My Reports", page: "my-reports" },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { icon: <User className="w-5 h-5" />, label: "Profile", page: "profile" },
        { icon: <LogOut className="w-5 h-5" />, label: "Logout", href: "/logout" },
      ],
    },
    {
      title: "OTHER",
      items: [
        { icon: <HelpCircle className="w-5 h-5" />, label: "FAQ", page: "faq" },
        { icon: <ShieldCheck className="w-5 h-5" />, label: "Help & Support", page: "help" },
        { icon: <MessageSquare className="w-5 h-5" />, label: "Feedback", page: "feedback" }, // 👈 New Item
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8 mt-10">
      {menuSections.map((section, idx) => (
        <div key={idx}>
          <h2 className="text-xs text-gray-500 font-semibold mb-3 px-2 hidden lg:block">
            {section.title}
          </h2>
          <div className="flex flex-col gap-2">
            {section.items.map((item, i) => (
              <div key={i} onClick={() => item.page && onMenuClick(item.page)}>
                <Link
                  href={item.href || "#"}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-200 transition-all text-gray-800 justify-center lg:justify-start"
                >
                  {item.icon}
                  <span className="hidden lg:inline text-sm font-medium">
                    {item.label}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

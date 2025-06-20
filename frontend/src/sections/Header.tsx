"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logosaas.png";
import MenuIcon from "@/assets/menu.png";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 shadow-sm transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="flex justify-center items-center py-2 bg-gradient-to-r from-black via-gray-900 to-black text-white text-xs md:text-sm gap-3">
        <p className="text-white/60 hidden md:block">
          Detect Fake Instagram Profiles in Seconds
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1 font-medium hover:underline hover:text-white transition"
        >
          🚀 <span>Get Started for Free</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo + Brand */}
            <div className="flex items-center gap-3">
              <Image src={Logo} alt="InstaGuard Logo" height={40} width={40} />
              <Link
                href="/"
                className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-transparent bg-clip-text hover:opacity-80 transition-all"
              >
                InstaGuard
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
              <a href="#about" className="hover:text-black transition">About</a>
              <a href="#features" className="hover:text-black transition">Features</a>
              <a href="#customer" className="hover:text-black transition">Customers</a>
              <a href="#contact" className="hover:text-black transition">Contact</a>
              <Link href="/signup">
                <button className="bg-gradient-to-r  from-yellow-400 via-pink-500 to-purple-600 text-white px-5 py-2 rounded-xl font-semibold shadow-lg hover:scale-110 hover:shadow-pink-500/60 hover:brightness-110 transition duration-300 ease-in-out">
                  Sign Up
                </button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              <Image
                src={MenuIcon}
                alt="Menu Icon"
                className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/90 border-t border-gray-200 shadow-md animate-slideDown">
          <nav className="flex flex-col px-6 py-4 gap-4 text-gray-800 font-medium">
            <a href="#about" onClick={toggleMenu} className="hover:text-black transition">About</a>
            <a href="#features" onClick={toggleMenu} className="hover:text-black transition">Features</a>
            <a href="#customer" onClick={toggleMenu} className="hover:text-black transition">Customers</a>
            <a href="#contact" onClick={toggleMenu} className="hover:text-black transition">Contact</a>

            {/* Fix: wrap button with div to attach onClick */}
            <div onClick={toggleMenu}>
              <Link href="/signup">
                <button className="w-full mt-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-5 py-2 rounded-xl font-semibold shadow-lg hover:scale-110 hover:shadow-indigo-500/60 hover:brightness-110 transition duration-300 ease-in-out">
                  Sign Up
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

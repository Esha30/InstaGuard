import logo from "@/assets/logosaas.png";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-black text-[#BCBCBC] text-sm pt-10 pb-6  border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo with Gradient Border */}
        <div className="flex justify-center">
          <div className="inline-flex relative before:content-[''] before:absolute before:inset-0 before:rounded-md before:blur-sm before:bg-[linear-gradient(to_right,#F87BFF,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)]">
            <Image
              src={logo}
              alt="InstaGuard Logo"
              height={40}
              className="relative z-10 rounded-md"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col items-center gap-4 mt-8 text-white sm:flex-row sm:justify-center sm:gap-10 text-sm sm:text-base">
          <a href="#about" className="hover:text-pink-400 transition duration-300">About</a>
          <a href="#features" className="hover:text-pink-400 transition duration-300">Features</a>
          <a href="#customer" className="hover:text-pink-400 transition duration-300">Customers</a>
          <a href="#contact" className="hover:text-pink-400 transition duration-300">Contact</a>
        </nav>

        {/* Copyright */}
        <p className="mt-8 text-white text-xs sm:text-sm text-center">
          &copy; {new Date().getFullYear()} <strong>InstaGuard</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

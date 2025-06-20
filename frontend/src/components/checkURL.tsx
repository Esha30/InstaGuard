"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { RiSearchEyeLine } from 'react-icons/ri';
import NoodleImage from '@/assets/noodle.png';
import PyramidImage from '@/assets/pyramid.png';

export default function CheckURL() {
  const [profileUrl, setProfileUrl] = useState('');

  const handleCheckProfile = () => {
    console.log("Checking profile:", profileUrl);
    // Add backend ML/DL API call here
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#ffeef3] py-16 min-h-screen relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        {/* Animated Noodle Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-6 right-6 w-24 md:w-32 opacity-80"
        >
          <Image src={NoodleImage} alt="Noodle" layout="responsive" />
        </motion.div>

        {/* Animated Pyramid Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-6 left-6 w-20 md:w-28 opacity-80"
        >
          <Image src={PyramidImage} alt="Pyramid" layout="responsive" />
        </motion.div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <RiSearchEyeLine size={48} className="text-pink-500 mx-auto mb-4" />
          <h1 className="section-title">Check Instagram Profile</h1>
          <p className="section-description py-2">
            Enter the Instagram profile URL to verify if it's real or fake using AI detection.
          </p>
        </motion.div>

        {/* Input + Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto"
        >
          <input
            type="text"
            placeholder="Paste Instagram Profile URL"
            className="border-2 border-pink-300 rounded-2xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
          />
          <button
            onClick={handleCheckProfile}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-2xl hover:brightness-110 transition duration-300"
          >
            Check Profile
          </button>
        </motion.div>
      </div>
    </div>
  );
}

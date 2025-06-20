"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import photo from "@/assets/photo.jpg";

export const About = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center bg-gradient-to-b from-[#ffe4ec] to-white overflow-hidden py-10 px-6 sm:px-8 md:px-12 lg:px-20"
    >
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-center gap-16">
        {/* Text Column */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-snug">
            <span className="bg-gradient-to-r from-[#b43a9c] via-[#da0c50] to-[#fdc468] text-transparent bg-clip-text">
              Check your Instagram profile with Confidence
            </span>
          </h2>

          <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
            <p>
              We’re here to help you stay safe and confident online. Our smart tool checks Instagram profiles to determine whether they’re real or fake.
            </p>
            <p>
              Whether you’re a business, content creator, or just someone cautious, our platform equips you with the tools to make informed choices.
            </p>
            <p className="font-semibold">
              Simple to use. Smartly built. Designed for a safer digital experience.
            </p>
          </div>
        </div>

        {/* Image Column */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <motion.div
            style={{ y: translateY }}
            className="w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-3xl shadow-2xl overflow-hidden"
          >
            <Image
              src={photo}
              alt="Instagram Detection Illustration"
              width={600}
              height={600}
              className="object-cover w-full h-auto rounded-3xl"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

"use client";
import { motion } from "framer-motion";

export const Features = () => {
  return (
    <section className="relative min-h-screen py-24 bg-gradient-to-b from-white to-[#ffe4ec] overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Features</h2>

        <p className="section-description mt-5 max-w-2xl mx-auto text-center">
          We’ve built a set of tools to help you navigate Instagram with more clarity and confidence.  
          Below are the features that ensure your experience stays smart and secure.
        </p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              title: "Secure User Authentication",
              description:
                "Users sign up with email verification and CAPTCHA, ensuring only real individuals access the platform. Role-based access controls differentiate between admins and users.",
              delay: 0.1,
            },
            {
              title: "ML-Powered Fake Detection",
              description:
                "AI-trained models analyze Instagram profile data like followers, engagement, and profile completeness to predict fake accounts with accuracy.",
              delay: 0.3,
            },
            {
              title: "User-Friendly Dashboard",
              description:
                "Our intuitive dashboard gives users a clean, simple view of their scan results, profile analytics, and risk reports — all in one place.",
              delay: 0.5,
            },
          ].map(({ title, description, delay }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay }}
              viewport={{ once: true }}
            >
              <div className="bg-[#FCE7F3] p-6 h-full rounded-2xl shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold section-title mb-3">{title}</h3>
                  <p className="text-base tracking-tight leading-relaxed">{description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Animated Noodle Placeholder (optional visual element) */}
      <motion.div
        className="absolute bottom-0 right-0 md:right-12 w-32 h-32"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Add animated image here if needed */}
      </motion.div>
    </section>
  );
};

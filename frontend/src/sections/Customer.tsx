"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import React from "react";

interface Feedback {
  feedback: string;
  email?: string;
  username?: string;
}

const CustomersColumn = ({
  className,
  Customers,
  duration,
}: {
  className?: string;
  Customers: Feedback[];
  duration?: number;
}) => {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {Customers.map(({ feedback, email, username }, i) => (
              <div
                key={i}
                className="card bg-white p-4 rounded-xl shadow hover:shadow-md transition"
              >
                <div className="text-gray-800 text-sm md:text-base italic">
                  “{feedback}”
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <FaUserCircle className="text-4xl text-[#da0c50]" />
                  <div className="flex flex-col text-sm text-gray-600">
                    <span className="font-medium text-gray-800">
                      {username || "Anonymous"}
                    </span>
                    <span className="text-xs">{email || "hidden@example.com"}</span>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export const Customer = () => {
  const [testimonials, setTestimonials] = useState<Feedback[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Use backticks here for template literal to correctly insert env var
        const res = await fetch(

  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/feedback`
);
       
        const data = await res.json();
        if (data?.feedback) {
          const anonymized = data.feedback.map((fb: any) => ({
            feedback: fb.feedback || fb.impression,
            email: fb.email || "anonymous@instaguard.ai",
            username: fb.username || "User",
          }));
          setTestimonials(anonymized);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      }
    };

    fetchTestimonials();
  }, []);

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  return (
    <section className="bg-gradient-to-b from-[#ffe4ec] to-white py-24">
      <div className="container">
        <div className="section-heading text-center">
          <div className="tag text-pink-600 font-semibold uppercase">
            Testimonials
          </div>
          <h2 className="section-title text-3xl font-bold mt-5">
            What our users say
          </h2>
          <p className="section-description mt-4 text-gray-600 max-w-xl mx-auto">
            Thousands of users trust our platform to detect fake Instagram
            profiles, verify brands, and stay safe online.
          </p>
        </div>

        <div
          className="flex justify-center gap-6 mt-12 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden"
        >
          <CustomersColumn Customers={firstColumn} duration={15} />
          <CustomersColumn
            Customers={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <CustomersColumn
            Customers={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};

export default Customer;

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does InstaGuard detect fake profiles?",
    answer:
      "InstaGuard uses AI/ML models to analyze activity patterns, follower-following ratios, and metadata to identify fake accounts.",
  },
  {
    question: "Can I trust InstaGuard with my Instagram credentials?",
    answer:
      "Yes, we do not store or misuse your credentials. All data is encrypted and used only for verification purposes.",
  },
  {
    question: "What happens after I report a fake profile?",
    answer:
      "Your report is reviewed by our team. If verified, the account may be flagged and a detailed warning sent to Instagram.",
  },
  {
    question: "Why should I check profiles via credentials instead of just the URL?",
    answer:
      "Checking via credentials provides deeper insights and private profile metadata, which improves detection accuracy.",
  },
  {
    question: "Do I need to create an account to use InstaGuard?",
    answer:
      "Yes, account creation helps us manage reports, provide history tracking, and improve user experience and security.",
  },
  {
    question: "Can I delete my reports or personal data?",
    answer:
      "Yes. You can manage your submitted reports and request data deletion from your Profile page at any time.",
  },
  {
    question: "Is InstaGuard a free tool?",
    answer:
      "Yes, all basic functionalities including profile scanning, reporting, and history access are completely free.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#ffeef3] py-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <HelpCircle size={48} className="text-pink-600 mx-auto mb-4" />
          <h1 className="section-title py-4">Frequently Asked Questions</h1>
          <p className="section-description py-2">
            Need help? We’ve got answers to your most common questions.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-md cursor-pointer border border-purple-100"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-purple-800">{faq.question}</h3>
                <svg
                  className={`w-5 h-5 text-purple-600 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openIndex === index && (
                <motion.p
                  className="mt-3 text-sm text-purple-600"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  {faq.answer}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MdHelpOutline } from "react-icons/md";
import { FaEnvelopeOpenText, FaPhoneAlt } from "react-icons/fa";

const HelpAndSupportPage = () => {
 const [faqList] = useState([
  {
    question: "How do I report a fake profile?",
    answer:
      "Go to the 'Check Credentials' page, enter the Instagram username, and click on 'Report' if the profile seems suspicious.",
  },
  {
    question: "What happens after I report a profile?",
    answer:
      "Our team reviews the report. You can track the status in the 'My Reports' section.",
  },
  {
    question: "How can I change my password?",
    answer:
      "Navigate to your Profile page, click 'Change Password', and follow the instructions.",
  },
  {
    question: "How do I verify my email or phone number?",
    answer:
      "During signup, you'll receive a verification code. If you missed it, signup again.",
  },
 {
    question: "How can I leave feedback about the platform?",
    answer:
      "We value your input! Go to the 'Feedback' section from the main menu to share your thoughts, suggestions, or report issues.",
  },
  {
    question: "Is my data kept private and secure?",
    answer:
      "Yes, we prioritize user privacy. All your data is encrypted and never shared with third parties.",
  },
]);

  return (
    <div className="bg-gradient-to-b from-white to-[#ffeef3] py-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <MdHelpOutline size={48} className="text-pink-600 mx-auto mb-4" />
          <h1 className="section-title py-4">Help & Support</h1>
          <p className="section-description py-2">
            Find answers to frequently asked questions or reach out to us directly.
          </p>
        </motion.div>

        {/* FAQs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {faqList.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-purple-700 mb-2">{faq.question}</h3>
              <p className="text-pink-700">{faq.answer}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="section-description text-pink-500 mb-4">Still need help?</h2>
          <p className="text-purple-600 mb-6">
            If you can't find your answer here, feel free to contact us directly.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <div className="flex items-center gap-3 text-pink-600 text-lg">
              <FaEnvelopeOpenText /> <a href="mailto:support@instaguard.com">instaguard7@gmail.com</a>
            </div>
            <div className="flex items-center gap-3 text-pink-600 text-lg">
              <FaPhoneAlt /> <span>+92-3402551007</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpAndSupportPage;

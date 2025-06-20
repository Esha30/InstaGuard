"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { RiFeedbackLine } from 'react-icons/ri';
import NoodleImage from '@/assets/noodle.png';
import PyramidImage from '@/assets/pyramid.png';

const impressions = [
  { emoji: "👍", label: "Great" },
  { emoji: "😊", label: "Good" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "👎", label: "Bad" },
];

export default function FeedbackPage() {
  const [impression, setImpression] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!impression) {
      setErrorMessage('Please select an impression.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to submit feedback.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ impression, feedback }),
      });

      if (res.ok) {
        setSubmitted(true);
        setErrorMessage('');
        setFeedback('');
        setImpression('');
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setErrorMessage('Submission failed. Try again later.');
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#ffeef3] py-16 min-h-screen relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        {/* Animated Background Images */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-6 right-6 w-24 md:w-32 opacity-80"
        >
          <Image src={NoodleImage} alt="Noodle" layout="responsive" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-6 left-6 w-20 md:w-28 opacity-80"
        >
          <Image src={PyramidImage} alt="Pyramid" layout="responsive" />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <RiFeedbackLine size={48} className="text-pink-600 mx-auto mb-4" />
          <h1 className="section-title py-2">We Value Your Feedback</h1>
          <p className="section-description py-2">
            How was your experience? Select a reaction and share more if you'd like!
          </p>
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col gap-4 max-w-xl mx-auto"
        >
          {/* Impressions */}
          <div className="flex justify-center gap-4 mt-2">
            {impressions.map((item) => (
              <button
                key={item.label}
                onClick={() => setImpression(item.label)}
                className={`text-2xl p-2 border rounded-full transition ${
                  impression === item.label
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                aria-label={item.label}
              >
                {item.emoji}
              </button>
            ))}
          </div>

          {/* Optional Text Feedback */}
          <textarea
            placeholder="Additional Comments (Optional)"
            rows={4}
            className="border-2 border-purple-300 rounded-2xl px-4 py-3 w-full resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="bg-pink-600 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-purple-700 transition duration-300"
          >
            Submit Feedback
          </button>
        </motion.div>

        {/* Success Message */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-center bg-green-100 text-green-800 px-4 py-3 rounded-xl max-w-xl mx-auto border-l-4 border-green-600"
          >
            🎉 Thank you for your feedback!
          </motion.div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 text-center bg-red-100 text-red-700 px-4 py-3 rounded-xl max-w-xl mx-auto border-l-4 border-red-600"
          >
            {errorMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import Image from 'next/image';
import { MdManageSearch } from 'react-icons/md';
import springImage from '@/assets/spring.png';

const CheckCredentials = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    profilePic: '1',
    usernameLengthRatio: '',
    fullnameWords: '',
    fullnameLengthRatio: '',
    nameMatchesUsername: '',
    bioLength: '',
    hasExternalUrl: '',
    isPrivate: '',
    postsCount: '',
    followersCount: '',
    followingCount: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [probability, setProbability] = useState<number | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setErrorMessage(null);
  setPrediction(null);
  setProbability(null);

  if (!captcha) {
    setErrorMessage('Please complete the reCAPTCHA verification.');
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/check-instagram-profile", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, captcha }),
    });

    const result = await response.json();

    if (response.ok) {
      setPrediction(result.prediction);
      setProbability(result.probability);
    } else {
      setErrorMessage(result.message || 'Profile verification failed.');
    }
  } catch (error) {
    console.error('Error during submission:', error);
    setErrorMessage('Something went wrong. Please try again later.');
  }
};


  return (
    <div className="bg-gradient-to-b from-white to-[#D2DCFF] py-24 min-h-screen relative overflow-hidden">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Animated Image */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="absolute right-6 top-8 w-20 md:w-28 opacity-80"
        >
          <Image src={springImage} alt="Spring decoration" layout="responsive" />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <MdManageSearch size={48} className="text-blue-600 mx-auto mb-4" />
          <h2 className="section-title py-4">Submit Profile Metrics for Fake Account Detection</h2>
          <p className="section-description mt-2">Input AI-ready metrics to evaluate Instagram profile authenticity.</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-8 space-y-6"
        >
          {[ 
            { label: 'Profile Picture (1 for yes, 0 for no)', name: 'profilePic' },
            { label: 'Username Length Ratio (e.g., 0.27)', name: 'usernameLengthRatio' },
          ].map((field, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-lg font-medium">{field.label}</label>
              <input
                type="number"
                id={field.name}
                name={field.name}
                step="any"
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder={field.label}
                required
              />
            </div>
          ))}

          {/* Grouped Inputs in One Row */}
          <div className="grid grid-cols-2 gap-4">
            {[ 
              { label: 'Full Name Word Count', name: 'fullnameWords' },
              { label: 'Full Name Length Ratio', name: 'fullnameLengthRatio' },
            ].map((field, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-lg font-medium">{field.label}</label>
                <input
                  type="number"
                  id={field.name}
                  name={field.name}
                  step="any"
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder={field.label}
                  required
                />
              </div>
            ))}
          </div>

          {/* Additional Fields */}
          {[ 
            { label: 'Name Matches Username (1/0)', name: 'nameMatchesUsername' },
            { label: 'Bio Length', name: 'bioLength' },
            { label: 'Has External URL (1/0)', name: 'hasExternalUrl' },
            { label: 'Is Private Account (1/0)', name: 'isPrivate' },
            { label: 'Number of Posts', name: 'postsCount' },
            { label: 'Number of Followers', name: 'followersCount' },
            { label: 'Number of Follows', name: 'followingCount' },
          ].map((field, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-lg font-medium">{field.label}</label>
              <input
                type="number"
                id={field.name}
                name={field.name}
                step="any"
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder={field.label}
                required
              />
            </div>
          ))}

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(value) => setCaptcha(value)}
            />
          </div>

          {/* Error Message */}
          {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-3 text-lg font-semibold hover:bg-blue-700 transition"
          >
            Submit for Fake Profile Check
          </button>
          {prediction !== null && probability !== null && (
  <div className="bg-gray-100 mt-6 p-4 rounded text-center">
    <p className="text-lg font-semibold">
      Prediction: <span className={prediction === 1 ? 'text-red-600' : 'text-green-600'}>
        {prediction === 1 ? 'Fake Profile' : 'Real Profile'}
      </span>
    </p>
    <p className="text-md text-gray-700 mt-1">
      Confidence: {(probability * 100).toFixed(2)}%
    </p>
  </div>
)}

        </motion.form>
      </div>
    </div>
  );
};

export default CheckCredentials;

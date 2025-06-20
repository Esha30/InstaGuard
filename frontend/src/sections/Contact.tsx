"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    const res = await fetch("http://localhost:5000/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess("Message sent!");
      setForm({ name: "", email: "", message: "" });
    } else {
      alert(data.message || "Something went wrong.");
    }
  };

  return (
    <section className="bg-gradient-to-b from-white to-[#FCE7F3] py-24 overflow-x-clip min-h-screen">
      <div className="container">
        <div className="section-heading relative">
          <h2 className="section-title text-transparent bg-clip-text bg-gradient-to-r from-[#b43a9c] via-[#da0c50] to-[#fdc468]">
            Contact Us
          </h2>
          <p className="section-description mt-5">
            We'd love to hear from you! Get in touch with us for any inquiries or support.
          </p>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-[#FCE7F3] p-6 rounded-lg shadow-lg"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-lg font-medium">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your Name"
                className="input-field bg-white border border-pink-300 p-3 rounded-lg"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-lg font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Your Email"
                className="input-field bg-white border border-pink-300 p-3 rounded-lg"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-lg font-medium">
                Your Message
              </label>
              <textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message here..."
                className="input-field bg-white border border-pink-300 p-3 rounded-lg h-32"
                required
              />
            </div>

            <div className="flex justify-center gap-2 mt-5">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary bg-[#da0c50] hover:bg-[#b43a9c] text-white px-6 py-2 rounded-full font-semibold transition duration-300"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>

            {success && (
              <div className="text-green-600 text-center font-medium">
                {success}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

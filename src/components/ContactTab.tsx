/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, User, CheckCircle, Users } from "lucide-react";

export default function ContactTab() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `*New Enquiry – Cool Spot Cottages*\n\nName: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
    );
    window.open(`https://wa.me/917010395526?text=${msg}`, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const contactDetails = [
    {
      icon: Phone,
      label: "Primary Phone",
      value: "+91 70103 95526",
      href: "tel:+917010395526",
    },
    {
      icon: Phone,
      label: "Alternate Phone",
      value: "+91 90427 37424",
      href: "tel:+919042737424",
    },
    {
      icon: Phone,
      label: "Alternate Phone 2",
      value: "+91 94433 64626",
      href: "tel:+919443364626",
    },
    {
      icon: Mail,
      label: "Email",
      value: "Coolspotcottage@gmail.com",
      href: "mailto:Coolspotcottage@gmail.com",
    },
    {
      icon: Users,
      label: "Owner",
      value: "SARAVANA NAGARAJAN",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123/L, Vijayanagara Palace Road, Near HMT Gate, Ooty – 643001, Tamil Nadu",
    },
    {
      icon: Clock,
      label: "Business Hours",
      value: "Open 24/7  ·  Check-in: 12:00 PM  ·  Check-out: 11:00 AM",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#08151f] pt-20">
      {/* Header */}
      <section className="py-14 bg-[#001a52] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold block mb-3"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline-lg text-4xl md:text-5xl mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-sm max-w-xl mx-auto"
          >
            We're available 24/7. Reach out for bookings, queries, or anything about your stay at Cool Spot Cottages.
          </motion.p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 md:px-16 py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <h2 className="font-headline-md text-xl text-[#001a52] dark:text-[#dbe1ff] mb-6">
            Reach Us
          </h2>

          {contactDetails.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="bg-[#001a52]/8 dark:bg-white/5 p-3 rounded-full shrink-0">
                <Icon className="w-4 h-4 text-[#001a52] dark:text-[#819ae7]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block mb-0.5">
                  {label}
                </span>
                {href ? (
                  <a
                    href={href}
                    className="text-sm text-slate-700 dark:text-slate-300 hover:text-[#001a52] dark:hover:text-white font-medium transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{value}</p>
                )}
              </div>
            </div>
          ))}

          {/* WhatsApp quick link */}
          <a
            href="https://wa.me/917010395526"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-5 py-3 bg-[#25D366] hover:bg-[#20bc5a] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Chat on WhatsApp
          </a>

          {/* Google Maps link */}
          <div className="mt-2">
            <a
              href="https://www.google.com/maps/place//@11.4039116,76.7118485,20.75z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-[#001a52] dark:text-[#819ae7] font-bold uppercase tracking-wider hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              View on Google Maps
            </a>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm"
        >
          <h2 className="font-headline-md text-lg text-[#001a52] dark:text-[#dbe1ff] mb-5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            Send a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#001a52]/30 focus:border-[#001a52]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#001a52]/30 focus:border-[#001a52]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1.5">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Tell us about your stay requirements, dates, or any questions..."
                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#001a52]/30 focus:border-[#001a52]/40 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#001a52] hover:bg-[#0e2f76] text-white py-3 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {sent ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Sent via WhatsApp!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              This will open WhatsApp with your message pre-filled. You can also email us directly.
            </p>
          </form>
        </motion.div>
      </div>

      {/* Google Maps Embed */}
      <div className="max-w-5xl mx-auto px-6 md:px-16 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#001a52] dark:text-[#dbe1ff] uppercase tracking-wide flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            Find Us on the Map
          </h3>
          <a
            href="https://www.google.com/maps/place//@11.4039116,76.7118485,20.75z/data=!4m6!1m5!3m4!2zMTHCsDI0JzE0LjEiTiA3NsKwNDInNDIuNyJF!8m2!3d11.4039167!4d76.7118611?hl=en&entry=ttu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest text-[#001a52] dark:text-[#819ae7] hover:underline flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" /> Open in Google Maps
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm h-80">
          <iframe
            src="https://maps.google.com/maps?q=11.4039116,76.7118485&z=18&output=embed&hl=en"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Cool Spot Cottages Location"
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          123/L, Vijayanagara Palace Road, Near HMT Gate, Ooty – 643001, Tamil Nadu
        </p>
      </div>
    </div>
  );
}

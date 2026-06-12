/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Users, ArrowRight, Quote, Check, Info } from "lucide-react";
import Carousel from "./Carousel";
import { motion } from "motion/react";
import CountUp from "./CountUp";
import BlurText from "./BlurText";
import SplitText from "./SplitText";
import ThreeDHoverGallery from "./ThreeDHoverGallery";
import { Room } from "../types";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import coolCottagesFrontview from "../public/images/coolcottages_frontview.png";

interface DestinationsTabProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onInitiateBooking: (search: { checkIn: string; checkOut: string; guests: string }) => void;
}

export default function DestinationsTab({
  rooms,
  onSelectRoom,
  onInitiateBooking,
}: DestinationsTabProps) {
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2 Adults, 0 Children");
  const [errors, setErrors] = useState<{ checkIn?: string; checkOut?: string }>({});

  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0]
    : "";

  const [activeSubTab, setActiveSubTab] = useState<"rooms" | "visual">("rooms");

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    setErrors(prev => ({ ...prev, checkIn: undefined }));
    // Reset checkout if it's no longer valid after check-in changes
    if (checkOut && checkOut <= val) {
      setCheckOut("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { checkIn?: string; checkOut?: string } = {};

    if (!checkIn) {
      newErrors.checkIn = "Please select a check-in date.";
    } else if (checkIn < today) {
      newErrors.checkIn = "Check-in cannot be a past date.";
    }

    if (!checkOut) {
      newErrors.checkOut = "Please select a check-out date.";
    } else if (checkOut <= checkIn) {
      newErrors.checkOut = "Check-out must be after check-in.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onInitiateBooking({ checkIn, checkOut, guests });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden pt-20">
        {/* Spectacular Hotlinked Background */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center select-none"
          style={{
            backgroundImage: `url(${coolCottagesFrontview})`,
          }}
        />
        {/* Soft Indigo / Royal Navy overlay masking */}
        <div className="absolute inset-0 bg-[#001a52]/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#001a52]/40 to-[#f8f9ff]" />

        {/* Social Media Sidebar — left bottom of hero */}
        <div className="absolute left-4 md:left-7 bottom-36 md:bottom-44 z-20 flex flex-col items-center gap-3">
          {/* Vertical label */}
          <span
            className="text-white/30 font-sans font-bold tracking-[0.25em] text-[8px] uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", marginBottom: 4 }}
          >
            Follow Us
          </span>
          {/* Thin line above icons */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />

          {/* Facebook */}
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="group w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-[#1877f2] hover:border-[#1877f2] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(24,119,242,0.55)]"
          >
            <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="group w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e1306c] hover:to-[#833ab4] hover:border-[#e1306c] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(225,48,108,0.55)]"
          >
            <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/917010395526"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="group w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-[#25d366] hover:border-[#25d366] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(37,211,102,0.55)]"
          >
            <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </a>

          {/* Thin line below icons */}
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 md:px-16 max-w-5xl mx-auto flex flex-col items-center mt-12 md:mt-0">
          <BlurText
            text="Escape Into Luxury, Where Nature Meets Comfort"
            className="font-headline-lg text-4xl md:text-7xl text-white mb-6 text-glow leading-normal md:leading-tight justify-center"
            delay={120}
            direction="top"
            stepDuration={0.4}
          />
          <BlurText
            text="Discover a sanctuary of unparalleled elegance. Experience the perfect harmony of pristine mountain beauty and refined modern architecture."
            className="font-sans text-sm md:text-lg text-white/95 mb-10 max-w-2xl text-center leading-relaxed font-light justify-center"
            delay={40}
            direction="bottom"
            stepDuration={0.3}
          />

          {/* Floating Booking Widget */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: "easeOut" }}
            onSubmit={handleSearchSubmit}
            className="glass-panel text-left rounded-2xl p-5 md:p-6 w-full max-w-5xl shadow-2xl mx-auto flex flex-col md:flex-row gap-4 items-end bg-white/70"
          >
            <div className="w-full md:w-1/4">
              <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#001a52] mb-2">
                Check In
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#001a52]/60" />
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => handleCheckInChange(e.target.value)}
                  className={`w-full bg-white/60 border rounded-lg py-2.5 pl-9 pr-3 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all font-medium ${
                    errors.checkIn
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : "border-[#001a52]/10 focus:border-[#001a52]/40 focus:ring-[#001a52]/20"
                  }`}
                />
              </div>
              {errors.checkIn && (
                <p className="text-[10px] text-red-500 font-medium mt-1">{errors.checkIn}</p>
              )}
            </div>

            <div className="w-full md:w-1/4">
              <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#001a52] mb-2">
                Check Out
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#001a52]/60" />
                <input
                  type="date"
                  value={checkOut}
                  min={minCheckOut}
                  disabled={!checkIn}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setErrors(prev => ({ ...prev, checkOut: undefined }));
                  }}
                  className={`w-full bg-white/60 border rounded-lg py-2.5 pl-9 pr-3 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all font-medium ${
                    !checkIn ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    errors.checkOut
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : "border-[#001a52]/10 focus:border-[#001a52]/40 focus:ring-[#001a52]/20"
                  }`}
                />
              </div>
              {!checkIn ? (
                <p className="text-[10px] text-slate-400 font-medium mt-1">Select check-in first</p>
              ) : errors.checkOut ? (
                <p className="text-[10px] text-red-500 font-medium mt-1">{errors.checkOut}</p>
              ) : null}
            </div>

            <div className="w-full md:w-1/4">
              <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#001a52] mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#001a52]/60" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-white/60 border border-[#001a52]/10 rounded-lg py-2.5 pl-9 pr-8 text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#001a52]/40 focus:ring-1 focus:ring-[#001a52]/20 transition-all font-medium appearance-none"
                >
                  <option>2 Adults, 0 Children</option>
                  <option>2 Adults, 1 Child</option>
                  <option>2 Adults, 2 Children</option>
                  <option>4 Adults, 0 Children</option>
                  <option>1 Adult, 0 Children</option>
                </select>
              </div>
            </div>

            <div className="w-full md:w-1/4">
              <button
                type="submit"
                className="w-full bg-[#001a52] text-white hover:bg-[#0e2f76] rounded-lg py-3 font-sans text-xs uppercase tracking-widest font-extrabold transition-all shadow-md btn-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Availability</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section className="py-16 bg-[#e5eeff]/40 dark:bg-slate-900 border-y border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-[#001a52] dark:text-[#dbe1ff]"
          >
            <motion.div 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="p-4 border-b md:border-b-0 md:border-r border-[#001a52]/5 dark:border-white/5 md:last:border-none cursor-default"
            >
              <div className="font-headline-lg text-4xl md:text-6xl font-bold mb-2 text-[#001a52] dark:text-[#819ae7]">
                <CountUp from={0} to={98} duration={2} decimals={0} />%
              </div>
              <div className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold">
                Happy Guests
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="p-4 border-b md:border-b-0 md:border-r border-[#001a52]/5 dark:border-white/5 md:last:border-none cursor-default"
            >
              <div className="font-headline-lg text-4xl md:text-6xl font-bold mb-2 text-[#001a52] dark:text-[#819ae7]">
                <CountUp from={0} to={50000} duration={2.5} decimals={0} />+
              </div>
              <div className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold">
                Happy Customers
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="p-4 md:last:border-none cursor-default"
            >
              <div className="font-headline-lg text-4xl md:text-6xl font-bold mb-2 text-[#001a52] dark:text-[#819ae7]">
                <CountUp from={0} to={4.9} duration={2.4} decimals={1} />
              </div>
              <div className="font-sans text-xs uppercase tracking-widest text-slate-500 font-bold">
                Average Rating
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sub-tab Navigation Selector */}
      <section className="bg-transparent py-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex bg-[#001a52]/5 dark:bg-white/5 p-1 rounded-full border border-slate-100 dark:border-white/5"
          >
            <button
              onClick={() => setActiveSubTab("rooms")}
              className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-sans tracking-widest uppercase font-extrabold transition-all cursor-pointer ${
                activeSubTab === "rooms"
                  ? "bg-[#001a52] text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Exquisite Accommodations
            </button>
            <button
              onClick={() => setActiveSubTab("visual")}
              className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-sans tracking-widest uppercase font-extrabold transition-all cursor-pointer ${
                activeSubTab === "visual"
                  ? "bg-[#001a52] text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Visual Experience
            </button>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Content Rendering based on subtab selection */}
      {activeSubTab === "rooms" ? (
        <Carousel rooms={rooms} onSelectRoom={onSelectRoom} />
      ) : (
        <section className="py-12 bg-white dark:bg-[#00174a]/10 overflow-hidden border-t border-slate-100 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-sans text-[11px] uppercase tracking-widest text-[#819ae7] font-extrabold block mb-2"
            >
              Virtual Lookbook
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="font-headline-lg text-3xl md:text-4xl text-[#001a52] dark:text-[#dbe1ff] mb-4"
            >
              Immersive Resort Gallery
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="font-sans text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-8"
            >
              Explore custom timber designs, starlit campfire areas, and private shorelines in an interactive 3D space.
            </motion.p>
            <ThreeDHoverGallery />
          </div>
        </section>
      )}

      {/* Brand Value Quote / Editorial Section */}
      <section className="py-20 bg-[#efe4d9]/25 dark:bg-slate-950/40 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Quote className="w-10 h-10 text-slate-300 dark:text-slate-800 mx-auto mb-6 opacity-80" />
            <h3 className="font-headline-lg text-2xl md:text-3xl italic text-[#001a52] mb-6">
              "A peaceful stay with stunning views. Cool Spot Cottages offers warm hospitality, comfortable rooms, and an
              unforgettable Ooty experience surrounded by the beautiful Nilgiris."
            </h3>
            <span className="font-sans text-xs uppercase tracking-widest text-[#4a607c] font-black block">
              — Guest Review, 2026
            </span>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-[#00174a]/10 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <span className="text-[11px] uppercase tracking-widest text-[#819ae7] font-extrabold block mb-2">What Guests Say</span>
            <SplitText
              text="Guest Reviews"
              tag="h2"
              className="font-headline-lg text-3xl md:text-4xl text-[#001a52] dark:text-[#dbe1ff] mb-3"
              delay={60}
              duration={1}
              splitType="chars"
            />
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-amber-400 text-xl">★</span>
              ))}
            </div>
            <p className="text-slate-500 text-sm">Rated 4.9 / 5 by our guests</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                name: "Priya R.",
                location: "Chennai",
                rating: 5,
                date: "May 2026",
                review: "Absolutely loved our stay! The mountain view room was cozy and peaceful. The owner was very warm and helpful. Highly recommend for families visiting Ooty."
              },
              {
                name: "Arun K.",
                location: "Bangalore",
                rating: 5,
                date: "April 2026",
                review: "Great value for money. Rooms were clean and comfortable. Hot water available 24/7 which was a huge plus in the cool Ooty weather. Very close to Rose Garden too!"
              },
              {
                name: "Meena S.",
                location: "Coimbatore",
                rating: 5,
                date: "March 2026",
                review: "We stayed in the deluxe family room. Spacious, well-maintained, and the staff were very attentive. The location is perfect — near all the major attractions. Will definitely come back!"
              },
              {
                name: "Rajesh M.",
                location: "Hyderabad",
                rating: 5,
                date: "February 2026",
                review: "Peaceful environment, friendly staff, and excellent facilities. The security was great and we felt very safe throughout our stay. Ooty in these cool mountains is magical."
              },
              {
                name: "Divya T.",
                location: "Mumbai",
                rating: 4,
                date: "January 2026",
                review: "Very comfortable stay. Budget rooms are clean and well-equipped. Parking was free and convenient. Would suggest to all budget-conscious travelers visiting Ooty."
              },
              {
                name: "Karthik N.",
                location: "Madurai",
                rating: 5,
                date: "December 2025",
                review: "The cottage has a homely feel. Owner was responsive on WhatsApp for booking. The check-in was smooth, and the room was exactly as shown in photos. 10/10!"
              }
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-[#f8f9ff] dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#001a52] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{review.name}</div>
                      <div className="text-[10px] text-slate-400">{review.location} · {review.date}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <span key={j} className="text-amber-400 text-xs">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{review.review}</p>
              </motion.div>
            ))}
          </div>

          {/* Google Review CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#001a52] rounded-2xl p-6 text-white text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">⭐</span>
              <h3 className="font-headline-md text-lg font-bold">Share Your Experience</h3>
            </div>
            <p className="text-white/70 text-sm mb-5 max-w-md mx-auto">
              Stayed with us? We'd love to hear about your experience. Your review helps other guests and supports our small family-run cottage.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://www.google.com/maps/place//@11.4039116,76.7118485,20.75z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#001a52] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-50 transition-all shadow-sm"
              >
                <span>⭐</span> Write a Google Review
              </a>
              <a
                href="https://wa.me/919042737424?text=Hello!%20I%20recently%20stayed%20at%20Cool%20Spot%20Cottages%20and%20wanted%20to%20share%20my%20feedback."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#20bc5a] transition-all shadow-sm"
              >
                <span>💬</span> Send Feedback on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

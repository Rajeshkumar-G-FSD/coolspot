/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Share2, Camera, Compass, Sparkles, AlertCircle, Phone, MessageCircle, Mail, MapPin, Clock, ExternalLink, PhoneCall } from "lucide-react";
import coolspotLogo from "./public/images/coolspot_roundlogo-removebg-preview.png";
import Navbar from "./components/Navbar";
import DestinationsTab from "./components/DestinationsTab";
import ExperiencesTab from "./components/ExperiencesTab";
import PackagesTab from "./components/PackagesTab";
import BookingsTab from "./components/BookingsTab";
import CottageInfoTab from "./components/CottageInfoTab";
import BookingModal from "./components/BookingModal";
import Concierge from "./components/Concierge";
import BookingFlowTab from "./components/BookingFlowTab";
import AdminDashboardTab from "./components/AdminDashboardTab";
import RoomsTab from "./components/RoomsTab";
import GalleryTab from "./components/GalleryTab";

import ContactTab from "./components/ContactTab";
import PolicyTab from "./components/PolicyTab";
import type { PolicyType } from "./components/PolicyTab";

import { Room, Experience, Booking, SpecialPackage } from "./types";
import { VILLAS_DATA, EXPERIENCES_DATA, PACKAGES_DATA } from "./data";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("destinations");
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [preloaderActive, setPreloaderActive] = useState(true);

  // Booking states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room>(VILLAS_DATA[0]);
  const [selectedExperiences, setSelectedExperiences] = useState<Experience[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Prefilled reservation search terms
  const [prefilledDates, setPrefilledDates] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2 Adults, 0 Children",
  });
  const [prefilledChildAges, setPrefilledChildAges] = useState<string[]>([]);
  const [activePackage, setActivePackage] = useState<SpecialPackage | null>(null);

  // Preloader timeout matching HTML sunrise timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreloaderActive(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedMode = localStorage.getItem("COOL_COTTAGES_THEME");
    if (storedMode === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("COOL_COTTAGES_THEME", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Scroll to top on every tab change so the hero / page top is always visible
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Sync bookings from client-side local storage on startup
  useEffect(() => {
    try {
      const persisted = localStorage.getItem("LUM_BOOKINGS");
      if (persisted) {
        setBookings(JSON.parse(persisted));
      }
    } catch (e) {
      console.error("Local storage booking resolution error:", e);
    }
  }, []);

  // Handle individual select experience to stay list toggling
  const handleToggleStayExperience = (exp: Experience) => {
    if (selectedExperiences.some((e) => e.id === exp.id)) {
      setSelectedExperiences((prev) => prev.filter((e) => e.id !== exp.id));
    } else {
      setSelectedExperiences((prev) => [...prev, exp]);
    }
    // Automatically transition checkouts modal
    setIsBookingModalOpen(true);
  };

  // Launch modal checkout with a selected villa
  const handleSelectRoomCheckout = (room: Room) => {
    setSelectedRoom(room);
    setActivePackage(null);
    setActiveTab("booking-flow");
  };

  // Launch modal checkout via raw search checking triggers
  const handleSearchInitiatedCheckout = (searchArgs: {
    checkIn: string;
    checkOut: string;
    guests: string;
    childAges: string[];
  }) => {
    const { childAges, ...dates } = searchArgs;
    setPrefilledDates(dates);
    setPrefilledChildAges(childAges);
    setSelectedRoom(VILLAS_DATA[0]);
    setActivePackage(null);
    setActiveTab("booking-flow");
  };

  // Preconfigure modal booking using preselected Packages/Offers
  const handleSelectPackageCheckout = (pkg: SpecialPackage) => {
    let targetRoom = VILLAS_DATA[0];
    if (pkg.id === "honeymoon-escape") {
      targetRoom = VILLAS_DATA.find((r) => r.id === "deluxe-family") || VILLAS_DATA[0];
    } else {
      targetRoom = VILLAS_DATA.find((r) => r.id === "mountain-view") || VILLAS_DATA[0];
    }

    const matchedExps = EXPERIENCES_DATA.filter((exp) => pkg.includedExperiences.includes(exp.id));

    // Dynamic prepopulation logic
    const today = new Date();
    const futureCheckIn = new Date();
    futureCheckIn.setDate(today.getDate() + 14); // Prefill check-in to 2 weeks out

    const futureCheckOut = new Date();
    futureCheckOut.setDate(futureCheckIn.getDate() + pkg.durationDays);

    setPrefilledDates({
      checkIn: futureCheckIn.toISOString().split("T")[0],
      checkOut: futureCheckOut.toISOString().split("T")[0],
      guests: pkg.id === "honeymoon-escape" ? "2 Adults, 0 Children" : "4 Adults, 0 Children",
    });

    setSelectedRoom(targetRoom);
    setSelectedExperiences(matchedExps);
    setActivePackage(pkg);
    setActiveTab("booking-flow");
  };

  // Confirm booking callback — stays on booking-flow so step 3 (payment QR) is shown
  const handleConfirmBooking = (newBooking: Booking) => {
    const updated = [...bookings, newBooking];
    setBookings(updated);
    localStorage.setItem("LUM_BOOKINGS", JSON.stringify(updated));
  };

  // Cancel booking holds
  const handleCancelBooking = (bookingId: string) => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    setBookings(updated);
    localStorage.setItem("LUM_BOOKINGS", JSON.stringify(updated));
  };

  return (
    <div className={`${darkMode ? "dark" : ""} bg-[#f8f9ff] dark:bg-[#08151f] text-[#0b1c30] dark:text-[#f8fafc] font-sans selection:bg-[#0e2f76]/20 [overflow-x:clip] min-h-screen flex flex-col justify-between`}>
      
      {/* 1. Immersive Preloader Sunrise Mask */}
      {preloaderActive && (
        <div
          id="preloader"
          className="fixed inset-0 z-[100] bg-gradient-to-b from-[#001a52] via-[#0e2f76] to-[#f8f9ff] flex flex-col items-center justify-center transition-all duration-1000 select-none animate-fade-out"
        >
          {/* Logo */}
          <img
            src={coolspotLogo}
            alt="Cool Spot Cottages"
            className="w-32 h-32 object-contain animate-pulse drop-shadow-[0_0_30px_rgba(255,218,100,0.6)] mb-6"
          />
          <span className="font-sans text-sm tracking-widest uppercase text-white/80 font-semibold">
            Preparing Your Luxury Escape...
          </span>
        </div>
      )}

      {/* WhatsApp + Call Floating Buttons (bottom-right) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40 select-none">
        <a
          href="tel:+919042737424"
          className="w-12 h-12 bg-[#001a52] text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg border border-white/10 group"
          title="Call Now: +91 90427 37424"
        >
          <Phone className="w-5 h-5 group-hover:animate-pulse" />
        </a>
        <a
          href="https://wa.me/919042737424?text=Hello%20Cool%20Spot%20Cottages!%20I%20would%20like%20to%20enquire%20about%20booking."
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-green-500/30 group"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
        </a>
      </div>

      {/* 3. Global Glass Header/Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openConcierge={() => setIsConciergeOpen(true)}
        bookingCount={bookings.length}
        darkMode={darkMode}
        toggleTheme={() => setDarkMode((prev) => !prev)}
      />

      {/* 4. Active Router Module Interface Stage */}
      <main className="flex-1 w-full">
        {activeTab === "destinations" && (
          <DestinationsTab
            rooms={VILLAS_DATA}
            onSelectRoom={handleSelectRoomCheckout}
            onInitiateBooking={handleSearchInitiatedCheckout}
          />
        )}

        {activeTab === "experiences" && (
          <ExperiencesTab
            experiences={EXPERIENCES_DATA}
            onSelectExperience={handleToggleStayExperience}
            selectedExpIds={selectedExperiences.map((e) => e.id)}
          />
        )}

        {activeTab === "packages" && (
          <PackagesTab
            packages={PACKAGES_DATA}
            rooms={VILLAS_DATA}
            experiences={EXPERIENCES_DATA}
            onSelectPackage={handleSelectPackageCheckout}
          />
        )}

        {activeTab === "bookings" && (
          <BookingsTab
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onExploreRooms={() => setActiveTab("destinations")}
          />
        )}

        {activeTab === "about" && (
          <CottageInfoTab />
        )}

        {activeTab === "booking-flow" && (
          <BookingFlowTab
            initialRoom={selectedRoom}
            initialCheckIn={prefilledDates.checkIn}
            initialCheckOut={prefilledDates.checkOut}
            initialGuests={prefilledDates.guests}
            initialChildAges={prefilledChildAges}
            onBookingConfirmed={handleConfirmBooking}
          />
        )}

        {activeTab === "admin" && (
          <AdminDashboardTab />
        )}

        {activeTab === "rooms" && (
          <RoomsTab rooms={VILLAS_DATA} onSelectRoom={handleSelectRoomCheckout} />
        )}

        {activeTab === "gallery" && (
          <GalleryTab />
        )}

        {activeTab === "contact" && (
          <ContactTab />
        )}

        {(activeTab === "privacy" || activeTab === "terms" || activeTab === "cancellation" || activeTab === "refund") && (
          <PolicyTab policyType={activeTab as PolicyType} />
        )}
      </main>

      {/* 5. Stay Reservation configuration checkout modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        rooms={VILLAS_DATA}
        experiences={EXPERIENCES_DATA}
        selectedRoom={selectedRoom}
        selectedExperiences={selectedExperiences}
        prefilledCheckIn={prefilledDates.checkIn}
        prefilledCheckOut={prefilledDates.checkOut}
        prefilledGuests={prefilledDates.guests}
        activePackage={activePackage}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* 6. AI travel Concierge assistant drawer context */}
      <Concierge
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        onNavigateToTab={setActiveTab}
      />

      {/* 7. Footer */}
      <footer className="relative bg-[#000d2e] text-white w-full select-none overflow-hidden">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* Faint background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,26,82,0.6),transparent)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-16 pt-14 pb-8">

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">

            {/* ── Col 1 · Brand ── */}
            <div className="flex flex-col gap-4">
              <img src={coolspotLogo} alt="Cool Spot Cottage" className="h-14 w-auto object-contain" />
              <p className="text-slate-300/80 text-xs leading-relaxed max-w-[220px] italic font-light">
                Relax, Refresh and Reconnect with Nature.
              </p>
              <p className="text-amber-400/70 text-[10px] uppercase tracking-[0.15em] font-bold">
                Owner: Saravana Nagarajan
              </p>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/917010395526"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-all duration-200 text-[11px] font-semibold w-fit"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Us
              </a>
            </div>

            {/* ── Col 2 · Contact ── */}
            <div className="space-y-4">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400 font-black block mb-3">Get in Touch</span>
                <div className="w-6 h-[1.5px] bg-amber-400/40 mb-4" />
              </div>

              <div className="space-y-3">
                {/* Primary numbers */}
                <div className="flex items-start gap-2.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <a href="tel:+917010395526" className="hover:text-white transition-colors font-mono block">+91 70103 95526</a>
                    <a href="tel:+919042737424" className="hover:text-white transition-colors font-mono block">+91 90427 37424</a>
                  </div>
                </div>

                {/* Contact number */}
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold">Contact</span>
                    <a href="tel:+919443364626" className="hover:text-white transition-colors font-mono text-slate-300">+91 94433 64626</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <a href="mailto:Coolspotcottage@gmail.com" className="text-[11px] text-slate-300 hover:text-white transition-colors">
                    Coolspotcottage@gmail.com
                  </a>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-400 leading-relaxed">
                    123/L, Vijayanagara Palace Road,<br />
                    Near HMT Gate, Ooty – 643001
                  </span>
                </div>
              </div>
            </div>

            {/* ── Col 3 · Info + Links ── */}
            <div className="space-y-4">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400 font-black block mb-3">Information</span>
                <div className="w-6 h-[1.5px] bg-amber-400/40 mb-4" />
              </div>

              {/* Hours */}
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Open <strong className="text-white">24/7</strong></span>
                </div>
                <div className="flex items-center gap-2 pl-5">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider">Check-in</span>
                  <span className="font-bold text-white">12:00 PM</span>
                </div>
                <div className="flex items-center gap-2 pl-5">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider">Check-out</span>
                  <span className="font-bold text-white">11:00 AM</span>
                </div>
              </div>

              {/* Quick links row 1 */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-widest font-semibold">
                  <a
                    href="https://www.google.com/maps/place//@11.4039116,76.7118485,20.75z"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    google maps
                  </a>
                  <button onClick={() => setActiveTab("privacy")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
                  <button onClick={() => setActiveTab("rooms")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Rooms</button>
                  <button onClick={() => setActiveTab("gallery")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Gallery</button>
                  <button onClick={() => setActiveTab("contact")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Contact</button>
                </div>
              </div>

              {/* Policy links — Cancellation & Refund together */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-widest font-semibold">
                <button onClick={() => setActiveTab("cancellation")} className="text-slate-400 hover:text-amber-300 transition-colors cursor-pointer">Cancellation Policy</button>
                <span className="text-white/10 select-none">·</span>
                <button onClick={() => setActiveTab("refund")} className="text-slate-400 hover:text-amber-300 transition-colors cursor-pointer">Refund Policy</button>
              </div>

              {/* Terms & Conditions — below */}
              <div>
                <button
                  onClick={() => setActiveTab("terms")}
                  className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 hover:text-white transition-colors cursor-pointer border-b border-slate-500/30 hover:border-white/40 pb-0.5"
                >
                  Terms &amp; Conditions
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-slate-500 font-sans text-[10px] uppercase font-bold tracking-wider">
              © 2026 Cool Spot Cottage. All rights reserved.
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 text-[10px] uppercase tracking-wider">
              <MapPin className="w-3 h-3 text-amber-400/50" />
              Ooty, Tamil Nadu, India
            </div>
            <div className="text-slate-600 text-[10px] tracking-wider">
              Developed by{" "}
              <a
                href="https://www.datazync.com"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-block font-semibold text-amber-400/60 hover:text-amber-300 transition-colors duration-300 group"
              >
                DataZync
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amber-300 group-hover:w-full transition-all duration-300" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

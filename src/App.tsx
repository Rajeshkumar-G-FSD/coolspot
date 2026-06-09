/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Share2, Camera, Compass, Sparkles, AlertCircle } from "lucide-react";
import coolspotLogo from "./public/images/coolspot.png";
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
  }) => {
    setPrefilledDates(searchArgs);
    setSelectedRoom(VILLAS_DATA[0]); // Default first villa category
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

  // Confirm booking callback
  const handleConfirmBooking = (newBooking: Booking) => {
    const updated = [...bookings, newBooking];
    setBookings(updated);
    localStorage.setItem("LUM_BOOKINGS", JSON.stringify(updated));
    setActiveTab("bookings"); // Navigate to Reservation Ledger immediately to show invoice
  };

  // Cancel booking holds
  const handleCancelBooking = (bookingId: string) => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    setBookings(updated);
    localStorage.setItem("LUM_BOOKINGS", JSON.stringify(updated));
  };

  return (
    <div className={`${darkMode ? "dark" : ""} bg-[#f8f9ff] dark:bg-[#08151f] text-[#0b1c30] dark:text-[#f8fafc] font-sans selection:bg-[#0e2f76]/20 overflow-x-hidden min-h-screen flex flex-col justify-between`}>
      
      {/* 1. Immersive Preloader Sunrise Mask */}
      {preloaderActive && (
        <div
          id="preloader"
          className="fixed inset-0 z-[100] bg-gradient-to-b from-[#001a52] via-[#0e2f76] to-[#f8f9ff] flex flex-col items-center justify-center transition-all duration-1000 select-none animate-fade-out"
        >
          {/* Pulsing Sun Sunrise Mask */}
          <div className="w-[110px] h-[110px] bg-gradient-to-r from-amber-200 to-indigo-100 rounded-full animate-pulse shadow-[0_0_50px_rgba(255,218,214,0.8)] mb-8" />
          <h1 className="font-headline-md text-3xl italic tracking-widest uppercase mb-1 animate-bounce flex gap-2">
            <span className="text-[#819ae7]">COOL</span>
            <span className="text-amber-300">SPOT</span>
          </h1>
          <span className="font-sans text-sm tracking-widest uppercase text-amber-200/80 font-semibold mb-1">
            Cottages
          </span>
          <span className="font-sans text-xs tracking-widest uppercase text-white/70 font-semibold h-4">
            Preparing Your Luxury Escape...
          </span>
        </div>
      )}

      {/* 2. Floating Aesthetic Actions Rail bar */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-40 select-none">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Resort booking referral link copied to your clipboard!");
          }}
          className="w-11 h-11 bg-[#001a52] text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg hover:shadow-indigo-900/35 border border-white/10 group cursor-pointer"
          title="Share Portal with Companions"
        >
          <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>

        <button
          onClick={() => setActiveTab("destinations")}
          className="w-11 h-11 bg-[#001a52] text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg hover:shadow-indigo-900/35 border border-white/10 group cursor-pointer"
          title="Gallery View"
        >
          <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
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
            onBookingConfirmed={handleConfirmBooking}
          />
        )}

        {activeTab === "admin" && (
          <AdminDashboardTab />
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

      {/* 7. Elegant Footer Section */}
      <footer className="bg-[#001a52] text-white w-full py-12 select-none border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand + Tagline + Owner */}
            <div className="flex flex-col items-start gap-3">
              <img src={coolspotLogo} alt="Cool Spot Cottage" className="h-12 w-auto object-contain" />
              <p className="text-slate-300 text-xs leading-relaxed max-w-xs italic">
                Relax, Refresh and Reconnect with Nature.
              </p>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                Owner: SARAVANA NAGARAJAN
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block">Contact Us</span>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>📞</span>
                  <a href="tel:+917010395526" className="hover:text-white transition-colors font-mono">+91 70103 95526</a>
                  <span className="text-slate-500">·</span>
                  <a href="tel:+919042737424" className="hover:text-white transition-colors font-mono">+91 90427 37424</a>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span className="text-slate-400 text-[10px]">Alternate:</span>
                  <a href="tel:+919443364626" className="hover:text-white transition-colors font-mono text-[11px]">+91 94433 64626</a>
                </div>
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <a href="https://wa.me/917010395526" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    WhatsApp: 70103 95526
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <a href="mailto:Coolspotcottage@gmail.com" className="hover:text-white transition-colors">
                    Coolspotcottage@gmail.com
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">📍</span>
                  <span className="leading-relaxed">123/L, Vijayanagara palace road, Near HMT gate, Ooty – 643001</span>
                </div>
              </div>
            </div>

            {/* Hours + Quick Links */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block">Information</span>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div>⏰ Open <span className="font-bold text-white">24/7</span></div>
                <div>🏨 Check-in: <span className="font-bold text-white">12:00 PM</span></div>
                <div>🏨 Check-out: <span className="font-bold text-white">11:00 AM</span></div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 font-sans text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                <a
                  href="https://www.google.com/maps/place//@11.4039116,76.7118485,20.75z"
                  target="_blank" rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  Google Maps
                </a>
                <button onClick={() => alert("Privacy Policies available at the cottage guide desk.")} className="hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => alert("Terms of Service governed under Cool Spot Cottage laws.")} className="hover:text-white transition-colors">Terms</button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-slate-400 font-sans text-[10px] uppercase font-bold tracking-wider">
              © 2026 Cool Spot Cottage. All rights reserved.
            </div>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Ooty, Tamil Nadu, India</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

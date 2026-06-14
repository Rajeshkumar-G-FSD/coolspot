/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Users, ArrowRight, Quote, Check, ChevronDown } from "lucide-react";
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
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const guests = `${adults} Adult${adults !== 1 ? "s" : ""}, ${children} Child${children !== 1 ? "ren" : ""}`;
  const [errors, setErrors] = useState<{ checkIn?: string; checkOut?: string }>({});
  const [roomCount, setRoomCount] = useState(1);
  const [activePanel, setActivePanel] = useState<"checkin" | "checkout" | "guests" | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [calViewYear, setCalViewYear] = useState(() => new Date().getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(() => new Date().getMonth());
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [childAges, setChildAges] = useState<string[]>([]);

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

  // Auto-sync rooms when adults exceed 3
  useEffect(() => {
    setRoomCount(Math.min(9, Math.ceil((adults + children) / 3)));
  }, [adults, children]);

  // Sync childAges array length with children count
  useEffect(() => {
    setChildAges((prev: string[]) => {
      const arr = [...prev];
      while (arr.length < children) arr.push("");
      return arr.slice(0, children);
    });
  }, [children]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fmtDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.getDate(),
      monthYear: d.toLocaleString("en", { month: "short" }) + "'" + String(d.getFullYear()).slice(2),
      weekday: d.toLocaleString("en", { weekday: "long" }),
    };
  };

  const fmtDateDisplay = (ds: string) => {
    const d = new Date(ds + "T00:00:00");
    return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })} '${String(d.getFullYear()).slice(2)}`;
  };

  const handleCalDateClick = (ds: string) => {
    if (!checkIn || (checkIn && checkOut) || activePanel === "checkin") {
      setCheckIn(ds);
      setCheckOut("");
      setHoverDate(null);
      setErrors({});
      setActivePanel("checkout");
    } else {
      if (ds > checkIn) {
        setCheckOut(ds);
        setHoverDate(null);
        setErrors({});
        setActivePanel(null);
      } else {
        setCheckIn(ds);
        setCheckOut("");
        setHoverDate(null);
      }
    }
  };

  const handleCalPrev = () => {
    if (calViewMonth === 0) { setCalViewMonth(11); setCalViewYear((y: number) => y - 1); }
    else setCalViewMonth((m: number) => m - 1);
  };

  const handleCalNext = () => {
    if (calViewMonth === 11) { setCalViewMonth(0); setCalViewYear((y: number) => y + 1); }
    else setCalViewMonth((m: number) => m + 1);
  };

  const renderCalMonth = (baseYear: number, rawMonth: number, showPrev: boolean, showNext: boolean) => {
    const m = ((rawMonth % 12) + 12) % 12;
    const y = rawMonth < 0 ? baseYear - 1 : rawMonth > 11 ? baseYear + 1 : baseYear;
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const monthName = new Date(y, m, 1).toLocaleString("en", { month: "long" });
    const rangeEnd = checkOut || hoverDate;
    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          {showPrev ? (
            <button type="button" onClick={handleCalPrev}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#001a52] transition-all cursor-pointer">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          ) : <span className="w-7" />}
          <span className="text-sm font-black text-slate-800">
            {monthName} <span className="font-normal text-slate-400 text-xs">{y}</span>
          </span>
          {showNext ? (
            <button type="button" onClick={handleCalNext}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#001a52] transition-all cursor-pointer">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          ) : <span className="w-7" />}
        </div>
        <div className="grid grid-cols-7 mb-1">
          {weekdays.map(d => (
            <div key={d} className="text-[9px] font-bold text-slate-400 text-center py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPast = ds < today;
            const isCi = ds === checkIn;
            const isCo = ds === checkOut;
            const isToday = ds === today;
            const inRange = !!(checkIn && rangeEnd && ds > checkIn && ds < rangeEnd);
            const isRangeEnd = !!(rangeEnd && ds === rangeEnd && ds !== checkIn);
            let cls = "relative text-center py-1.5 text-xs transition-all duration-100 select-none ";
            if (isPast) {
              cls += "text-slate-200 cursor-not-allowed";
            } else if (isCi) {
              cls += `bg-[#001a52] text-white font-black ${rangeEnd ? "rounded-l-full" : "rounded-full"} cursor-pointer`;
            } else if (isCo || isRangeEnd) {
              cls += "bg-[#001a52] text-white font-black rounded-r-full cursor-pointer";
            } else if (inRange) {
              cls += "bg-[#e8eef8] text-[#001a52] cursor-pointer";
            } else {
              cls += `hover:bg-slate-100 hover:rounded-full cursor-pointer ${isToday ? "font-black text-[#001a52]" : "text-slate-700"}`;
            }
            return (
              <button
                key={ds}
                type="button"
                disabled={isPast}
                onClick={() => !isPast && handleCalDateClick(ds)}
                onMouseEnter={() => { if (!isPast && checkIn && !checkOut) setHoverDate(ds); }}
                onMouseLeave={() => setHoverDate(null)}
                className={cls}
              >
                <span className="relative inline-block">
                  {day}
                  {isToday && !isCi && !isCo && (
                    <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#001a52]" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center pt-20">
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

          {/* Floating Booking Widget — Tab-style Design */}
          <motion.div
            ref={widgetRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto relative"
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="bg-white/96 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,26,82,0.18)] border border-white/60 p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-3 items-stretch">

                  {/* ── Check-In ── */}
                  <button type="button"
                    onClick={() => setActivePanel(p => p === "checkin" ? null : "checkin")}
                    className={`relative flex-1 border rounded-xl px-4 py-3.5 text-left transition-all duration-200 cursor-pointer ${
                      activePanel === "checkin" ? "border-[#001a52]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className={`absolute -top-[9px] left-3 px-1 bg-white text-[11px] font-medium transition-colors ${activePanel === "checkin" ? "text-[#001a52]" : "text-slate-500"}`}>
                      Check-in
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        {checkIn ? (
                          <>
                            <div className="text-[17px] font-bold text-slate-900 leading-tight">{fmtDateDisplay(checkIn)}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{fmtDate(checkIn)?.weekday}</div>
                          </>
                        ) : (
                          <div className="text-[15px] font-medium text-slate-300">Add date</div>
                        )}
                        {errors.checkIn && <p className="text-[9px] text-red-500 font-bold mt-0.5">{errors.checkIn}</p>}
                      </div>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${activePanel === "checkin" ? "rotate-180 text-[#001a52]" : "text-[#3b5bdb]"}`} />
                    </div>
                  </button>

                  {/* ── Check-Out ── */}
                  <button type="button"
                    onClick={() => setActivePanel(p => p === "checkout" ? null : "checkout")}
                    className={`relative flex-1 border rounded-xl px-4 py-3.5 text-left transition-all duration-200 cursor-pointer ${
                      activePanel === "checkout" ? "border-[#001a52]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className={`absolute -top-[9px] left-3 px-1 bg-white text-[11px] font-medium transition-colors ${activePanel === "checkout" ? "text-[#001a52]" : "text-slate-500"}`}>
                      Check-out
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        {checkOut ? (
                          <>
                            <div className="text-[17px] font-bold text-slate-900 leading-tight">{fmtDateDisplay(checkOut)}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{fmtDate(checkOut)?.weekday}</div>
                          </>
                        ) : (
                          <div className="text-[15px] font-medium text-slate-300">Add date</div>
                        )}
                        {errors.checkOut && <p className="text-[9px] text-red-500 font-bold mt-0.5">{errors.checkOut}</p>}
                      </div>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${activePanel === "checkout" ? "rotate-180 text-[#001a52]" : "text-[#3b5bdb]"}`} />
                    </div>
                  </button>

                  {/* ── Guests & Rooms ── */}
                  <button type="button"
                    onClick={() => setActivePanel(p => p === "guests" ? null : "guests")}
                    className={`relative flex-[1.5] border rounded-xl px-4 py-3.5 text-left transition-all duration-200 cursor-pointer ${
                      activePanel === "guests" ? "border-[#001a52]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className={`absolute -top-[9px] left-3 px-1 bg-white text-[11px] font-medium transition-colors ${activePanel === "guests" ? "text-[#001a52]" : "text-slate-500"}`}>
                      Guests &amp; Rooms
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[17px] font-bold text-slate-900 leading-tight">
                        {adults} Adult{adults > 1 ? "s" : ""} | {roomCount} Room{roomCount > 1 ? "s" : ""}
                        {children > 0 && <span> | {children} Child{children > 1 ? "ren" : ""}</span>}
                      </div>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${activePanel === "guests" ? "rotate-180 text-[#001a52]" : "text-[#3b5bdb]"}`} />
                    </div>
                  </button>

                  {/* ── CTA ── */}
                  <button
                    type="submit"
                    disabled={!checkIn || !checkOut}
                    className={`rounded-xl px-6 font-sans text-[11px] uppercase tracking-[0.15em] font-extrabold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap py-3.5 md:py-0 ${
                      checkIn && checkOut
                        ? "bg-[#001a52] text-white hover:bg-[#0c2560] active:scale-[0.97] shadow-lg shadow-[#001a52]/25 hover:shadow-[#001a52]/40 hover:shadow-xl cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>
            </form>

            {/* Unified Calendar Date Picker Panel */}
            {(activePanel === "checkin" || activePanel === "checkout") && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_12px_48px_rgba(0,26,82,0.22)] border border-slate-100 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-[#001a52]">
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">
                    {activePanel === "checkin" ? "Select check-in" : "Select check-out"}
                  </span>
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    {checkIn ? (
                      <>
                        <span className="text-white">{fmtDateDisplay(checkIn)}</span>
                        <span className="text-white/30 font-light">→</span>
                        {checkOut ? (
                          <span className="text-amber-300">{fmtDateDisplay(checkOut)}</span>
                        ) : (
                          <span className="text-white/35 font-normal text-xs">Check-out</span>
                        )}
                      </>
                    ) : (
                      <span className="text-white/40 font-normal text-xs">Select check-in date</span>
                    )}
                  </div>
                </div>
                {/* Two-month grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-50">
                  <div className="p-5 md:p-6">{renderCalMonth(calViewYear, calViewMonth, true, false)}</div>
                  <div className="p-5 md:p-6">{renderCalMonth(calViewYear, calViewMonth + 1, false, true)}</div>
                </div>
                {/* Footer hint */}
                <div className="px-6 py-2 border-t border-slate-50 bg-slate-50/60">
                  <p className="text-[10px] text-slate-400 text-center">
                    {!checkIn ? "Click to set check-in date" : !checkOut ? "Click to set check-out date" : "Both dates selected — click Check Availability"}
                  </p>
                </div>
              </div>
            )}

            {/* Rooms & Guests Dropdown Panel */}
            {activePanel === "guests" && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 w-80 max-h-[80vh] overflow-y-auto">

                {/* Room counter */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-800">Room</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setRoomCount(r => Math.max(1, r - 1))}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#001a52] hover:text-[#001a52] transition-all font-bold text-lg leading-none cursor-pointer">−</button>
                    <span className="w-5 text-center text-base font-black text-slate-800">{roomCount}</span>
                    <button type="button" onClick={() => setRoomCount(r => Math.min(9, r + 1))}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#001a52] hover:text-[#001a52] transition-all font-bold text-lg leading-none cursor-pointer">+</button>
                  </div>
                </div>

                {/* Adults counter */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-800">Adults</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setAdults(a => Math.max(1, a - 1))}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#001a52] hover:text-[#001a52] transition-all font-bold text-lg leading-none cursor-pointer">−</button>
                    <span className="w-5 text-center text-base font-black text-slate-800">{adults}</span>
                    <button type="button" onClick={() => setAdults(a => Math.min(24, a + 1))}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#001a52] hover:text-[#001a52] transition-all font-bold text-lg leading-none cursor-pointer">+</button>
                  </div>
                </div>

                {/* Children counter */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Children</span>
                    <span className="text-[11px] text-slate-400">0 - 17 Years Old</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setChildren(c => Math.max(0, c - 1))}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#001a52] hover:text-[#001a52] transition-all font-bold text-lg leading-none cursor-pointer">−</button>
                    <span className="w-5 text-center text-base font-black text-slate-800">{children}</span>
                    <button type="button" onClick={() => setChildren(c => Math.min(12, c + 1))}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#001a52] hover:text-[#001a52] transition-all font-bold text-lg leading-none cursor-pointer">+</button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-3 leading-relaxed">
                  Please provide right number of children along with their right age for best options and prices.
                </p>

                {/* Child age dropdowns */}
                {children > 0 && (
                  <div className="mt-3 pb-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-700 mb-2">Age of Children</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {Array.from({ length: children }, (_, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">Child {i + 1}</span>
                          <select
                            value={childAges[i] || ""}
                            onChange={(e) => {
                              const arr = [...childAges];
                              arr[i] = e.target.value;
                              setChildAges(arr);
                            }}
                            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#001a52] cursor-pointer"
                          >
                            <option value="">Select</option>
                            {Array.from({ length: 18 }, (_, age) => (
                              <option key={age} value={String(age)}>{age} yr{age !== 1 ? "s" : ""}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pets checkbox */}
                <label className="flex items-start gap-3 py-3 border-b border-slate-100 cursor-pointer group">
                  <input type="checkbox" className="rounded mt-0.5 accent-[#001a52]" />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-slate-800 block group-hover:text-[#001a52] transition-colors">Are you travelling with pets?</span>
                    <span className="text-[11px] text-slate-400 leading-relaxed">Selecting this option will show only pet-friendly properties. Please review the pet policies & applicable fees, if any.</span>
                  </div>
                  <span className="text-2xl select-none">🐾</span>
                </label>

                {/* 2-room notice */}
                {(adults + children) > 3 && (
                  <div className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 font-semibold text-center">
                    {Math.min(9, Math.ceil((adults + children) / 3))} rooms auto-selected for {adults + children} guests
                  </div>
                )}

                {/* Search button */}
                {(!checkIn || !checkOut) && (
                  <p className="text-[10px] text-red-500 font-semibold mt-3 text-center">
                    {!checkIn ? "Please select a check-in date first." : "Please select a check-out date."}
                  </p>
                )}
                <button
                  type="button"
                  disabled={!checkIn || !checkOut}
                  onClick={() => {
                    setActivePanel(null);
                    setErrors({});
                    onInitiateBooking({ checkIn, checkOut, guests });
                  }}
                  className={`w-full mt-2 btn-apple py-3 font-sans text-xs uppercase tracking-widest font-semibold shadow-md ${
                    checkIn && checkOut
                      ? "bg-[#001a52] hover:bg-[#0e2f76] text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed active:scale-100"
                  }`}
                >
                  Search
                </button>
              </div>
            )}
          </motion.div>
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
              className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-sans tracking-widest uppercase font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                activeSubTab === "rooms"
                  ? "bg-[#001a52] text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Exquisite Accommodations
            </button>
            <button
              onClick={() => setActiveSubTab("visual")}
              className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-sans tracking-widest uppercase font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
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

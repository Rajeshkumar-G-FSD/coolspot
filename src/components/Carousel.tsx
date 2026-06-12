/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Grid, Maximize, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Room } from "../types";

interface CarouselProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export default function Carousel({ rooms, onSelectRoom }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % rooms.length);
    }, 2800);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isHovered, rooms.length]);

  const N = rooms.length;
  const angleStep = 360 / N;
  const cardW = isMobile ? 210 : 300;
  const cardH = isMobile ? 150 : 210;
  const radius = isMobile ? 210 : 330;
  const containerH = isMobile ? 280 : 440;
  const currentRoom = rooms[activeIndex];

  const handleNext = () => setActiveIndex((p) => (p + 1) % N);
  const handlePrev = () => setActiveIndex((p) => (p - 1 + N) % N);

  return (
    <div className="py-16 bg-white dark:bg-[#00174a]/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-headline-lg text-3xl md:text-4xl text-[#001a52] dark:text-[#dbe1ff] mb-4"
        >
          Exquisite Accommodations
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="font-sans text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-14"
        >
          Immerse yourself in hand-crafted spaces designed to elevate your senses and provide ultimate peace of mind.
        </motion.p>

        {/* 3D Cylinder Stage */}
        <div
          className="relative mx-auto select-none"
          style={{
            height: containerH,
            perspective: "1200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Rotating ring — hub at (0,0), cards orbit around it */}
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${-activeIndex * angleStep}deg)`,
              transition: "transform 0.95s cubic-bezier(0.4, 0, 0.2, 1)",
              width: 1,
              height: 1,
              position: "relative",
            }}
          >
            {rooms.map((room, idx) => {
              const angle = idx * angleStep;
              let delta = (idx - activeIndex + N) % N;
              if (delta > N / 2) delta -= N;
              const absD = Math.abs(delta);
              const isActive = absD === 0;

              const opacity =
                absD === 0 ? 1 :
                absD === 1 ? 0.52 :
                absD === 2 ? 0.28 : 0.1;

              const boxShadow = isActive
                ? "0 0 0 3px rgba(251,191,36,0.95), 0 30px 70px rgba(0,26,82,0.55), 0 0 120px rgba(251,191,36,0.18)"
                : "0 8px 28px rgba(0,0,0,0.28)";

              return (
                <div
                  key={room.id}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    position: "absolute",
                    width: cardW,
                    height: cardH,
                    left: -cardW / 2,
                    top: -cardH / 2,
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: "hidden",
                    borderRadius: 16,
                    overflow: "hidden",
                    opacity,
                    transition: "opacity 0.5s ease, box-shadow 0.5s ease",
                    cursor: "pointer",
                    boxShadow,
                  }}
                >
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />

                  {/* Gradient overlay + label */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 88,
                      background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "0 14px 12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "3px",
                        color: isActive ? "#fbbf24" : "#93c5fd",
                        fontWeight: 800,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {isActive ? "◉ Now Viewing" : "Cool Cottages"}
                    </span>
                    <span
                      style={{
                        color: "white",
                        fontSize: isMobile ? 12 : 14,
                        fontWeight: 600,
                        lineHeight: 1.25,
                      }}
                    >
                      {room.name}
                    </span>
                  </div>

                  {/* Active amber ring pulse */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 16,
                        border: "2px solid rgba(251,191,36,0.7)",
                        pointerEvents: "none",
                        animation: "pulseRing 2s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={handlePrev}
            className="p-3 border border-[#001a52]/10 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm focus:outline-none"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-[#001a52] dark:text-[#dbe1ff]" />
          </button>

          <div className="flex gap-2">
            {rooms.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "w-8 bg-amber-400"
                    : "w-1.5 bg-slate-300 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-3 border border-[#001a52]/10 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm focus:outline-none"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-[#001a52] dark:text-[#dbe1ff]" />
          </button>
        </div>

        {/* Detail Panel — animates per selected room */}
        <div className="mt-12 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoom.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="glass-panel rounded-2xl p-6 md:p-8 text-left grid md:grid-cols-5 gap-8 shadow-lg bg-[#f8f9ff]/80"
            >
              {/* Left — specs */}
              <div className="md:col-span-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold bg-[#001a52]/10 text-[#001a52] dark:text-[#d2e4ff] rounded-full">
                      Exclusive Selection
                    </span>
                    {currentRoom.sizeSquareMeter > 0 && (
                      <span className="text-sm font-sans tracking-tight text-slate-500 flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" />
                        {currentRoom.sizeSquareMeter} sqm
                      </span>
                    )}
                  </div>
                  <h3 className="font-headline-lg text-2xl md:text-3xl text-[#001a52] mb-3">
                    {currentRoom.name}
                  </h3>
                  <p className="font-sans text-xs md:text-sm text-slate-600 leading-relaxed mb-6">
                    {currentRoom.description}
                  </p>
                </div>

                {currentRoom.ratePerNight > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200/50">
                    <main className="mb-4 sm:mb-0">
                      <span className="text-slate-400 font-sans text-xs uppercase tracking-wider block">
                        Starting luxury rate
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-headline-lg text-3xl font-bold text-[#001a52]">
                          ₹{currentRoom.ratePerNight.toLocaleString()}
                        </span>
                        <span className="font-sans text-xs text-slate-500 font-medium">/ Night</span>
                      </div>
                    </main>
                    <button
                      onClick={() => onSelectRoom(currentRoom)}
                      className="w-full sm:w-auto bg-[#001a52] hover:bg-[#0e2f76] text-white px-6 py-3 rounded-lg font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Reserve This Category</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right — amenities */}
              <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-slate-200 md:pl-8 pt-6 md:pt-0">
                <h5 className="font-sans text-xs uppercase tracking-widest text-[#4a607c] font-bold mb-4 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5" />
                  <span>Premium Specs</span>
                </h5>
                <ul className="space-y-2.5">
                  {currentRoom.amenities.map((amenity, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 font-sans text-[11px] md:text-xs text-slate-600 font-medium"
                    >
                      <span className="text-[#819ae7] flex-shrink-0 mt-0.5 font-bold">✔</span>
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Keyframe for amber ring pulse */}
      <style>{`
        @keyframes pulseRing {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.015); }
        }
      `}</style>
    </div>
  );
}

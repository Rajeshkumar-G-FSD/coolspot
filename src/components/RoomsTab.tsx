/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BedDouble, Users, ChevronRight, ChevronLeft, Layers, Check, Tag, Info, Eye, X, Tv, Wifi, Droplets, Car, Bath, UserCheck, BatteryCharging, Sunset, Footprints, ShieldAlert } from "lucide-react";
import { Room } from "../types";
import BlurText from "./BlurText";

interface RoomsTabProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

interface GalleryState {
  roomId: string;
  idx: number;
}

export default function RoomsTab({ rooms, onSelectRoom }: RoomsTabProps) {
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [expandedAmenities, setExpandedAmenities] = useState<Set<string>>(new Set());

  const toggleAmenities = (roomId: string) => {
    setExpandedAmenities((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const HIGHLIGHT_ICONS: Record<string, React.ElementType> = {
    "Flat LCD Screen": Tv,
    "Wi-Fi Access": Wifi,
    "24/7 Hot Water Access": Droplets,
    "Rooms Are Close to the Parking Area (No Steps/Stairs Involved)": Car,
    "Private Attached Bathroom": Bath,
    "Room Attendant": UserCheck,
    "UPS Battery Backup in Case of Power Cut": BatteryCharging,
    "Shared Veranda Space": Sunset,
    "Private Stairs Access to These Rooms": Footprints,
    "Steps/Stairs Involved": ShieldAlert,
  };

  const getImages = (room: Room) =>
    room.images && room.images.length > 0 ? room.images : [room.imageUrl];

  // Keyboard navigation + scroll lock when lightbox is open
  useEffect(() => {
    if (!gallery) return;
    const room = rooms.find((r) => r.id === gallery.roomId);
    if (!room) return;
    const imgs = getImages(room);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGallery(null);
      if (e.key === "ArrowLeft")
        setGallery((g) => g ? { ...g, idx: (g.idx - 1 + imgs.length) % imgs.length } : null);
      if (e.key === "ArrowRight")
        setGallery((g) => g ? { ...g, idx: (g.idx + 1) % imgs.length } : null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [gallery, rooms]);

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
            Accommodations
          </motion.span>
          <BlurText
            text="Our Rooms"
            tag="h1"
            className="font-headline-lg text-4xl md:text-5xl mb-4 justify-center"
            delay={80}
            direction="top"
            stepDuration={0.4}
          />
          <BlurText
            text="9 comfortable rooms across 4 categories — all with KING SIZE beds, 24/7 hot water, and serene Ooty surroundings. Max 3 adults per room."
            className="text-white/70 text-sm max-w-xl mx-auto leading-relaxed justify-center"
            delay={30}
            direction="bottom"
            stepDuration={0.28}
          />
        </div>
      </section>

      {/* Room Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-14 grid grid-cols-1 md:grid-cols-2 gap-8">
        {rooms.map((room, i) => {
          const imgs = getImages(room);
          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900/60 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-lg transition-all duration-300 group flex flex-col"
            >
              {/* Main Image with hover overlay */}
              <div
                className="relative h-52 overflow-hidden cursor-pointer"
                onClick={() => setGallery({ roomId: room.id, idx: 0 })}
              >
                <img
                  src={imgs[0]}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001a52]/60 to-transparent" />

                {/* Hover View Gallery button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/25 transition-all duration-300">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-white text-xs font-bold flex items-center gap-2 border border-white/30">
                    <Eye className="w-4 h-4" />
                    View Gallery
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <span className="text-white text-sm font-headline-md font-bold leading-snug drop-shadow-md">
                    {room.name}
                  </span>
                  <span className="bg-amber-400 text-[#001a52] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0 ml-2">
                    ₹{room.ratePerNight.toLocaleString()}/night
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                {imgs.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGallery({ roomId: room.id, idx })}
                    className="w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 border-transparent hover:border-[#001a52] transition-all cursor-pointer active:scale-95"
                    title={`Photo ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${room.name} photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setGallery({ roomId: room.id, idx: 0 })}
                  className="flex items-center gap-1.5 px-3 h-10 rounded-lg bg-[#001a52] hover:bg-[#0e2f76] text-white text-[11px] font-bold shrink-0 transition-all cursor-pointer active:scale-95 select-none"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
              </div>

              {/* Details */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
                  {room.description}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-[#001a52] dark:text-[#819ae7]" />
                    <span className="font-semibold">KING SIZE Bed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#001a52] dark:text-[#819ae7]" />
                    <span className="font-semibold">Max 3 Adults</span>
                  </div>
                  {room.roomNumbers && room.roomNumbers.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#001a52] dark:text-[#819ae7]" />
                      <span className="font-semibold">
                        Room{room.roomNumbers.length > 1 ? "s" : ""}: {room.roomNumbers.join(", ")}
                        {room.isBundle && <span className="ml-1 text-amber-600">(Bundle)</span>}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amenity chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(expandedAmenities.has(room.id) ? room.amenities : room.amenities.slice(0, 4)).map((a) => (
                    <span
                      key={a}
                      className="text-[10px] px-2.5 py-1 bg-[#e5eeff] dark:bg-white/5 text-[#001a52] dark:text-[#819ae7] rounded-full font-medium"
                    >
                      {a}
                    </span>
                  ))}
                  {room.amenities.length > 4 && (
                    <button
                      type="button"
                      onClick={() => toggleAmenities(room.id)}
                      className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 select-none font-medium"
                    >
                      {expandedAmenities.has(room.id) ? "Show less" : `+${room.amenities.length - 4} more`}
                    </button>
                  )}
                </div>

                {/* Points to be Highlighted */}
                {room.highlights && room.highlights.length > 0 && (
                  <div className="mb-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                      <Check className="w-3 h-3" />
                      Points to be Highlighted
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {room.highlights.map((point) => {
                        const Icon = HIGHLIGHT_ICONS[point] ?? Check;
                        return (
                          <div key={point} className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center shrink-0">
                              <Icon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">{point}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onSelectRoom(room)}
                  className="w-full btn-apple-primary py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-auto"
                >
                  <span>Book This Room</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info strip */}
      <div className="bg-[#001a52] py-8 mt-4">
        <div className="max-w-5xl mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { label: "Total Rooms", value: "9" },
            { label: "Bed Type", value: "KING SIZE" },
            { label: "Max Per Room", value: "3 Adults" },
            { label: "Extra Bed", value: "Available" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-2xl font-black text-amber-400 mb-1">{value}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tariff Section */}
      <div className="max-w-5xl mx-auto px-6 md:px-16 py-14 space-y-8">
        {/* Common Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#001a52] rounded-2xl p-6 text-white"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-4">
            Included in All Rooms
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "24/7 Hot Water",
              "Free Parking",
              "24/7 Security Camera",
              "Guest Attendant (8AM–10PM)",
              "KING SIZE Bed",
              "Private Bathroom",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/80">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-4">
            * Free WiFi available in Mountain View and Budget rooms. TV available in selected rooms.
          </p>
        </motion.div>

        {/* Additional Charges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-[#001a52] dark:text-[#dbe1ff] mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Tag className="w-4 h-4 text-amber-500" />
            Additional Charges
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-left py-2 text-slate-400 font-semibold uppercase tracking-wide">Item</th>
                <th className="text-right py-2 text-slate-400 font-semibold uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              <tr><td className="py-3">Extra Bed (per night)</td><td className="py-3 text-right font-bold">On request</td></tr>
              <tr><td className="py-3">Baby Cot (per night)</td><td className="py-3 text-right font-bold">₹400</td></tr>
              <tr><td className="py-3">Early Check-in (before 12 PM)</td><td className="py-3 text-right font-bold">Subject to availability</td></tr>
              <tr><td className="py-3">Late Check-out (after 11 AM)</td><td className="py-3 text-right font-bold">Subject to availability</td></tr>
            </tbody>
          </table>
        </motion.div>

        {/* Cancellation Policy */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 flex items-start gap-3"
        >
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Cancellation Policy:</strong> Full refund on cancellations made 25 or more days before check-in.
            Cancellations within 25 days may not be eligible for a refund. All prices are inclusive of applicable taxes.
          </div>
        </motion.div>
      </div>

      {/* ── Lightbox Modal ── */}
      <AnimatePresence>
        {gallery && (() => {
          const room = rooms.find((r) => r.id === gallery.roomId);
          if (!room) return null;
          const imgs = getImages(room);
          const prev = () => setGallery((g) => g ? { ...g, idx: (g.idx - 1 + imgs.length) % imgs.length } : null);
          const next = () => setGallery((g) => g ? { ...g, idx: (g.idx + 1) % imgs.length } : null);

          return (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center px-4"
              onClick={() => setGallery(null)}
            >
              {/* Header bar */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
                <div>
                  <span className="text-white font-bold text-sm block">{room.name}</span>
                  <span className="text-white/50 text-[11px]">Photo {gallery.idx + 1} of {imgs.length}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGallery(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main image + arrows */}
              <div
                className="relative flex items-center justify-center w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-0 md:left-4 z-10 p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition-all cursor-pointer active:scale-95 select-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={gallery.idx}
                    src={imgs[gallery.idx]}
                    alt={`${room.name} — photo ${gallery.idx + 1}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.22 }}
                    className="max-h-[68vh] max-w-[82vw] md:max-w-[75vw] object-contain rounded-xl shadow-2xl"
                    draggable={false}
                  />
                </AnimatePresence>

                <button
                  type="button"
                  onClick={next}
                  className="absolute right-0 md:right-4 z-10 p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition-all cursor-pointer active:scale-95 select-none"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dot indicators */}
              <div
                className="flex gap-2 mt-5"
                onClick={(e) => e.stopPropagation()}
              >
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGallery((g) => g ? { ...g, idx: i } : null)}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      i === gallery.idx
                        ? "w-6 h-2 bg-amber-400"
                        : "w-2 h-2 bg-white/35 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              {/* Bottom thumbnail strip */}
              <div
                className="flex gap-2 mt-4 pb-4"
                onClick={(e) => e.stopPropagation()}
              >
                {imgs.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGallery((g) => g ? { ...g, idx: i } : null)}
                    className={`w-16 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      i === gallery.idx
                        ? "border-amber-400 scale-105"
                        : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

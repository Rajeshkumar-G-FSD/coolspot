/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { BedDouble, Users, ChevronRight, Layers, Check, Tag, Info } from "lucide-react";
import { Room } from "../types";
import BlurText from "./BlurText";

interface RoomsTabProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export default function RoomsTab({ rooms, onSelectRoom }: RoomsTabProps) {
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
        {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900/60 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image */}
            <div className="relative h-60 overflow-hidden">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001a52]/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <span className="text-white text-sm font-headline-md font-bold leading-snug drop-shadow-md">
                  {room.name}
                </span>
                <span className="bg-amber-400 text-[#001a52] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0 ml-2">
                  ₹{room.ratePerNight.toLocaleString()}/night
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
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
                {room.amenities.slice(0, 4).map((a) => (
                  <span
                    key={a}
                    className="text-[10px] px-2.5 py-1 bg-[#e5eeff] dark:bg-white/5 text-[#001a52] dark:text-[#819ae7] rounded-full font-medium"
                  >
                    {a}
                  </span>
                ))}
                {room.amenities.length > 4 && (
                  <span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-full">
                    +{room.amenities.length - 4} more
                  </span>
                )}
              </div>

              <button
                onClick={() => onSelectRoom(room)}
                className="w-full bg-[#001a52] hover:bg-[#0e2f76] text-white py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book This Room</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
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
            <strong>Cancellation Policy:</strong> Full refund on cancellations made 20 or more days before check-in.
            Cancellations within 20 days may not be eligible for a refund. All prices are inclusive of applicable taxes.
          </div>
        </motion.div>
      </div>
    </div>
  );
}

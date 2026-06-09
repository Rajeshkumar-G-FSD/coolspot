/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BedDouble, Users, Check, Tag, Info, ArrowRight } from "lucide-react";
import { VILLAS_DATA } from "../data";
import { db } from "../firebase";
import { getDocs, collection } from "firebase/firestore";

interface TariffTabProps {
  onBook: () => void;
}

export default function TariffTab({ onBook }: TariffTabProps) {
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});

  useEffect(() => {
    getDocs(collection(db, "rooms")).then((snap) => {
      const rates: Record<string, number> = {};
      snap.forEach((d) => {
        if (d.data().ratePerNight) rates[d.id] = d.data().ratePerNight;
      });
      setLiveRates(rates);
    });
  }, []);

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
            Pricing
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline-lg text-4xl md:text-5xl mb-4"
          >
            Tariff & Rates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-sm max-w-xl mx-auto"
          >
            Transparent pricing for all room categories. Rates shown are per night, inclusive of all amenities.
          </motion.p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 md:px-16 py-14">
        {/* Room Rate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {VILLAS_DATA.map((room, i) => {
            const rate = liveRates[room.id] ?? room.ratePerNight;
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001a52]/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <span className="text-white text-sm font-bold">{room.name}</span>
                    <div className="text-right">
                      <div className="text-amber-400 text-xl font-black leading-tight">
                        ₹{rate.toLocaleString()}
                      </div>
                      <div className="text-white/60 text-[10px]">per night</div>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-[#001a52] dark:text-[#819ae7]" />
                      KING SIZE
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#001a52] dark:text-[#819ae7]" />
                      Max 3 Adults
                    </span>
                    {room.roomNumbers && (
                      <span className="text-slate-400 text-[10px]">
                        Room{room.roomNumbers.length > 1 ? "s" : ""}: {room.roomNumbers.join(", ")}
                        {room.isBundle && (
                          <span className="ml-1 text-amber-600 font-semibold">(bundle)</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {room.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Check className="w-3 h-3 text-green-500 shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Common Amenities Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#001a52] rounded-2xl p-6 mb-8 text-white"
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
          className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm mb-8"
        >
          <h3 className="font-headline-md text-sm font-bold text-[#001a52] dark:text-[#dbe1ff] mb-4 flex items-center gap-2 uppercase tracking-wide">
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
              <tr>
                <td className="py-3">Extra Bed (per night)</td>
                <td className="py-3 text-right font-bold">On request</td>
              </tr>
              <tr>
                <td className="py-3">Baby Cot (per night)</td>
                <td className="py-3 text-right font-bold">₹400</td>
              </tr>
              <tr>
                <td className="py-3">Early Check-in (before 12 PM)</td>
                <td className="py-3 text-right font-bold">Subject to availability</td>
              </tr>
              <tr>
                <td className="py-3">Late Check-out (after 11 AM)</td>
                <td className="py-3 text-right font-bold">Subject to availability</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* Cancellation note */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 mb-10 flex items-start gap-3"
        >
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Cancellation Policy:</strong> Full refund on cancellations made 20 or more days before check-in.
            Cancellations within 20 days may not be eligible for a refund. All prices are inclusive of applicable taxes.
          </div>
        </motion.div>

        <div className="text-center">
          <button
            onClick={onBook}
            className="bg-[#001a52] hover:bg-[#0e2f76] text-white px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer"
          >
            <span>Check Availability & Book</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-slate-400 mt-3">
            Rates are updated in real-time. Contact us for group or long-stay discounts.
          </p>
        </div>
      </div>
    </div>
  );
}

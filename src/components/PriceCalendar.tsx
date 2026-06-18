import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Tag } from "lucide-react";
import { db } from "../firebase";
import { getDocs, collection } from "firebase/firestore";
import { VILLAS_DATA } from "../data";
import { motion } from "motion/react";

interface RoomPricing {
  id: string;
  name: string;
  weekdayRate: number;
  weekendRate: number;
  roomNumbers?: string[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Fri=5, Sat=6, Sun=0 are weekend
function isWeekend(dayIndex: number) {
  return dayIndex === 0 || dayIndex === 5 || dayIndex === 6;
}

export default function PriceCalendar() {
  const [rooms, setRooms] = useState<RoomPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "rooms"));
        const list: RoomPricing[] = [];
        snap.forEach(d => {
          const data = d.data();
          const base = VILLAS_DATA.find(v => v.id === d.id);
          const weekdayRate = data.weekdayRate || data.ratePerNight || base?.ratePerNight || 0;
          const weekendRate = data.weekendRate || weekdayRate;
          list.push({
            id: d.id,
            name: data.name || base?.name || d.id,
            weekdayRate,
            weekendRate,
            roomNumbers: data.roomNumbers || [],
          });
        });
        // Ensure all VILLAS_DATA rooms appear even if not in Firebase
        VILLAS_DATA.filter(r => r.ratePerNight > 0).forEach(v => {
          if (!list.find(r => r.id === v.id)) {
            list.push({
              id: v.id, name: v.name,
              weekdayRate: v.ratePerNight, weekendRate: v.ratePerNight,
              roomNumbers: v.roomNumbers || [],
            });
          }
        });
        setRooms(list.filter(r => r.weekdayRate > 0));
        if (list.length > 0) setSelectedRoomId(list[0].id);
      } catch (err) {
        console.error("PriceCalendar: failed to load rooms", err);
        const fallback = VILLAS_DATA.filter(r => r.ratePerNight > 0).map(v => ({
          id: v.id, name: v.name,
          weekdayRate: v.ratePerNight, weekendRate: v.ratePerNight,
          roomNumbers: v.roomNumbers || [],
        }));
        setRooms(fallback);
        if (fallback.length > 0) setSelectedRoomId(fallback[0].id);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = today.toISOString().split("T")[0];

  const cells: Array<{ day: number | null; dateStr: string; dayIndex: number }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, dateStr: "", dayIndex: -1 });
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(viewYear, viewMonth, d);
    cells.push({
      day: d,
      dateStr: dt.toISOString().split("T")[0],
      dayIndex: dt.getDay(),
    });
  }

  const isPast = (dateStr: string) => dateStr < todayStr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#001a52] px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold">
            Pricing Calendar
          </span>
        </div>
        <p className="text-white/60 text-xs">
          Weekday & weekend rates per night — select a room to view
        </p>
      </div>

      <div className="p-5 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-[#001a52] rounded-full animate-spin mr-2" />
            <span className="text-sm text-slate-400">Loading prices…</span>
          </div>
        ) : (
          <>
            {/* Room selector */}
            <div className="flex flex-wrap gap-2">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className="btn-apple px-3 py-1.5 text-[11px] font-semibold transition-all duration-200"
                  style={
                    selectedRoomId === room.id
                      ? { background: "#001a52", color: "#fff", borderRadius: "9999px" }
                      : { background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "9999px" }
                  }
                >
                  {room.name.split(" ").slice(0, 3).join(" ")}
                  {room.roomNumbers && room.roomNumbers.length > 0 && (
                    <span className="ml-1 opacity-60">·{room.roomNumbers.join(",")}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Pricing summary badges */}
            {selectedRoom && (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    Mon–Thu: ₹{selectedRoom.weekdayRate.toLocaleString()}
                    <span className="font-normal text-blue-500 dark:text-blue-400">/night</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-500/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Fri–Sun: ₹{selectedRoom.weekendRate.toLocaleString()}
                    <span className="font-normal text-amber-500 dark:text-amber-400">/night</span>
                  </span>
                </div>
                {selectedRoom.weekendRate > selectedRoom.weekdayRate && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-500/20">
                    <Tag className="w-3 h-3 text-rose-500" />
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      +₹{(selectedRoom.weekendRate - selectedRoom.weekdayRate).toLocaleString()} weekend premium
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="btn-apple-outline p-2 text-slate-500 dark:text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-[#001a52] dark:text-white">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                onClick={nextMonth}
                className="btn-apple-outline p-2 text-slate-500 dark:text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5">
              {/* Day headers */}
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  className="py-2 text-center text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: i === 0 || i === 5 || i === 6
                      ? "rgba(251,191,36,0.08)"
                      : "rgba(59,130,246,0.05)",
                    color: i === 0 || i === 5 || i === 6 ? "#d97706" : "#3b82f6",
                  }}
                >
                  {d}
                </div>
              ))}

              {/* Date cells */}
              {cells.map((cell, idx) => {
                if (!cell.day) {
                  return (
                    <div key={`empty-${idx}`} className="bg-white dark:bg-[#0f1c2e] h-16" />
                  );
                }
                const past = isPast(cell.dateStr);
                const weekend = isWeekend(cell.dayIndex);
                const price = selectedRoom
                  ? (weekend ? selectedRoom.weekendRate : selectedRoom.weekdayRate)
                  : 0;
                const isToday = cell.dateStr === todayStr;

                return (
                  <div
                    key={cell.dateStr}
                    className="relative flex flex-col items-center justify-center h-16 transition-colors"
                    style={{
                      background: past
                        ? "rgba(0,0,0,0.02)"
                        : weekend
                        ? "rgba(251,191,36,0.06)"
                        : "rgba(59,130,246,0.04)",
                    }}
                  >
                    {/* Today ring */}
                    {isToday && (
                      <div className="absolute inset-[3px] rounded-lg border-2 border-[#001a52] dark:border-amber-400 pointer-events-none" />
                    )}
                    <span
                      className="text-[11px] font-bold leading-none mb-1"
                      style={{
                        color: past ? "#cbd5e1" : isToday ? "#001a52" : "#334155",
                      }}
                    >
                      {cell.day}
                    </span>
                    {price > 0 && (
                      <span
                        className="text-[9px] font-bold leading-none px-1 rounded"
                        style={{
                          color: past
                            ? "#cbd5e1"
                            : weekend
                            ? "#d97706"
                            : "#3b82f6",
                        }}
                      >
                        ₹{(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600/30 inline-block" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Mon–Thu (Weekday)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-600/30 inline-block" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Fri–Sun (Weekend)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-white dark:bg-slate-800 border-2 border-[#001a52] dark:border-amber-400 inline-block" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Today</span>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

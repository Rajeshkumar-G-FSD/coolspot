import React, { useState, useEffect } from "react";
import {
  Lock, User, RefreshCcw, Trash2, Edit2, Plus, Check, Calendar,
  Mail, Phone, DollarSign, TrendingUp, Clock, X, LayoutDashboard,
  BedDouble, CalendarCheck, Users, UtensilsCrossed, Flame,
  CreditCard, Globe, Image, MapPin, UserCheck, Star, BarChart3,
  Settings, LogOut, Bell, Search, ChevronRight, ChevronLeft, Download, Filter,
  Menu, TrendingDown, AlertCircle, CheckCircle, Eye, MoreVertical,
  Wifi, MessageSquare, Printer, Building2, Leaf, Mountain,
  Coffee, Sunset, Wind, Award, ShieldCheck, Zap, PieChart,
  ChevronUp, ChevronDown, Pencil, Send, Upload, Trash, EyeOff
} from "lucide-react";
import coolspotLogo from "../public/images/coolspot_roundlogo-removebg-preview.png";
import { db, handleFirestoreError, OperationType } from "../firebase";
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, onSnapshot, addDoc
} from "firebase/firestore";
import { VILLAS_DATA } from "../data";
import { motion, AnimatePresence } from "motion/react";
import DatePicker from "react-datepicker";

// ─── THEME TOKENS ──────────────────────────────────────────────────────────────
const C = {
  bg: "#060e08",
  sidebar: "#0a1810",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.07)",
  gold: "#d4a843",
  goldLight: "#f0c860",
  green: "#1e5c35",
  greenLight: "#2a7a4b",
  text: "#ede9e1",
  muted: "rgba(237,233,225,0.5)",
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const REVENUE_DATA = [18,24,31,28,42,38,55,62,58,70,48,65];
const OCCUPANCY_DATA = [55,62,74,68,82,78,91,95,88,92,75,87];

const MOCK_STAFF = [
  { id:1, name:"Arjun Menon", role:"Front Desk Manager", dept:"Operations", status:"active", avatar:"AM", phone:"+91 98400 11234", joined:"2022-03-15" },
  { id:2, name:"Priya Suresh", role:"Head Chef", dept:"Food & Dining", status:"active", avatar:"PS", phone:"+91 98400 22345", joined:"2021-08-10" },
  { id:3, name:"Karthik Rajan", role:"Housekeeping Lead", dept:"Housekeeping", status:"active", avatar:"KR", phone:"+91 98400 33456", joined:"2023-01-20" },
  { id:4, name:"Deepa Nair", role:"Guest Relations", dept:"Operations", status:"active", avatar:"DN", phone:"+91 98400 44567", joined:"2022-07-05" },
  { id:5, name:"Venkat Srinivas", role:"Security Head", dept:"Security", status:"on-leave", avatar:"VS", phone:"+91 98400 55678", joined:"2020-11-12" },
  { id:6, name:"Meena Pillai", role:"Spa Therapist", dept:"Wellness", status:"active", avatar:"MP", phone:"+91 98400 66789", joined:"2023-05-18" },
  { id:7, name:"Ravi Kumar", role:"Maintenance", dept:"Facility", status:"active", avatar:"RK", phone:"+91 98400 77890", joined:"2021-03-22" },
  { id:8, name:"Anitha George", role:"Events Coordinator", dept:"Operations", status:"active", avatar:"AG", phone:"+91 98400 88901", joined:"2022-09-30" },
];

const MOCK_FOOD_MENU = [
  { id:1, name:"Ooty Honey Pancakes", cat:"Breakfast", price:350, available:true, orders:24 },
  { id:2, name:"Nilgiri Mountain Tea", cat:"Beverages", price:120, available:true, orders:87 },
  { id:3, name:"Cottage Garden Salad", cat:"Starters", price:280, available:true, orders:31 },
  { id:4, name:"Campfire Grilled Chicken", cat:"Mains", price:680, available:true, orders:19 },
  { id:5, name:"Homestyle Dhal Tadka", cat:"Mains", price:320, available:true, orders:42 },
  { id:6, name:"Spiced Lamb Biryani", cat:"Mains", price:780, available:false, orders:15 },
  { id:7, name:"Forest Berry Dessert", cat:"Desserts", price:250, available:true, orders:28 },
  { id:8, name:"Kerala Fish Curry", cat:"Mains", price:650, available:true, orders:33 },
];

const MOCK_CAMPFIRE = [
  { id:1, date:"2026-06-08", time:"7:00 PM", guests:6, theme:"Stargazing Night", status:"confirmed", guide:"Ravi Kumar" },
  { id:2, date:"2026-06-09", time:"7:30 PM", guests:10, theme:"Cultural Folk Night", status:"confirmed", guide:"Anitha George" },
  { id:3, date:"2026-06-10", time:"7:00 PM", guests:4, theme:"Romantic Couple Evening", status:"pending", guide:"Deepa Nair" },
  { id:4, date:"2026-06-11", time:"8:00 PM", guests:8, theme:"BBQ & Music Night", status:"confirmed", guide:"Ravi Kumar" },
  { id:5, date:"2026-06-12", time:"7:00 PM", guests:12, theme:"Team Bonding Experience", status:"pending", guide:"Anitha George" },
];

const MOCK_REVIEWS = [
  { id:1, name:"Rahul Sharma", rating:5, date:"2026-05-28", room:"Forest View Cottage", comment:"Absolutely breathtaking experience. The misty mornings, warm staff and cozy rooms made our anniversary unforgettable.", replied:true },
  { id:2, name:"Divya Krishnan", rating:5, date:"2026-05-20", room:"Premium Hill Cottage", comment:"Best resort experience in Ooty. The campfire evening was magical and the food was exceptional.", replied:false },
  { id:3, name:"Amit Patel", rating:4, date:"2026-05-15", room:"Valley View Suite", comment:"Great property, beautiful views. Service was top-notch. Would recommend the tea plantation tour.", replied:true },
  { id:4, name:"Sunita Verma", rating:5, date:"2026-05-10", room:"Luxury Forest Villa", comment:"Worth every penny. The glassmorphism interior design, natural surroundings and the AI concierge were impressive.", replied:false },
  { id:5, name:"Prakash Nair", rating:4, date:"2026-05-05", room:"Forest View Cottage", comment:"Peaceful retreat with wonderful nature walks. Staff very helpful. Will return next season.", replied:true },
  { id:6, name:"Lakshmi Iyer", rating:5, date:"2026-04-28", room:"Premium Hill Cottage", comment:"The Nilgiri hills backdrop, impeccable cleanliness and delicious Ooty cuisine made this trip perfect.", replied:false },
];

const MOCK_PLACES = [
  { id:1, name:"Ooty Lake", dist:"3 km", type:"Nature", desc:"Scenic boating lake surrounded by eucalyptus trees.", open:"6 AM – 6 PM" },
  { id:2, name:"Botanical Gardens", dist:"4 km", type:"Nature", desc:"120-year-old garden with 650+ plant species.", open:"7 AM – 7 PM" },
  { id:3, name:"Doddabetta Peak", dist:"9 km", type:"Adventure", desc:"Highest peak in Nilgiri hills at 2,637 m.", open:"7 AM – 6 PM" },
  { id:4, name:"Ooty Tea Museum", dist:"6 km", type:"Cultural", desc:"Learn about Nilgiri tea manufacturing heritage.", open:"9 AM – 5 PM" },
  { id:5, name:"Rose Garden", dist:"2 km", type:"Nature", desc:"Asia's largest rose garden with 20,000 varieties.", open:"8 AM – 6 PM" },
  { id:6, name:"Emerald Lake", dist:"22 km", type:"Nature", desc:"Tranquil lake nestled in dense Shola forest.", open:"All day" },
  { id:7, name:"Avalanche Lake", dist:"28 km", type:"Adventure", desc:"Remote wilderness lake ideal for trout fishing.", open:"6 AM – 5 PM" },
  { id:8, name:"Pykara Waterfalls", dist:"20 km", type:"Adventure", desc:"Cascading falls through misty forest terrain.", open:"8 AM – 5 PM" },
];

const MOCK_GALLERY = [
  { id:1, title:"Misty Morning Cottage", cat:"Rooms", url:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop" },
  { id:2, title:"Forest View Suite", cat:"Rooms", url:"https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop" },
  { id:3, title:"Campfire Evening", cat:"Experiences", url:"https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400&h=300&fit=crop" },
  { id:4, title:"Tea Garden Walk", cat:"Experiences", url:"https://images.unsplash.com/photo-1558642891-54be180ea339?w=400&h=300&fit=crop" },
  { id:5, title:"Resort Pool Area", cat:"Amenities", url:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop" },
  { id:6, title:"Nilgiri Sunrise", cat:"Nature", url:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" },
  { id:7, title:"Dining Hall", cat:"Dining", url:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop" },
  { id:8, title:"Spa Wellness", cat:"Amenities", url:"https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop" },
  { id:9, title:"Mountain Trek", cat:"Experiences", url:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop" },
];

const CMS_DEFAULTS = {
  heroTitle: "Escape Into Luxury, Where Nature Meets Comfort",
  heroSubtitle: "A sanctuary of unparalleled elegance in the Nilgiri Hills of Ooty.",
  aboutText: "Cool Cottages is a premium luxury resort nestled in the misty Nilgiri hills of Ooty. Since 2018, we have offered world-class hospitality fused with the natural beauty of South India's most celebrated hill station.",
  contactEmail: "desk@coolcottages.io",
  contactPhone: "+91 422 255 1000",
  address: "Blue Mountain Road, Ooty – 643001, Tamil Nadu",
  checkInTime: "14:00",
  checkOutTime: "12:00",
};

// ─── SMALL CHART COMPONENTS ───────────────────────────────────────────────────

function MiniBarChart({ data, color = C.gold }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: i === data.length - 1 ? 1 : 0.5 }}
        />
      ))}
    </div>
  );
}

function DonutChart({ pct, color, size = 60 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
      />
    </svg>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 80, h = 30;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={C.gold} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, trend, chart }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border relative overflow-hidden"
      style={{ background: C.card, borderColor: C.border }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 20%, ${color}12 0%, transparent 60%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {chart && <Sparkline data={chart} />}
      </div>
      <div className="text-2xl font-bold" style={{ color: C.text }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: C.muted }}>{label}</div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </motion.div>
  );
}

// ─── MODULE: OVERVIEW ─────────────────────────────────────────────────────────
function ModuleOverview({ bookings, onNavigate, onCreateBooking }: {
  bookings: any[];
  onNavigate: (module: string) => void;
  onCreateBooking: () => void;
}) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  const today = now.toISOString().split("T")[0];

  const totalRevenue = bookings.filter(b => b.status !== "Cancelled").reduce((s, b) => s + (b.totalCost || 0), 0);
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;
  const pending = bookings.filter(b => b.status === "Pending").length;
  const pendingAmount = bookings.filter(b => b.status === "Pending").reduce((s, b) => s + (b.totalCost || 0), 0);
  const completed = bookings.filter(b => b.status === "Completed").length;
  const cancelled = bookings.filter(b => b.status === "Cancelled").length;
  const todayArrivals = bookings.filter(b => b.checkIn === today && b.status !== "Cancelled").length;

  const total = confirmed + pending + completed + cancelled || 1;

  // Monthly revenue from actual bookings (current year)
  const monthlyRevenue = Array(12).fill(0);
  const lastYearRevenue = { total: 0 };
  bookings.forEach(b => {
    if (!b.checkIn || b.status === "Cancelled") return;
    const d = new Date(b.checkIn + "T00:00:00");
    if (d.getFullYear() === thisYear) monthlyRevenue[d.getMonth()] += (b.totalCost || 0);
    else if (d.getFullYear() === thisYear - 1) lastYearRevenue.total += (b.totalCost || 0);
  });
  const maxRev = Math.max(...monthlyRevenue, 1);
  const yoyPct = lastYearRevenue.total > 0
    ? Math.round(((totalRevenue - lastYearRevenue.total) / lastYearRevenue.total) * 100)
    : totalRevenue > 0 ? 100 : 0;

  // Month-on-month trend for stat card sparklines
  const revSparkline = monthlyRevenue.slice(Math.max(0, thisMonth - 7), thisMonth + 1);
  const bookingsByMonth = Array(12).fill(0);
  bookings.forEach(b => {
    if (!b.checkIn || b.status === "Cancelled") return;
    const d = new Date(b.checkIn + "T00:00:00");
    if (d.getFullYear() === thisYear) bookingsByMonth[d.getMonth()]++;
  });
  const bookSparkline = bookingsByMonth.slice(Math.max(0, thisMonth - 7), thisMonth + 1);

  // Current month vs previous month for trend badge
  const curMonthBookings = bookingsByMonth[thisMonth];
  const prevMonthBookings = thisMonth > 0 ? bookingsByMonth[thisMonth - 1] : 0;
  const bookingTrend = prevMonthBookings > 0
    ? Math.round(((curMonthBookings - prevMonthBookings) / prevMonthBookings) * 100)
    : curMonthBookings > 0 ? 100 : 0;

  // Room occupancy computed from actual bookings this month
  const roomOccupancy = VILLAS_DATA.filter(r => r.ratePerNight > 0).map(room => {
    const roomNums = (room.roomNumbers || []).map(String);
    const roomBookings = bookings.filter(b => {
      if (b.status === "Cancelled") return false;
      if (b.room?.id === room.id) return true;
      const assigned = (b.assignedRooms || []).map(String);
      return assigned.some((n: string) => roomNums.includes(n));
    });
    let bookedDays = 0;
    roomBookings.forEach(b => {
      if (!b.checkIn || !b.checkOut) return;
      const cin = new Date(b.checkIn + "T00:00:00");
      const cout = new Date(b.checkOut + "T00:00:00");
      const mStart = new Date(thisYear, thisMonth, 1);
      const mEnd = new Date(thisYear, thisMonth + 1, 0);
      const start = cin > mStart ? cin : mStart;
      const end = cout < mEnd ? cout : mEnd;
      if (end > start) bookedDays += Math.round((end.getTime() - start.getTime()) / 86400000);
    });
    const pct = Math.min(100, Math.round((bookedDays / daysInMonth) * 100));
    return { room, pct };
  });

  const recentBookings = [...bookings]
    .sort((a, b) => (b.createdTime || "").localeCompare(a.createdTime || ""))
    .slice(0, 5);

  const quickActions = [
    { label: "Create Booking", icon: Plus, color: C.gold, action: onCreateBooking },
    { label: "Send WhatsApp", icon: MessageSquare, color: "#25D366", action: () => window.open("https://api.whatsapp.com/send?phone=917010395526", "_blank") },
    { label: "Generate Report", icon: Download, color: "#60a5fa", action: () => onNavigate("analytics") },
    { label: "Add Room", icon: BedDouble, color: "#a78bfa", action: () => onNavigate("rooms") },
    { label: "View Analytics", icon: BarChart3, color: "#f472b6", action: () => onNavigate("analytics") },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Revenue" value={`₹${(totalRevenue/1000).toFixed(1)}K`} icon={DollarSign} color={C.gold} trend={yoyPct} chart={revSparkline.length > 1 ? revSparkline : undefined} />
        <StatCard label="Total Bookings" value={bookings.length} icon={CalendarCheck} color="#4ade80" trend={bookingTrend} chart={bookSparkline.length > 1 ? bookSparkline : undefined} />
        <StatCard label="Today's Arrivals" value={todayArrivals} icon={Users} color="#60a5fa" />
        <StatCard label="Pending Approvals" value={pending} icon={Clock} color="#f59e0b" />
        <StatCard label="Pending Amount" value={pendingAmount > 0 ? `₹${(pendingAmount/1000).toFixed(1)}K` : "₹0"} icon={CreditCard} color="#f87171" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart — built from real booking data */}
        <div className="lg:col-span-2 rounded-2xl p-6 border" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold" style={{ color: C.gold }}>Monthly Revenue</div>
              <div className="text-2xl font-bold mt-1" style={{ color: C.text }}>₹{(totalRevenue/1000).toFixed(1)}K This Year</div>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ background: `${yoyPct >= 0 ? C.gold : "#f87171"}20`, color: yoyPct >= 0 ? C.gold : "#f87171" }}>
              {yoyPct >= 0 ? "+" : ""}{yoyPct}% YoY
            </div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {monthlyRevenue.map((v, i) => {
              const isNow = i === thisMonth;
              const heightPct = maxRev > 0 ? (v / maxRev) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(heightPct, 2)}%`,
                      background: isNow
                        ? `linear-gradient(to top, ${C.gold}, ${C.goldLight})`
                        : "rgba(212,168,67,0.25)",
                    }}
                  />
                  <span className="text-[8px] font-bold" style={{ color: isNow ? C.gold : C.muted }}>{MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Status */}
        <div className="rounded-2xl p-6 border" style={{ background: C.card, borderColor: C.border }}>
          <div className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: C.gold }}>Booking Status</div>
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <DonutChart pct={Math.round((confirmed / Math.max(1, total)) * 100)} color="#4ade80" size={100} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black" style={{ color: C.text }}>{bookings.length}</span>
                <span className="text-[9px] uppercase tracking-wider" style={{ color: C.muted }}>Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Confirmed", count: confirmed, color: "#4ade80" },
              { label: "Pending", count: pending, color: "#f59e0b" },
              { label: "Completed", count: completed, color: C.gold },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(s.count / total) * 100}%`, background: s.color }} />
                </div>
                <span className="text-xs font-bold w-5 text-right" style={{ color: C.text }}>{s.count}</span>
                <span className="text-xs w-20" style={{ color: C.muted }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
            <div className="text-xs uppercase tracking-widest font-bold" style={{ color: C.gold }}>Recent Bookings</div>
            <button onClick={() => onNavigate("bookings")} className="text-xs hover:underline" style={{ color: C.muted }}>{bookings.length} total →</button>
          </div>
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: C.muted }}>No bookings yet</div>
          ) : (
            <div className="divide-y" style={{ borderColor: C.border }}>
              {recentBookings.map(bk => (
                <div key={bk.id} className="flex items-center px-5 py-3 gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: `${C.gold}20`, color: C.gold }}>
                    {(bk.billingName || "G").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: C.text }}>{bk.billingName || "Guest"}</div>
                    <div className="text-[10px] truncate" style={{ color: C.muted }}>{bk.room?.name} · {bk.checkIn}</div>
                  </div>
                  <div className="text-xs font-bold font-mono" style={{ color: C.gold }}>₹{(bk.totalCost||0).toLocaleString()}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    bk.status === "Confirmed" ? "bg-emerald-500/15 text-emerald-400"
                    : bk.status === "Pending" ? "bg-amber-500/15 text-amber-400"
                    : bk.status === "Cancelled" ? "bg-red-500/15 text-red-400"
                    : "bg-blue-500/15 text-blue-400"
                  }`}>{bk.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions — all wired to real navigation */}
        <div className="rounded-2xl p-5 border space-y-3" style={{ background: C.card, borderColor: C.border }}>
          <div className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: C.gold }}>Quick Actions</div>
          {quickActions.map(a => (
            <button
              key={a.label}
              onClick={a.action}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/[0.07] active:scale-95 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                style={{ background: `${a.color}18` }}>
                <a.icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: C.text }}>{a.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto" style={{ color: C.muted }} />
            </button>
          ))}
        </div>
      </div>

      {/* Room Occupancy — computed from real bookings this month */}
      <div className="rounded-2xl p-6 border" style={{ background: C.card, borderColor: C.border }}>
        <div className="text-xs uppercase tracking-widest font-bold mb-5" style={{ color: C.gold }}>
          Room Occupancy — {MONTHS[thisMonth]} {thisYear}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roomOccupancy.map(({ room, pct }) => (
            <div key={room.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold truncate" style={{ color: C.text }}>{room.name.split(" ").slice(0, 2).join(" ")}</span>
                <span className="text-xs font-bold" style={{ color: pct > 60 ? "#4ade80" : pct > 30 ? C.gold : C.muted }}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 60 ? "#4ade80" : C.gold }} />
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>₹{room.ratePerNight.toLocaleString()}/night</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: ROOMS ────────────────────────────────────────────────────────────
function ModuleRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");
  const [editWeekdayRate, setEditWeekdayRate] = useState("");
  const [editWeekendRate, setEditWeekendRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [extraBedRate, setExtraBedRate] = useState<number>(1500);
  const [editingExtraBed, setEditingExtraBed] = useState(false);
  const [editExtraBedRate, setEditExtraBedRate] = useState("");
  const [savingExtraBed, setSavingExtraBed] = useState(false);

  // Date blocking state
  const [blocks, setBlocks] = useState<any[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blockRoomIds, setBlockRoomIds] = useState<string[]>([]);
  const [blockDates, setBlockDates] = useState<Date[]>([]);
  const [blockReason, setBlockReason] = useState("");
  const [savingBlock, setSavingBlock] = useState(false);

  // Price calendar state
  const [priceCalRoomId, setPriceCalRoomId] = useState<string>("");
  const [priceCalYear, setPriceCalYear] = useState(() => new Date().getFullYear());
  const [priceCalMonth, setPriceCalMonth] = useState(() => new Date().getMonth());

  // Blocked dates calendar view
  const [showBlockedCal, setShowBlockedCal] = useState(false);
  const [blockedCalYear, setBlockedCalYear] = useState(() => new Date().getFullYear());
  const [blockedCalMonth, setBlockedCalMonth] = useState(() => new Date().getMonth());
  const [selectedBlockCell, setSelectedBlockCell] = useState<{ roomId: string; roomName: string; date: string } | null>(null);
  const [removingBlock, setRemovingBlock] = useState(false);

  // Per-date price overrides
  const [priceOverrides, setPriceOverrides] = useState<Record<string, Record<string, number>>>({});
  const [priceOverridesLoading, setPriceOverridesLoading] = useState(false);
  const [editingPriceDate, setEditingPriceDate] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [savingPriceOverride, setSavingPriceOverride] = useState(false);

  const toggleBlockRoom = (id: string) =>
    setBlockRoomIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "rooms"));
      if (snap.empty) {
        // Seed Firebase with defaults from VILLAS_DATA on first run
        await Promise.all(
          VILLAS_DATA.filter(r => r.ratePerNight > 0).map(r =>
            setDoc(doc(db, "rooms", r.id), {
              id: r.id,
              name: r.name,
              ratePerNight: r.ratePerNight,
              maxGuests: r.maxGuests,
              roomNumbers: r.roomNumbers || [],
              isBundle: r.isBundle || false,
            })
          )
        );
        setRooms(VILLAS_DATA.filter(r => r.ratePerNight > 0).map(r => ({ ...r })));
      } else {
        const list: any[] = [];
        snap.forEach(d => {
          const base = VILLAS_DATA.find(v => v.id === d.id) || {};
          list.push({ ...base, ...d.data() });
        });
        // Ensure all bookable categories appear even if missing from Firebase
        VILLAS_DATA.filter(r => r.ratePerNight > 0).forEach(v => {
          if (!list.find(r => r.id === v.id)) list.push({ ...v });
        });
        setRooms(list.filter(r => r.ratePerNight > 0));
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
      setRooms(VILLAS_DATA.filter(r => r.ratePerNight > 0).map(r => ({ ...r })));
    } finally {
      setLoading(false);
    }
    // Load extra bed rate from Firebase settings
    try {
      const { getDoc } = await import("firebase/firestore");
      const pricingSnap = await getDoc(doc(db, "settings", "pricing"));
      if (pricingSnap.exists()) {
        const data = pricingSnap.data();
        if (data.extraBedRate) setExtraBedRate(data.extraBedRate);
      }
    } catch (err) {
      console.error("Failed to load extra bed rate:", err);
    }
  };

  useEffect(() => { loadRooms(); }, []);

  const loadBlocks = async () => {
    setBlocksLoading(true);
    try {
      const snap = await getDocs(collection(db, "roomBlocks"));
      const list: any[] = [];
      snap.forEach(d => list.push({ docId: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setBlocks(list);
    } catch (err) {
      console.error("Failed to load room blocks:", err);
    } finally {
      setBlocksLoading(false);
    }
  };

  const blockRooms = rooms.flatMap((r: any) => {
    if (r.id === "budget-basement") {
      return (r.roomNumbers || []).map((num: string) => ({
        ...r,
        id: `budget-basement-${num}`,
        name: `Budget Double Room — Room ${num}`,
        roomNumbers: [num],
      }));
    }
    if (r.id === "deluxe-family") {
      return (r.roomNumbers || []).map((num: string) => ({
        ...r,
        id: `deluxe-family-${num}`,
        name: `Deluxe Family Room — Room ${num}`,
        roomNumbers: [num],
      }));
    }
    return [r];
  });

  const saveBlock = async () => {
    if (blockRoomIds.length === 0 || blockDates.length === 0) {
      alert("Select at least one room and at least one date."); return;
    }
    setSavingBlock(true);
    try {
      const newBlocks: any[] = [];
      for (const roomId of blockRoomIds) {
        const room = blockRooms.find((r: any) => r.id === roomId);
        for (const date of blockDates) {
          const dateStr = date.toISOString().split("T")[0];
          const payload = {
            roomId,
            roomName: room?.name || roomId,
            roomNumbers: room?.roomNumbers || [],
            startDate: dateStr,
            endDate: dateStr,
            reason: blockReason.trim() || "Admin block",
            createdAt: new Date().toISOString(),
          };
          const ref = await addDoc(collection(db, "roomBlocks"), payload);
          newBlocks.push({ docId: ref.id, ...payload });
        }
      }
      setBlocks(prev => [...newBlocks, ...prev]);
      setShowAddBlock(false);
      setBlockRoomIds([]); setBlockDates([]); setBlockReason("");
    } catch (err) {
      alert("Failed to save block. Please try again.");
      console.error(err);
    } finally {
      setSavingBlock(false);
    }
  };

  const removeBlock = async (docId: string) => {
    try {
      await deleteDoc(doc(db, "roomBlocks", docId));
      setBlocks(prev => prev.filter(b => b.docId !== docId));
    } catch (err) {
      alert("Failed to remove block."); console.error(err);
    }
  };

  useEffect(() => { loadBlocks(); }, []);
  useEffect(() => { loadPriceOverrides(); }, []);

  const startEdit = (room: any) => {
    setEditingId(room.id);
    setEditRate(String(room.ratePerNight));
    setEditWeekdayRate(String(room.weekdayRate || room.ratePerNight || ""));
    setEditWeekendRate(String(room.weekendRate || room.ratePerNight || ""));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRate("");
    setEditWeekdayRate("");
    setEditWeekendRate("");
  };

  // Price calendar nav
  const prevPriceCalMonth = () => {
    if (priceCalMonth === 0) { setPriceCalYear(y => y - 1); setPriceCalMonth(11); }
    else setPriceCalMonth(m => m - 1);
  };
  const nextPriceCalMonth = () => {
    if (priceCalMonth === 11) { setPriceCalYear(y => y + 1); setPriceCalMonth(0); }
    else setPriceCalMonth(m => m + 1);
  };

  // Blocked calendar nav
  const prevBlockedCalMonth = () => {
    if (blockedCalMonth === 0) { setBlockedCalYear(y => y - 1); setBlockedCalMonth(11); }
    else setBlockedCalMonth(m => m - 1);
  };
  const nextBlockedCalMonth = () => {
    if (blockedCalMonth === 11) { setBlockedCalYear(y => y + 1); setBlockedCalMonth(0); }
    else setBlockedCalMonth(m => m + 1);
  };

  // ── Per-date price overrides ──────────────────────────────────────────────
  const loadPriceOverrides = async () => {
    setPriceOverridesLoading(true);
    try {
      const snap = await getDocs(collection(db, "priceOverrides"));
      const map: Record<string, Record<string, number>> = {};
      snap.forEach(d => {
        const data = d.data();
        if (data.roomId && data.date && data.price) {
          if (!map[data.roomId]) map[data.roomId] = {};
          map[data.roomId][data.date] = data.price;
        }
      });
      setPriceOverrides(map);
    } catch (err) {
      console.error("Failed to load price overrides:", err);
    } finally {
      setPriceOverridesLoading(false);
    }
  };

  const savePriceOverride = async (roomId: string, date: string, price: number) => {
    setSavingPriceOverride(true);
    try {
      const docId = `${roomId}_${date}`;
      await setDoc(doc(db, "priceOverrides", docId), {
        roomId, date, price, updatedAt: new Date().toISOString(),
      });
      setPriceOverrides(prev => ({
        ...prev,
        [roomId]: { ...(prev[roomId] || {}), [date]: price },
      }));
      setEditingPriceDate(null);
      setEditingPriceValue("");
    } catch (err) {
      alert("Failed to save price. Please try again.");
      console.error(err);
    } finally {
      setSavingPriceOverride(false);
    }
  };

  const removePriceOverride = async (roomId: string, date: string) => {
    setSavingPriceOverride(true);
    try {
      await deleteDoc(doc(db, "priceOverrides", `${roomId}_${date}`));
      setPriceOverrides(prev => {
        const updated = { ...prev };
        if (updated[roomId]) {
          const copy = { ...updated[roomId] };
          delete copy[date];
          updated[roomId] = copy;
        }
        return updated;
      });
      setEditingPriceDate(null);
      setEditingPriceValue("");
    } catch (err) {
      alert("Failed to remove price override."); console.error(err);
    } finally {
      setSavingPriceOverride(false);
    }
  };

  const saveExtraBedRate = async () => {
    const newRate = parseInt(editExtraBedRate);
    if (!newRate || newRate < 100) { alert("Enter a valid rate (min ₹100)"); return; }
    setSavingExtraBed(true);
    try {
      await setDoc(doc(db, "settings", "pricing"), { extraBedRate: newRate }, { merge: true });
      setExtraBedRate(newRate);
      setEditingExtraBed(false);
    } catch (err) {
      alert("Failed to save extra bed rate. Please try again.");
      console.error(err);
    } finally {
      setSavingExtraBed(false);
    }
  };

  const saveRate = async (roomId: string) => {
    const weekday = parseInt(editWeekdayRate);
    const weekend = parseInt(editWeekendRate);
    if (!weekday || weekday < 100) { alert("Enter a valid weekday rate (min ₹100)"); return; }
    if (!weekend || weekend < 100) { alert("Enter a valid weekend rate (min ₹100)"); return; }
    setSaving(true);
    const room = rooms.find(r => r.id === roomId);
    try {
      await setDoc(doc(db, "rooms", roomId), {
        id: roomId,
        name: room?.name || roomId,
        ratePerNight: weekday,
        weekdayRate: weekday,
        weekendRate: weekend,
        maxGuests: room?.maxGuests || 2,
        roomNumbers: room?.roomNumbers || [],
        isBundle: room?.isBundle || false,
      }, { merge: true });
      setRooms(prev => prev.map(r =>
        r.id === roomId
          ? { ...r, ratePerNight: weekday, weekdayRate: weekday, weekendRate: weekend }
          : r
      ));
      setEditingId(null);
    } catch (err) {
      alert("Failed to save rate. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Room Rate Management</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>Set per-night rates · Changes apply immediately to new bookings</p>
        </div>
        <button onClick={loadRooms} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border active:scale-95 transition-all"
          style={{ borderColor: C.border, color: C.muted }}>
          <RefreshCcw className={`w-3.5 h-3.5 transition-transform ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 rounded-full animate-spin mr-3" style={{ borderColor: C.border, borderTopColor: C.gold }} />
          <span className="text-sm" style={{ color: C.muted }}>Loading room rates…</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {rooms.map((room, i) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl overflow-hidden border" style={{ borderColor: C.border }}>

              {/* Room image with name overlay */}
              <div className="h-36 relative overflow-hidden">
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="text-sm font-bold text-white">{room.name}</div>
                  <div className="text-xs text-white/60">
                    {(room.roomNumbers || []).length > 0
                      ? `Room${(room.roomNumbers || []).length > 1 ? "s" : ""} ${(room.roomNumbers || []).map((n: string) => n).join(" + ")} · `
                      : ""}
                    Max {room.maxGuests} guests
                  </div>
                </div>
              </div>

              {/* Rate management panel */}
              <div className="p-4 space-y-4" style={{ background: C.card }}>
                {editingId === room.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: "#60a5fa" }}>
                          Weekday Rate ₹
                        </label>
                        <input
                          type="number"
                          min={100}
                          step={50}
                          value={editWeekdayRate}
                          onChange={e => setEditWeekdayRate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-sm font-bold border outline-none"
                          style={{ background: "rgba(96,165,250,0.07)", borderColor: "#60a5fa", color: C.text }}
                          autoFocus
                          placeholder="e.g. 3500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: C.gold }}>
                          Weekend Rate ₹
                        </label>
                        <input
                          type="number"
                          min={100}
                          step={50}
                          value={editWeekendRate}
                          onChange={e => setEditWeekendRate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-sm font-bold border outline-none"
                          style={{ background: "rgba(212,168,67,0.07)", borderColor: C.gold, color: C.text }}
                          placeholder="e.g. 4500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveRate(room.id)}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                        style={{ background: C.gold, color: "#0a0a0a", opacity: saving ? 0.6 : 1 }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {saving ? "Saving…" : "Save Rates"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border"
                        style={{ borderColor: C.border, color: C.muted }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest mb-0.5 font-bold" style={{ color: "#60a5fa" }}>
                            Weekday
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-lg font-black" style={{ color: "#60a5fa" }}>
                              ₹{((room.weekdayRate || room.ratePerNight) || 0).toLocaleString()}
                            </span>
                            <span className="text-[9px]" style={{ color: C.muted }}>/night</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-widest mb-0.5 font-bold" style={{ color: C.gold }}>
                            Weekend
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-lg font-black" style={{ color: C.gold }}>
                              ₹{((room.weekendRate || room.ratePerNight) || 0).toLocaleString()}
                            </span>
                            <span className="text-[9px]" style={{ color: C.muted }}>/night</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => startEdit(room)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border hover:bg-white/10 transition-colors shrink-0"
                        style={{ borderColor: C.border, color: C.gold }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                    {room.isBundle && (
                      <div className="text-[9px]" style={{ color: C.muted }}>Bundle · covers all rooms in category</div>
                    )}
                  </div>
                )}

                {/* Quick cost preview: 1, 2, 3 nights (weekday rate) */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: C.border }}>
                  {[1, 2, 3].map(days => (
                    <div key={days} className="text-center py-2 px-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.muted }}>{days} Night{days > 1 ? "s" : ""}</div>
                      <div className="text-[10px] font-black" style={{ color: "#60a5fa" }}>
                        ₹{(((room.weekdayRate || room.ratePerNight) || 0) * days).toLocaleString()}
                      </div>
                      <div className="text-[9px]" style={{ color: C.muted }}>weekday</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Price Calendar ─────────────────────────────────── */}
      {!loading && rooms.length > 0 && (() => {
        const FULL_MONTHS_PC = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const t = new Date();
        const todayStr = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
        const activeRoom = rooms.find(r => r.id === priceCalRoomId) || rooms[0];
        const roomOverrides = priceOverrides[activeRoom?.id || ""] || {};
        const overrideCount = Object.keys(roomOverrides).length;
        const firstDay = new Date(priceCalYear, priceCalMonth, 1).getDay();
        const daysInMonth = new Date(priceCalYear, priceCalMonth + 1, 0).getDate();

        const handleDateClick = (dateStr: string, baseRate: number) => {
          if (editingPriceDate === dateStr) {
            setEditingPriceDate(null); setEditingPriceValue("");
          } else {
            setEditingPriceDate(dateStr);
            setEditingPriceValue(String(roomOverrides[dateStr] || baseRate));
          }
        };

        const handleSave = async () => {
          if (!activeRoom || !editingPriceDate) return;
          const price = parseInt(editingPriceValue);
          if (!price || price < 100) { alert("Enter a valid price (min ₹100)"); return; }
          await savePriceOverride(activeRoom.id, editingPriceDate, price);
        };

        const handleRemove = async () => {
          if (!activeRoom || !editingPriceDate) return;
          await removePriceOverride(activeRoom.id, editingPriceDate);
        };

        return (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: C.card }}>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" style={{ color: C.gold }} />
                <div>
                  <span className="text-sm font-bold" style={{ color: C.text }}>Price Calendar</span>
                  <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: C.muted }}>
                    Click any date to add · edit · update price
                  </div>
                </div>
              </div>
              {priceOverridesLoading && (
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: C.border, borderTopColor: C.gold }} />
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Room selector */}
              <div className="flex flex-wrap gap-2">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => { setPriceCalRoomId(room.id); setEditingPriceDate(null); setEditingPriceValue(""); }}
                    className="btn-apple px-3 py-1.5 text-[11px] font-semibold"
                    style={activeRoom?.id === room.id
                      ? { background: C.gold, color: "#0a0a0a", borderRadius: "9999px" }
                      : { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: "9999px" }
                    }
                  >
                    {room.name.split(" ").slice(0, 3).join(" ")}
                    {(room.roomNumbers || []).length > 0 && (
                      <span className="ml-1 opacity-60">·{(room.roomNumbers || []).join(",")}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom price count badge */}
              {overrideCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
                    {overrideCount} custom price{overrideCount > 1 ? "s" : ""} set for this room
                  </span>
                </div>
              )}

              {/* Month nav */}
              <div className="flex items-center justify-between">
                <button onClick={prevPriceCalMonth} className="btn-apple p-2 border" style={{ borderColor: C.border, color: C.muted, borderRadius: "9999px" }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold" style={{ color: C.text }}>{FULL_MONTHS_PC[priceCalMonth]} {priceCalYear}</span>
                <button onClick={nextPriceCalMonth} className="btn-apple p-2 border" style={{ borderColor: C.border, color: C.muted, borderRadius: "9999px" }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border" style={{ background: C.border, borderColor: C.border }}>
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className="py-2 text-center text-[10px] font-bold uppercase" style={{ background: "rgba(255,255,255,0.04)", color: C.muted }}>{d}</div>
                ))}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`ep-${i}`} className="h-14" style={{ background: "rgba(0,0,0,0.25)" }} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dt = new Date(priceCalYear, priceCalMonth, day);
                  const dateStr = `${priceCalYear}-${String(priceCalMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                  const past = dateStr < todayStr;
                  const isToday = dateStr === todayStr;
                  const isEditing = editingPriceDate === dateStr;
                  const dayIdx = dt.getDay();
                  const isWeekend = dayIdx === 0 || dayIdx === 5 || dayIdx === 6;
                  const baseRate = activeRoom ? (isWeekend ? (activeRoom.weekendRate || activeRoom.ratePerNight || 0) : (activeRoom.weekdayRate || activeRoom.ratePerNight || 0)) : 0;
                  const override = roomOverrides[dateStr];
                  const displayRate = override ?? baseRate;
                  const hasOverride = override !== undefined;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={past}
                      onClick={() => !past && handleDateClick(dateStr, baseRate)}
                      className="relative flex flex-col items-center justify-center h-14 transition-colors"
                      style={{
                        background: isEditing ? "rgba(212,168,67,0.18)" : past ? "rgba(0,0,0,0.2)" : hasOverride ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.02)",
                        cursor: past ? "default" : "pointer",
                      }}
                    >
                      {(isToday || isEditing) && (
                        <div className="absolute inset-[2px] rounded-lg border-2 pointer-events-none" style={{ borderColor: C.gold }} />
                      )}
                      {hasOverride && !past && !isEditing && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80" }} />
                      )}
                      <span className="text-[11px] font-bold leading-none mb-0.5" style={{
                        color: past ? "rgba(255,255,255,0.2)" : isEditing || isToday ? C.gold : hasOverride ? "#4ade80" : C.text,
                      }}>{day}</span>
                      {!past && displayRate > 0 && (
                        <span className="text-[9px] font-bold" style={{
                          color: isEditing || isToday ? C.gold : hasOverride ? "#4ade80" : C.muted,
                        }}>
                          ₹{(displayRate / 1000).toFixed(displayRate % 1000 === 0 ? 0 : 1)}K
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Inline edit panel */}
              {editingPriceDate && (() => {
                const editDateObj = new Date(editingPriceDate + "T12:00:00");
                const hasExisting = !!(activeRoom && priceOverrides[activeRoom.id]?.[editingPriceDate]);
                return (
                  <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: C.gold + "60", background: "rgba(212,168,67,0.05)" }}>
                    <div className="flex items-center gap-2">
                      <Pencil className="w-3.5 h-3.5 shrink-0" style={{ color: C.gold }} />
                      <span className="text-xs font-bold" style={{ color: C.text }}>
                        {editDateObj.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {hasExisting && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)" }}>
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: C.muted }}>₹</span>
                        <input
                          type="number"
                          min={100}
                          step={50}
                          value={editingPriceValue}
                          onChange={e => setEditingPriceValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditingPriceDate(null); setEditingPriceValue(""); } }}
                          autoFocus
                          placeholder="Enter price…"
                          className="w-36 pl-7 pr-3 py-2.5 rounded-xl text-sm font-bold border outline-none"
                          style={{ background: "rgba(212,168,67,0.08)", borderColor: C.gold, color: C.text }}
                        />
                      </div>
                      <span className="text-[10px]" style={{ color: C.muted }}>/night</span>
                      <button
                        onClick={handleSave}
                        disabled={savingPriceOverride}
                        className="btn-apple-primary flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold"
                        style={{ background: C.gold, color: "#0a0a0a", borderRadius: "9999px", opacity: savingPriceOverride ? 0.6 : 1 }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {savingPriceOverride ? "Saving…" : hasExisting ? "Update" : "Add"}
                      </button>
                      {hasExisting && (
                        <button
                          onClick={handleRemove}
                          disabled={savingPriceOverride}
                          className="btn-apple flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold"
                          style={{ border: "1px solid rgba(248,113,113,0.45)", color: "#f87171", borderRadius: "9999px", opacity: savingPriceOverride ? 0.6 : 1 }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                      <button
                        onClick={() => { setEditingPriceDate(null); setEditingPriceValue(""); }}
                        className="btn-apple px-3 py-2.5 text-xs font-bold border"
                        style={{ borderColor: C.border, color: C.muted, borderRadius: "9999px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 pt-1 border-t" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "rgba(237,233,225,0.5)" }} />
                  <span className="text-[10px]" style={{ color: C.muted }}>Base rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#4ade80" }} />
                  <span className="text-[10px]" style={{ color: C.muted }}>Custom price</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block border-2" style={{ borderColor: C.gold }} />
                  <span className="text-[10px]" style={{ color: C.muted }}>Selected / Today</span>
                </div>
                <span className="text-[9px] ml-auto italic" style={{ color: C.muted }}>Click any future date to set price</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Date Blocking ─────────────────────────────────── */}
      {(() => {
        const FULL_MONTHS_BC = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const bt = new Date();
        const todayStr = `${bt.getFullYear()}-${String(bt.getMonth()+1).padStart(2,"0")}-${String(bt.getDate()).padStart(2,"0")}`;
        const calFirstDay = new Date(blockedCalYear, blockedCalMonth, 1).getDay();
        const calDaysInMonth = new Date(blockedCalYear, blockedCalMonth + 1, 0).getDate();

        // Build blocked date sets per room
        const blockedByRoom: Record<string, Set<string>> = {};
        blocks.forEach((block: any) => {
          if (!blockedByRoom[block.roomId]) blockedByRoom[block.roomId] = new Set<string>();
          const sp = block.startDate.split("-");
          const ep = block.endDate.split("-");
          const start = new Date(parseInt(sp[0]), parseInt(sp[1]) - 1, parseInt(sp[2]));
          const end = new Date(parseInt(ep[0]), parseInt(ep[1]) - 1, parseInt(ep[2]));
          const curr = new Date(start);
          while (curr <= end) {
            const ds = `${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,"0")}-${String(curr.getDate()).padStart(2,"0")}`;
            blockedByRoom[block.roomId].add(ds);
            curr.setDate(curr.getDate() + 1);
          }
        });

        const handleCellClick = (room: any, dateStr: string, isBlocked: boolean) => {
          if (!isBlocked) return;
          setSelectedBlockCell(prev =>
            prev?.roomId === room.id && prev?.date === dateStr ? null
              : { roomId: room.id, roomName: room.name, date: dateStr }
          );
        };

        const handleUnblock = async () => {
          if (!selectedBlockCell) return;
          setRemovingBlock(true);
          const toRemove = blocks.filter((b: any) =>
            b.roomId === selectedBlockCell.roomId &&
            b.startDate <= selectedBlockCell.date &&
            b.endDate >= selectedBlockCell.date
          );
          try {
            await Promise.all(toRemove.map((b: any) => deleteDoc(doc(db, "roomBlocks", b.docId))));
            setBlocks(prev => prev.filter((b: any) => !toRemove.find((r: any) => r.docId === b.docId)));
            setSelectedBlockCell(null);
          } catch (err) {
            alert("Failed to unblock. Please try again."); console.error(err);
          } finally {
            setRemovingBlock(false);
          }
        };

        return (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: C.card }}>
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: "#f87171" }} />
                  <span className="text-sm font-bold" style={{ color: C.text }}>Date Blocking</span>
                  {blocks.length > 0 && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}>
                      {blocks.length} blocked
                    </span>
                  )}
                </div>
                <div className="text-[10px] mt-0.5 uppercase tracking-widest" style={{ color: C.muted }}>
                  Tap a red date to unblock · Customers see Sold Out
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadBlocks} className="p-2 rounded-full border hover:bg-white/10 transition-all active:scale-95" style={{ borderColor: C.border }}>
                  <RefreshCcw className={`w-3.5 h-3.5 transition-transform ${blocksLoading ? "animate-spin" : ""}`} style={{ color: C.muted }} />
                </button>
                <button
                  onClick={() => { setShowAddBlock(v => !v); setSelectedBlockCell(null); }}
                  className="btn-apple flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border"
                  style={{ borderColor: showAddBlock ? "#f87171" : C.border, color: showAddBlock ? "#f87171" : C.gold, borderRadius: "9999px" }}
                >
                  {showAddBlock ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {showAddBlock ? "Cancel" : "Block Dates"}
                </button>
              </div>
            </div>

            {/* Add Block Form */}
            {showAddBlock && (
              <div className="px-5 py-4 border-t space-y-4" style={{ borderColor: C.border, background: "rgba(248,113,113,0.04)" }}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.muted }}>
                      Rooms to Block
                      {blockRoomIds.length > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(248,113,113,0.2)", color: "#f87171" }}>
                          {blockRoomIds.length} selected
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setBlockRoomIds(blockRooms.map((r: any) => r.id))}
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-white/10" style={{ color: C.gold }}>All</button>
                      <button type="button" onClick={() => setBlockRoomIds([])}
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-white/10" style={{ color: C.muted }}>Clear</button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {blockRooms.map((r: any) => {
                      const checked = blockRoomIds.includes(r.id);
                      return (
                        <label key={r.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all select-none"
                          style={{ borderColor: checked ? "rgba(248,113,113,0.5)" : C.border, background: checked ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.03)" }}>
                          <input type="checkbox" checked={checked} onChange={() => toggleBlockRoom(r.id)} className="accent-[#f87171] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: checked ? "#f87171" : C.text }}>{r.name}</div>
                            {r.roomNumbers?.length > 0 && <div className="text-[9px] font-mono" style={{ color: C.muted }}>Room {r.roomNumbers.join(", ")}</div>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: C.muted }}>Reason (optional)</label>
                    <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)}
                      placeholder="e.g. Maintenance, Owner stay…"
                      className="w-full px-3 py-2.5 rounded-xl text-xs border outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", borderColor: C.border, color: C.text }} />
                  </div>
                  <div />
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-2" style={{ color: C.muted }}>
                      Block Dates{blockDates.length > 0 && <span className="ml-2 font-normal normal-case" style={{ color: "#f87171" }}>— {blockDates.length} selected</span>}
                    </label>
                    <div className="admin-block-datepicker">
                      <DatePicker inline selectsMultiple selectedDates={blockDates}
                        onChange={(dates: Date[]) => setBlockDates(dates ?? [])} minDate={new Date()} />
                    </div>
                    {blockDates.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {blockDates.map((d, i) => (
                          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                            style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
                            {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            <button type="button" onClick={() => setBlockDates(prev => prev.filter((_, j) => j !== i))}
                              className="hover:opacity-70 cursor-pointer ml-0.5">×</button>
                          </span>
                        ))}
                        <button type="button" onClick={() => setBlockDates([])}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold hover:opacity-70 cursor-pointer"
                          style={{ background: "rgba(255,255,255,0.06)", color: C.muted, border: `1px solid ${C.border}` }}>Clear all</button>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={saveBlock} disabled={savingBlock}
                  className="btn-apple w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  style={{ background: "#f87171", color: "#fff", borderRadius: "9999px", opacity: savingBlock ? 0.6 : 1 }}>
                  <Calendar className="w-3.5 h-3.5" />
                  {savingBlock ? "Saving…" : "Confirm Block"}
                </button>
              </div>
            )}

            {/* Calendar View — always visible */}
            {blocksLoading ? (
              <div className="flex items-center justify-center gap-2 py-10">
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: C.border, borderTopColor: "#f87171" }} />
                <span className="text-xs" style={{ color: C.muted }}>Loading…</span>
              </div>
            ) : (
              <>
                {/* Month nav */}
                <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: C.border, background: "rgba(255,255,255,0.01)" }}>
                  <button onClick={prevBlockedCalMonth} className="btn-apple p-1.5 border" style={{ borderColor: C.border, color: C.muted, borderRadius: "9999px" }}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold" style={{ color: C.text }}>{FULL_MONTHS_BC[blockedCalMonth]} {blockedCalYear}</span>
                  <button onClick={nextBlockedCalMonth} className="btn-apple p-1.5 border" style={{ borderColor: C.border, color: C.muted, borderRadius: "9999px" }}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Legend */}
                <div className="px-5 py-2 flex items-center gap-4 border-t" style={{ borderColor: C.border }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded inline-block" style={{ background: "rgba(74,222,128,0.35)", border: "1px solid rgba(74,222,128,0.5)" }} />
                    <span className="text-[10px]" style={{ color: C.muted }}>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded inline-block" style={{ background: "rgba(248,113,113,0.85)" }} />
                    <span className="text-[10px]" style={{ color: C.muted }}>Blocked · tap to unblock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded inline-block" style={{ background: "rgba(212,168,67,0.3)", border: `1px solid ${C.gold}` }} />
                    <span className="text-[10px]" style={{ color: C.muted }}>Today</span>
                  </div>
                </div>

                {/* Unblock action panel */}
                {selectedBlockCell && (
                  <div className="mx-4 mb-3 mt-1 border rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                    style={{ borderColor: "rgba(248,113,113,0.4)", background: "rgba(248,113,113,0.06)" }}>
                    <div>
                      <div className="text-xs font-bold" style={{ color: "#f87171" }}>{selectedBlockCell.roomName}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>
                        {new Date(selectedBlockCell.date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleUnblock} disabled={removingBlock}
                        className="btn-apple flex items-center gap-1.5 px-3 py-2 text-xs font-bold"
                        style={{ background: "#f87171", color: "#fff", borderRadius: "9999px", opacity: removingBlock ? 0.6 : 1 }}>
                        <X className="w-3.5 h-3.5" />
                        {removingBlock ? "Removing…" : "Unblock"}
                      </button>
                      <button onClick={() => setSelectedBlockCell(null)}
                        className="btn-apple p-2 border" style={{ borderColor: C.border, color: C.muted, borderRadius: "9999px" }}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Mini room calendars grid */}
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {blockRooms.map((room: any) => {
                    const roomBlocked = blockedByRoom[room.id] || new Set<string>();
                    return (
                      <div key={room.id} className="rounded-xl p-2.5 border" style={{ borderColor: C.border, background: "rgba(255,255,255,0.02)" }}>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-1">
                          {["S","M","T","W","T","F","S"].map((d, i) => (
                            <div key={i} className="text-center text-[7px] font-bold py-0.5" style={{ color: C.muted }}>{d}</div>
                          ))}
                        </div>
                        {/* Date cells */}
                        <div className="grid grid-cols-7 gap-[2px]">
                          {Array.from({ length: calFirstDay }, (_, i) => <div key={`e-${i}`} className="aspect-square" />)}
                          {Array.from({ length: calDaysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dateStr = `${blockedCalYear}-${String(blockedCalMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                            const isBlocked = roomBlocked.has(dateStr);
                            const isPast = dateStr < todayStr;
                            const isToday = dateStr === todayStr;
                            const isSelected = selectedBlockCell?.roomId === room.id && selectedBlockCell?.date === dateStr;
                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => handleCellClick(room, dateStr, isBlocked)}
                                disabled={!isBlocked || isPast}
                                className="aspect-square flex items-center justify-center rounded text-[8px] font-bold transition-all active:scale-90"
                                style={{
                                  background: isSelected ? "#f87171" : isBlocked ? "rgba(248,113,113,0.85)" : isPast ? "rgba(255,255,255,0.03)" : isToday ? "rgba(212,168,67,0.25)" : "rgba(74,222,128,0.18)",
                                  color: isBlocked ? "#fff" : isPast ? "rgba(255,255,255,0.18)" : isToday ? C.gold : "rgba(74,222,128,0.9)",
                                  border: isToday && !isBlocked ? `1px solid ${C.gold}` : isSelected ? "2px solid #fff" : "none",
                                  cursor: isBlocked && !isPast ? "pointer" : "default",
                                  transform: isSelected ? "scale(1.15)" : undefined,
                                }}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        {/* Room name */}
                        <div className="mt-2 text-[9px] font-bold truncate" style={{ color: C.text }}>{room.name}</div>
                        {roomBlocked.size > 0 && (
                          <div className="text-[8px] mt-0.5" style={{ color: "#f87171" }}>
                            {[...roomBlocked].filter(d => d >= todayStr && d.startsWith(`${blockedCalYear}-${String(blockedCalMonth+1).padStart(2,"0")}`)).length} blocked this month
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* Extra Bed Rate */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: C.card }}>
          <div>
            <div className="text-sm font-bold" style={{ color: C.text }}>Extra Bed Charge</div>
            <div className="text-[10px] mt-0.5 uppercase tracking-widest" style={{ color: C.muted }}>Per bed · Per night</div>
          </div>
          {editingExtraBed ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={100}
                step={50}
                value={editExtraBedRate}
                onChange={e => setEditExtraBedRate(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveExtraBedRate()}
                className="w-28 px-3 py-2 rounded-xl text-sm font-bold border outline-none text-right"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: C.gold, color: C.text }}
                autoFocus
                placeholder="1500"
              />
              <button
                onClick={saveExtraBedRate}
                disabled={savingExtraBed}
                className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                style={{ background: C.gold, color: "#0a0a0a", opacity: savingExtraBed ? 0.6 : 1 }}
              >
                <Check className="w-3.5 h-3.5" />
                {savingExtraBed ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditingExtraBed(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border"
                style={{ borderColor: C.border, color: C.muted }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-2xl font-black" style={{ color: C.gold }}>
                ₹{extraBedRate.toLocaleString()}<span className="text-xs font-normal ml-1" style={{ color: C.muted }}>/night</span>
              </div>
              <button
                onClick={() => { setEditExtraBedRate(String(extraBedRate)); setEditingExtraBed(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border hover:bg-white/10 transition-colors"
                style={{ borderColor: C.border, color: C.gold }}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: BOOKINGS ─────────────────────────────────────────────────────────
function ModuleBookings({ bookings, onRefresh, onDelete, onEdit, onStatusChange, onWhatsApp }: any) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [refreshSpin, setRefreshSpin] = useState(false);
  const handleRefresh = () => {
    setRefreshSpin(true);
    onRefresh();
    setTimeout(() => setRefreshSpin(false), 900);
  };

  const filtered = bookings.filter((b: any) => {
    const matchFilter = filter === "All" || b.status === filter;
    const matchSearch = !search || (b.billingName||"").toLowerCase().includes(search.toLowerCase()) || (b.id||"").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Booking Management</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{bookings.length} total reservations in Firestore</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="p-2.5 rounded-xl hover:bg-white/10 border transition-all active:scale-95" style={{ borderColor: C.border }}>
            <RefreshCcw className={`w-4 h-4 transition-transform ${refreshSpin ? "animate-spin" : ""}`} style={{ color: C.muted }} />
          </button>
          <button onClick={() => onEdit(null)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            style={{ background: C.gold, color: "#0a0a0a" }}>
            <Plus className="w-4 h-4" /> New Booking
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by guest name or booking ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: C.border, color: C.text }}
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-none" style={{ background: "rgba(255,255,255,0.04)" }}>
          {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95"
              style={{ background: filter === f ? C.gold : "transparent", color: filter === f ? "#0a0a0a" : C.muted }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-10 border text-center text-sm" style={{ background: C.card, borderColor: C.border, color: C.muted }}>
            No bookings found
          </div>
        ) : filtered.map((bk: any) => (
          <motion.div key={bk.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 border space-y-3" style={{ background: C.card, borderColor: C.border }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-sm" style={{ color: C.text }}>{bk.billingName || "Guest"}</div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: C.gold }}>{bk.id}</div>
                <div className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: C.muted }}>
                  <Mail className="w-3 h-3" />{bk.billingEmail}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                bk.status === "Confirmed" ? "bg-emerald-500/15 text-emerald-400"
                : bk.status === "Pending" ? "bg-amber-500/15 text-amber-400"
                : bk.status === "Cancelled" ? "bg-red-500/15 text-red-400"
                : "bg-blue-500/15 text-blue-400"
              }`}>{bk.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.muted }}>Room</div>
                <div className="text-xs font-semibold truncate" style={{ color: C.text }}>{bk.room?.name || "Suite"}</div>
                <div className="text-[10px]" style={{ color: C.muted }}>{bk.guestsText || "2 Guests"}</div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.muted }}>Stay</div>
                <div className="text-[10px]" style={{ color: C.text }}>{bk.checkIn}</div>
                <div className="text-[10px]" style={{ color: C.muted }}>→ {bk.checkOut} · <span style={{ color: C.gold }}>{bk.nightsNum || 1}N</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: C.border }}>
              <div>
                <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.muted }}>Total</div>
                <div className="text-sm font-bold font-mono" style={{ color: C.gold }}>₹{(bk.totalCost||0).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1">
                <select value={bk.status} onChange={e => onStatusChange(bk.id, e.target.value)}
                  className="px-2 py-1.5 rounded-xl text-[10px] font-bold border-0 outline-none cursor-pointer mr-1"
                  style={{
                    background: bk.status === "Confirmed" ? "rgba(74,222,128,0.15)"
                      : bk.status === "Pending" ? "rgba(245,158,11,0.15)"
                      : bk.status === "Cancelled" ? "rgba(248,113,113,0.15)"
                      : "rgba(96,165,250,0.15)",
                    color: bk.status === "Confirmed" ? "#4ade80"
                      : bk.status === "Pending" ? "#f59e0b"
                      : bk.status === "Cancelled" ? "#f87171"
                      : "#60a5fa"
                  }}>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button onClick={() => onEdit(bk)} className="p-2 rounded-xl hover:bg-white/10 transition-colors active:scale-95" title="Edit">
                  <Edit2 className="w-4 h-4" style={{ color: "#60a5fa" }} />
                </button>
                <button onClick={() => onWhatsApp(bk)} className="p-2 rounded-xl hover:bg-white/10 transition-colors active:scale-95" title="WhatsApp">
                  <MessageSquare className="w-4 h-4" style={{ color: "#25D366" }} />
                </button>
                <button onClick={() => onDelete(bk.id)} className="p-2 rounded-xl hover:bg-white/10 transition-colors active:scale-95" title="Delete">
                  <Trash2 className="w-4 h-4" style={{ color: "#f87171" }} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: C.muted }}>No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                <tr>
                  {["Booking ID","Guest","Room","Stay","Total","Status","Actions"].map(h => (
                    <th key={h} className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((bk: any) => (
                  <tr key={bk.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: C.border }}>
                    <td className="px-5 py-4 font-mono font-bold" style={{ color: C.gold }}>{bk.id}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold" style={{ color: C.text }}>{bk.billingName || "Guest"}</div>
                      <div className="flex items-center gap-1 mt-0.5" style={{ color: C.muted }}>
                        <Mail className="w-3 h-3" />{bk.billingEmail}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold" style={{ color: C.text }}>{bk.room?.name || "Suite"}</div>
                      <div style={{ color: C.muted }}>{bk.guestsText || "2 Guests"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div style={{ color: C.text }}>{bk.checkIn} → {bk.checkOut}</div>
                      <div style={{ color: C.gold }} className="font-bold">{bk.nightsNum || 1} nights</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold" style={{ color: C.text }}>₹{(bk.totalCost||0).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <select value={bk.status} onChange={e => onStatusChange(bk.id, e.target.value)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold border-0 outline-none cursor-pointer"
                        style={{
                          background: bk.status === "Confirmed" ? "rgba(74,222,128,0.15)"
                            : bk.status === "Pending" ? "rgba(245,158,11,0.15)"
                            : bk.status === "Cancelled" ? "rgba(248,113,113,0.15)"
                            : "rgba(96,165,250,0.15)",
                          color: bk.status === "Confirmed" ? "#4ade80"
                            : bk.status === "Pending" ? "#f59e0b"
                            : bk.status === "Cancelled" ? "#f87171"
                            : "#60a5fa"
                        }}>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(bk)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
                        </button>
                        <button onClick={() => onWhatsApp(bk)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="WhatsApp">
                          <MessageSquare className="w-3.5 h-3.5" style={{ color: "#25D366" }} />
                        </button>
                        <button onClick={() => onDelete(bk.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODULE: CUSTOMERS ────────────────────────────────────────────────────────
function ModuleCustomers({ bookings }: { bookings: any[] }) {
  const guests = bookings.reduce((acc: any, b: any) => {
    const key = b.billingEmail;
    if (!key) return acc;
    if (!acc[key]) acc[key] = { name: b.billingName, email: b.billingEmail, phone: `${b.phonePrefix||""} ${b.phoneNumber||""}`, bookings: [], totalSpend: 0 };
    acc[key].bookings.push(b);
    acc[key].totalSpend += b.totalCost || 0;
    return acc;
  }, {} as Record<string, any>);
  const list = Object.values(guests);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Customer CRM</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{list.length} unique guests</p>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl p-12 border text-center text-sm" style={{ background: C.card, borderColor: C.border, color: C.muted }}>
          No guest data yet. Guests appear here once bookings are created.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(list as any[]).map((g: any, i) => (
            <motion.div key={g.email} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
              className="rounded-2xl p-5 border" style={{ background: C.card, borderColor: C.border }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                  style={{ background: `${C.gold}20`, color: C.gold }}>
                  {(g.name||"G").charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate" style={{ color: C.text }}>{g.name}</div>
                  <div className="text-[10px] truncate" style={{ color: C.muted }}>{g.email}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: C.muted }}>Total Bookings</span>
                  <span className="font-bold" style={{ color: C.text }}>{g.bookings.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: C.muted }}>Total Spend</span>
                  <span className="font-bold font-mono" style={{ color: C.gold }}>₹{g.totalSpend.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: C.muted }}>Last Stay</span>
                  <span className="font-semibold" style={{ color: C.text }}>{g.bookings[g.bookings.length-1]?.checkIn || "-"}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `${C.gold}18`, color: C.gold }}>
                  View History
                </button>
                <button className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(37,211,102,0.1)", color: "#25D366" }}>
                  WhatsApp
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MODULE: FOOD & DINING ────────────────────────────────────────────────────
function ModuleFood() {
  const [menu, setMenu] = useState(MOCK_FOOD_MENU);
  const cats = [...new Set(menu.map(m => m.cat))];
  const [activecat, setActiveCat] = useState("All");
  const filtered = activecat === "All" ? menu : menu.filter(m => m.cat === activecat);
  const toggle = (id: number) => setMenu(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Food & Dining</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{menu.filter(m=>m.available).length} items available on menu</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
          style={{ background: C.gold, color: "#0a0a0a" }}>
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["All", ...cats].map(c => (
          <button key={c} onClick={() => setActiveCat(c)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
            style={{ background: activecat === c ? C.gold : "rgba(255,255,255,0.05)", color: activecat === c ? "#0a0a0a" : C.muted }}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
            className="rounded-2xl p-5 border" style={{ background: C.card, borderColor: C.border }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-sm" style={{ color: C.text }}>{item.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: C.gold }}>{item.cat}</div>
              </div>
              <button onClick={() => toggle(item.id)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${item.available ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                {item.available ? "Active" : "Off"}
              </button>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-lg font-black" style={{ color: C.text }}>₹{item.price}</span>
                <span className="text-[10px] ml-1" style={{ color: C.muted }}>per serving</span>
              </div>
              <div className="flex items-center gap-1" style={{ color: C.muted }}>
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">{item.orders} orders</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE: CAMPFIRE ─────────────────────────────────────────────────────────
function ModuleCampfire() {
  const [slots, setSlots] = useState(MOCK_CAMPFIRE);
  const confirmSlot = (id: number) => setSlots(prev => prev.map(s => s.id === id ? { ...s, status:"confirmed" } : s));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Campfire Management</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>Manage evening campfire experiences</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
          style={{ background: C.gold, color: "#0a0a0a" }}>
          <Plus className="w-4 h-4" /> New Slot
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {slots.map((slot, i) => (
          <motion.div key={slot.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
            className="rounded-2xl p-5 border" style={{ background: C.card, borderColor: C.border }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,146,60,0.15)" }}>
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: C.text }}>{slot.theme}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{slot.date} · {slot.time}</div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${slot.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {slot.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>Guests</div>
                <div className="font-bold" style={{ color: C.text }}>{slot.guests} people</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>Guide</div>
                <div className="font-bold text-xs" style={{ color: C.text }}>{slot.guide}</div>
              </div>
            </div>
            {slot.status === "pending" && (
              <button onClick={() => confirmSlot(slot.id)}
                className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                style={{ background: `${C.gold}20`, color: C.gold }}>
                <Check className="w-4 h-4" /> Confirm Slot
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE: BILLING ──────────────────────────────────────────────────────────
function ModuleBilling({ bookings }: { bookings: any[] }) {
  const totalRevenue = bookings.reduce((s,b) => s + (b.totalCost||0), 0);
  const collected = bookings.filter(b=>b.status==="Completed").reduce((s,b) => s + (b.totalCost||0), 0);
  const pending = bookings.filter(b=>b.status!=="Completed").reduce((s,b) => s + (b.totalCost||0), 0);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold" style={{ color: C.text }}>Billing & Payments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:"Total Revenue", value:`₹${totalRevenue.toLocaleString()}`, color: C.gold },
          { label:"Collected", value:`₹${collected.toLocaleString()}`, color:"#4ade80" },
          { label:"Outstanding", value:`₹${pending.toLocaleString()}`, color:"#f59e0b" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 border" style={{ background: C.card, borderColor: C.border }}>
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.muted }}>{s.label}</div>
            <div className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Invoice Register header */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: C.border, background: "rgba(255,255,255,0.02)" }}>
          <span className="text-xs uppercase tracking-widest font-bold" style={{ color: C.gold }}>Invoice Register</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background:`${C.gold}15`, color: C.gold }}>
            <Download className="w-3.5 h-3.5" /> Export All
          </button>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden divide-y" style={{ borderColor: C.border }}>
          {bookings.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: C.muted }}>No invoices yet</div>
          ) : bookings.map(bk => (
            <div key={bk.id} className="p-4 space-y-2 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-xs font-mono" style={{ color: C.gold }}>INV-{bk.id?.slice(-6)||"000000"}</div>
                  <div className="font-semibold text-sm mt-0.5" style={{ color: C.text }}>{bk.billingName||"Guest"}</div>
                  <div className="text-[10px]" style={{ color: C.muted }}>{bk.room?.name||"Suite"}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold block mb-1 ${bk.status==="Completed"?"bg-emerald-500/15 text-emerald-400":bk.status==="Pending"?"bg-amber-500/15 text-amber-400":"bg-blue-500/15 text-blue-400"}`}>
                    {bk.status==="Completed"?"Paid":bk.status==="Pending"?"Due":"Active"}
                  </span>
                  <div className="text-sm font-bold font-mono" style={{ color: C.text }}>₹{(bk.totalCost||0).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[10px]" style={{ color: C.muted }}>{bk.createdTime||"-"}</div>
                <button className="flex items-center gap-1 text-[10px] font-bold active:scale-95 transition-all" style={{ color: C.gold }}>
                  <Printer className="w-3 h-3" /> Print
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead style={{ background: "rgba(255,255,255,0.02)" }}>
              <tr>{["Invoice","Guest","Room","Amount","Status","Date","Action"].map(h=>(
                <th key={h} className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold" style={{ color: C.muted, borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {bookings.map(bk => (
                <tr key={bk.id} className="border-b hover:bg-white/[0.015] transition-colors" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3 font-mono font-bold" style={{ color: C.gold }}>INV-{bk.id?.slice(-6)||"000000"}</td>
                  <td className="px-5 py-3 font-semibold" style={{ color: C.text }}>{bk.billingName||"Guest"}</td>
                  <td className="px-5 py-3" style={{ color: C.muted }}>{bk.room?.name||"Suite"}</td>
                  <td className="px-5 py-3 font-bold font-mono" style={{ color: C.text }}>₹{(bk.totalCost||0).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${bk.status==="Completed"?"bg-emerald-500/15 text-emerald-400":bk.status==="Pending"?"bg-amber-500/15 text-amber-400":"bg-blue-500/15 text-blue-400"}`}>
                      {bk.status==="Completed"?"Paid":bk.status==="Pending"?"Due":"Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: C.muted }}>{bk.createdTime||"-"}</td>
                  <td className="px-5 py-4">
                    <button className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.gold }}>
                      <Printer className="w-3 h-3" /> Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="p-12 text-center text-sm" style={{ color: C.muted }}>No invoices yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: WEBSITE CMS ──────────────────────────────────────────────────────
function ModuleCMS() {
  const [cms, setCms] = useState(CMS_DEFAULTS);
  const [saved, setSaved] = useState(false);
  const update = (k: keyof typeof CMS_DEFAULTS, v: string) => setCms(p => ({ ...p, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Website CMS</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>Manage your website content dynamically</p>
        </div>
        <button onClick={save} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          style={{ background: saved ? "#4ade80" : C.gold, color: "#0a0a0a" }}>
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Send className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {[
          { key:"heroTitle", label:"Hero Headline", type:"text" },
          { key:"heroSubtitle", label:"Hero Subheadline", type:"text" },
          { key:"contactEmail", label:"Contact Email", type:"email" },
          { key:"contactPhone", label:"Contact Phone", type:"text" },
          { key:"address", label:"Resort Address", type:"text" },
          { key:"checkInTime", label:"Check-In Time", type:"time" },
          { key:"checkOutTime", label:"Check-Out Time", type:"time" },
        ].map(field => (
          <div key={field.key} className="rounded-2xl p-5 border" style={{ background: C.card, borderColor: C.border }}>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.muted }}>{field.label}</label>
            <input type={field.type} value={(cms as any)[field.key]} onChange={e => update(field.key as any, e.target.value)}
              className="w-full bg-transparent outline-none text-sm font-medium border-b pb-1 transition-colors"
              style={{ color: C.text, borderColor: C.border }} />
          </div>
        ))}
        <div className="rounded-2xl p-5 border lg:col-span-2" style={{ background: C.card, borderColor: C.border }}>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.muted }}>About Text</label>
          <textarea value={cms.aboutText} onChange={e => update("aboutText", e.target.value)} rows={4}
            className="w-full bg-transparent outline-none text-sm font-medium resize-none"
            style={{ color: C.text }} />
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: GALLERY ──────────────────────────────────────────────────────────
function ModuleGallery() {
  const [gallery, setGallery] = useState(MOCK_GALLERY);
  const [activeCat, setActiveCat] = useState("All");
  const cats = [...new Set(gallery.map(g => g.cat))];
  const filtered = activeCat === "All" ? gallery : gallery.filter(g => g.cat === activeCat);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Gallery Management</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{gallery.length} photos across {cats.length} categories</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider" style={{ background: C.gold, color: "#0a0a0a" }}>
          <Upload className="w-4 h-4" /> Upload Photo
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["All", ...cats].map(c => (
          <button key={c} onClick={() => setActiveCat(c)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider"
            style={{ background: activeCat === c ? C.gold : "rgba(255,255,255,0.05)", color: activeCat === c ? "#0a0a0a" : C.muted }}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((img, i) => (
          <motion.div key={img.id} initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i*0.04 }}
            className="rounded-2xl overflow-hidden border relative group cursor-pointer" style={{ borderColor: C.border }}>
            <img src={img.url} alt={img.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                <Eye className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 rounded-full bg-red-500/60 backdrop-blur-sm hover:bg-red-500/80 transition-colors">
                <Trash className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-xs font-bold text-white">{img.title}</div>
              <div className="text-[10px] text-white/60">{img.cat}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE: TOURIST PLACES ───────────────────────────────────────────────────
function ModulePlaces() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Tourist Places — Ooty</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>Nearby attractions to recommend to guests</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider" style={{ background: C.gold, color: "#0a0a0a" }}>
          <Plus className="w-4 h-4" /> Add Place
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_PLACES.map((place, i) => (
          <motion.div key={place.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
            className="rounded-2xl p-5 border flex gap-4" style={{ background: C.card, borderColor: C.border }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: place.type==="Nature" ? "rgba(74,222,128,0.12)" : place.type==="Adventure" ? "rgba(251,146,60,0.12)" : "rgba(167,139,250,0.12)" }}>
              {place.type === "Nature" ? <Leaf className="w-5 h-5 text-emerald-400" />
               : place.type === "Adventure" ? <Mountain className="w-5 h-5 text-orange-400" />
               : <Award className="w-5 h-5 text-purple-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-sm" style={{ color: C.text }}>{place.name}</div>
                <span className="text-[10px] font-bold shrink-0" style={{ color: C.gold }}>{place.dist}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: C.muted }}>{place.desc}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}>{place.type}</span>
                <span className="text-[9px]" style={{ color: C.muted }}>Open: {place.open}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE: STAFF ────────────────────────────────────────────────────────────
function ModuleStaff() {
  const deptColors: Record<string, string> = {
    Operations: "#60a5fa", "Food & Dining": "#f59e0b", Housekeeping: "#4ade80",
    Security: "#f87171", Wellness: "#e879f9", Facility: "#34d399",
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Staff Management</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{MOCK_STAFF.filter(s=>s.status==="active").length} active · {MOCK_STAFF.filter(s=>s.status!=="active").length} on leave</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider" style={{ background: C.gold, color: "#0a0a0a" }}>
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_STAFF.map((s, i) => {
          const deptColor = deptColors[s.dept] || C.gold;
          return (
            <motion.div key={s.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
              className="rounded-2xl p-5 border flex items-center gap-4" style={{ background: C.card, borderColor: C.border }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                style={{ background: `${deptColor}20`, color: deptColor }}>
                {s.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm truncate" style={{ color: C.text }}>{s.name}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${s.status==="active" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {s.status === "active" ? "Active" : "On Leave"}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: C.muted }}>{s.role}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${deptColor}15`, color: deptColor }}>{s.dept}</span>
                  <span className="text-[10px]" style={{ color: C.muted }}>{s.phone}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MODULE: REVIEWS ──────────────────────────────────────────────────────────
function ModuleReviews() {
  const avg = (MOCK_REVIEWS.reduce((s,r) => s+r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Reviews & Testimonials</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{MOCK_REVIEWS.length} reviews · {avg} ⭐ average rating</p>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-2">
        {[5,4,3,2,1].map(r => {
          const count = MOCK_REVIEWS.filter(rv => rv.rating === r).length;
          return (
            <div key={r} className="rounded-2xl p-4 border text-center" style={{ background: C.card, borderColor: C.border }}>
              <div className="text-xl font-black" style={{ color: C.text }}>{count}</div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {Array.from({ length: r }).map((_,i) => <Star key={i} className="w-2.5 h-2.5 fill-current" style={{ color: C.gold }} />)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-3">
        {MOCK_REVIEWS.map((rv, i) => (
          <motion.div key={rv.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
            className="rounded-2xl p-5 border" style={{ background: C.card, borderColor: C.border }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: `${C.gold}20`, color: C.gold }}>
                  {rv.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xs" style={{ color: C.text }}>{rv.name}</div>
                  <div className="text-[10px]" style={{ color: C.muted }}>{rv.room} · {rv.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {Array.from({ length: 5 }).map((_,i) => (
                  <Star key={i} className={`w-3 h-3 ${i < rv.rating ? "fill-current" : ""}`} style={{ color: C.gold, opacity: i < rv.rating ? 1 : 0.2 }} />
                ))}
              </div>
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: C.muted }}>{rv.comment}</p>
            <div className="flex items-center gap-2 mt-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{ background: rv.replied ? "rgba(74,222,128,0.1)" : `${C.gold}15`, color: rv.replied ? "#4ade80" : C.gold }}>
                <MessageSquare className="w-3 h-3" />
                {rv.replied ? "Replied" : "Reply"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE: ANALYTICS ────────────────────────────────────────────────────────
function ModuleAnalytics({ bookings }: { bookings: any[] }) {
  const totalRevenue = bookings.reduce((s,b) => s+(b.totalCost||0), 0);
  const avgPerBooking = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: C.text }}>Reports & Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Revenue", val:`₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: C.gold },
          { label:"Avg Booking Value", val:`₹${avgPerBooking.toLocaleString()}`, icon: TrendingUp, color:"#4ade80" },
          { label:"Total Guests", val:bookings.length, icon:Users, color:"#60a5fa" },
          { label:"Avg Stay (nights)", val: bookings.length ? (bookings.reduce((s,b)=>s+(b.nightsNum||1),0)/bookings.length).toFixed(1) : "0", icon:Calendar, color:"#f59e0b" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 border" style={{ background: C.card, borderColor: C.border }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${s.color}18` }}>
                <s.icon className="w-4.5 h-4.5" style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-black font-mono" style={{ color: C.text }}>{s.val}</div>
            <div className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="rounded-2xl p-6 border" style={{ background: C.card, borderColor: C.border }}>
        <div className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: C.gold }}>Monthly Revenue Trend (₹ Lakhs)</div>
        <div className="text-3xl font-black mb-6" style={{ color: C.text }}>₹{REVENUE_DATA.reduce((s,v)=>s+v,0)}L YTD</div>
        <div className="flex items-end gap-3 h-40">
          {REVENUE_DATA.map((v, i) => {
            const max = Math.max(...REVENUE_DATA);
            const isActive = i === new Date().getMonth();
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-bold" style={{ color: isActive ? C.gold : C.muted }}>₹{v}L</span>
                <div className="w-full rounded-t-lg transition-all relative overflow-hidden"
                  style={{ height: `${(v / max) * 130}px`, background: isActive ? `linear-gradient(to top, ${C.gold}, ${C.goldLight})` : "rgba(212,168,67,0.2)" }}>
                  {isActive && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                </div>
                <span className="text-[9px]" style={{ color: isActive ? C.gold : C.muted }}>{MONTHS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Occupancy Trend */}
      <div className="rounded-2xl p-6 border" style={{ background: C.card, borderColor: C.border }}>
        <div className="text-xs uppercase tracking-widest font-bold mb-6" style={{ color: C.gold }}>Room Occupancy % by Month</div>
        <div className="flex items-end gap-3 h-28">
          {OCCUPANCY_DATA.map((v, i) => {
            const isActive = i === new Date().getMonth();
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md" style={{ height: `${v}%`, background: isActive ? "#4ade80" : "rgba(74,222,128,0.2)" }} />
                <span className="text-[8px]" style={{ color: isActive ? "#4ade80" : C.muted }}>{MONTHS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: SETTINGS ────────────────────────────────────────────────────────
function ModuleSettings({ onLogout }: { onLogout: () => void }) {
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [darkDash, setDarkDash] = useState(true);

  const Toggle = ({ val, set }: { val: boolean; set: (v:boolean)=>void }) => (
    <button onClick={() => set(!val)}
      className="w-11 h-6 rounded-full transition-all relative"
      style={{ background: val ? C.gold : "rgba(255,255,255,0.1)" }}>
      <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow"
        style={{ left: val ? "calc(100% - 1.25rem)" : "4px" }} />
    </button>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-xl font-bold" style={{ color: C.text }}>Settings</h2>

      {/* Notification Settings */}
      <div className="rounded-2xl p-6 border space-y-4" style={{ background: C.card, borderColor: C.border }}>
        <div className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: C.gold }}>Notifications</div>
        {[
          { label:"WhatsApp Alerts", sub:"Send booking confirmations via WhatsApp", val:notifWhatsApp, set:setNotifWhatsApp },
          { label:"SMS Notifications", sub:"Send SMS for check-in reminders", val:notifSMS, set:setNotifSMS },
          { label:"Email Confirmations", sub:"Auto-send email on booking create/update", val:notifEmail, set:setNotifEmail },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: C.border }}>
            <div>
              <div className="text-sm font-semibold" style={{ color: C.text }}>{s.label}</div>
              <div className="text-xs" style={{ color: C.muted }}>{s.sub}</div>
            </div>
            <Toggle val={s.val} set={s.set} />
          </div>
        ))}
      </div>

      {/* Display Settings */}
      <div className="rounded-2xl p-6 border space-y-4" style={{ background: C.card, borderColor: C.border }}>
        <div className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: C.gold }}>Display</div>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-semibold" style={{ color: C.text }}>Dark Dashboard Mode</div>
            <div className="text-xs" style={{ color: C.muted }}>Premium dark theme is always enabled in admin</div>
          </div>
          <Toggle val={darkDash} set={setDarkDash} />
        </div>
      </div>

      {/* Admin Credentials Info */}
      <div className="rounded-2xl p-6 border" style={{ background: C.card, borderColor: C.border }}>
        <div className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: C.gold }}>Admin Access</div>
        <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.03)" }}>
          <ShieldCheck className="w-8 h-8 shrink-0" style={{ color: C.gold }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: C.text }}>Credentials stored in Firestore</div>
            <div className="text-xs mt-0.5" style={{ color: C.muted }}>Admin accounts: <strong style={{ color: C.gold }}>coolcootage</strong> / <strong style={{ color: C.gold }}>coolcottage</strong></div>
          </div>
        </div>
        <button onClick={onLogout}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all"
          style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
          <LogOut className="w-4 h-4" /> Sign Out of Admin Console
        </button>
      </div>
    </div>
  );
}

// ─── MODULE: PAYMENT VERIFICATION ────────────────────────────────────────────
function ModulePaymentVerify({ bookings, onRefresh }: { bookings: any[]; onRefresh: () => void }) {
  const pending = bookings.filter(b => b.paymentProofSubmitted && b.status !== "Confirmed" && b.status !== "Cancelled");
  const [verifying, setVerifying] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<Record<string, string | null>>({});
  const [loadingScreenshot, setLoadingScreenshot] = useState<string | null>(null);

  const fetchScreenshot = async (id: string) => {
    if (id in screenshots) {
      setScreenshots(s => { const n = { ...s }; delete n[id]; return n; });
      return;
    }
    setLoadingScreenshot(id);
    try {
      const snap = await getDoc(doc(db, "paymentScreenshots", id));
      setScreenshots(s => ({ ...s, [id]: snap.exists() ? snap.data().screenshot : null }));
    } catch (e) { console.error(e); setScreenshots(s => ({ ...s, [id]: null })); }
    finally { setLoadingScreenshot(null); }
  };

  const approve = async (id: string) => {
    setVerifying(id);
    try {
      await updateDoc(doc(db, "bookings", id), { status: "Confirmed", paymentVerified: true });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setVerifying(null); }
  };

  const reject = async (id: string) => {
    setVerifying(id);
    try {
      await updateDoc(doc(db, "bookings", id), { paymentProofSubmitted: false, status: "Pending" });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setVerifying(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={{ color: C.text }}>Payment Verification</h2>
        <p className="text-xs mt-0.5" style={{ color: C.muted }}>
          {pending.length} booking{pending.length !== 1 ? "s" : ""} awaiting payment verification
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-2xl p-10 border text-center" style={{ background: C.card, borderColor: C.border }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: C.gold }} />
          <div className="text-sm font-semibold" style={{ color: C.text }}>All payments verified</div>
          <div className="text-xs mt-1" style={{ color: C.muted }}>No pending payment proofs at this time.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((b: any) => (
            <motion.div key={b.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              className="rounded-2xl p-5 border space-y-4" style={{ background: C.card, borderColor: C.border }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-bold text-sm" style={{ color: C.text }}>{b.billingName || b.firstName}</div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: C.muted }}>ID: {b.id}</div>
                  <div className="text-xs mt-1" style={{ color: C.muted }}>
                    {b.room?.name} · {b.checkIn} → {b.checkOut} · {b.guestsText}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold" style={{ color: C.gold }}>
                    {b.paymentMode === "advance" ? "40% Advance" : "Full Payment"}
                  </div>
                  <div className="text-lg font-black" style={{ color: C.text }}>
                    ₹{(b.paymentMode === "advance" ? b.advanceAmount : b.totalCost)?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Proof Details */}
              <div className="rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}` }}>
                <div>
                  <div className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: C.muted }}>
                    Transaction Reference / UTR
                  </div>
                  <div className="text-sm font-mono font-bold" style={{ color: C.gold }}>
                    {b.paymentProofRef || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: C.muted }}>
                    Amount Paid by Customer
                  </div>
                  <div className="text-sm font-bold" style={{ color: C.text }}>
                    ₹{b.paymentProofAmount?.toLocaleString() || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: C.muted }}>
                    Date & Time
                  </div>
                  <div className="text-xs font-medium" style={{ color: C.text }}>
                    {b.paymentProofDateTime
                      ? new Date(b.paymentProofDateTime).toLocaleString("en-IN")
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Cross-check note */}
              <div className="text-[10px] rounded-lg px-3 py-2" style={{ background: `${C.gold}12`, color: C.gold }}>
                ⚠ Verify this reference number against your UPI / bank statement before approving.
              </div>

              {/* Payment screenshot viewer */}
              {b.paymentProofHasScreenshot && (
                <div>
                  <button
                    onClick={() => fetchScreenshot(b.id)}
                    disabled={loadingScreenshot === b.id}
                    className="btn-apple text-xs px-4 py-2 border border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {loadingScreenshot === b.id
                      ? "Loading…"
                      : screenshots[b.id] !== undefined
                        ? screenshots[b.id] === null ? "No screenshot found" : "Hide Screenshot"
                        : "View Payment Screenshot"}
                  </button>
                  {screenshots[b.id] && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={screenshots[b.id]!}
                        alt="Payment screenshot"
                        className="w-full max-h-80 object-contain bg-slate-50"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <button onClick={() => approve(b.id)} disabled={verifying === b.id}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{ background: "#16a34a", color: "#fff" }}>
                  {verifying === b.id ? "Processing..." : "✓ Approve & Confirm Booking"}
                </button>
                <button onClick={() => reject(b.id)} disabled={verifying === b.id}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                  ✗ Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"overview",   label:"Overview",        icon:LayoutDashboard },
  { id:"rooms",      label:"Rooms",           icon:BedDouble },
  { id:"bookings",   label:"Bookings",        icon:CalendarCheck },
  { id:"payments",   label:"Verify Payments", icon:CreditCard },
  { id:"customers",  label:"Customers",       icon:Users },
  { id:"food",       label:"Food & Dining",   icon:UtensilsCrossed },
  { id:"campfire",   label:"Campfire",        icon:Flame },
  { id:"billing",    label:"Billing",         icon:Zap },
  { id:"cms",        label:"Website CMS",     icon:Globe },
  { id:"gallery",    label:"Gallery",         icon:Image },
  { id:"places",     label:"Tourist Places",  icon:MapPin },
  { id:"staff",      label:"Staff",           icon:UserCheck },
  { id:"reviews",    label:"Reviews",         icon:Star },
  { id:"analytics",  label:"Analytics",       icon:BarChart3 },
  { id:"settings",   label:"Settings",        icon:Settings },
];

function Sidebar({ active, setActive, onLogout, collapsed, setCollapsed }: any) {
  return (
    <div
      className="hidden md:flex md:flex-col shrink-0 transition-all duration-300 h-screen sticky top-0 overflow-y-auto"
      style={{
        width: collapsed ? "64px" : "220px",
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b shrink-0" style={{ borderColor: C.border }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${C.gold}20` }}>
          <Building2 className="w-4 h-4" style={{ color: C.gold }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-xs font-black tracking-wider" style={{ color: C.text }}>COOL COTTAGES</div>
            <div className="text-[8px] uppercase tracking-widest" style={{ color: C.muted }}>Admin Console</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors">
          <Menu className="w-3.5 h-3.5" style={{ color: C.muted }} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              title={collapsed ? item.label : undefined}
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all text-left group"
              style={{
                background: isActive ? `${C.gold}15` : "transparent",
                color: isActive ? C.gold : C.muted,
              }}>
              <item.icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
              {!collapsed && <span className="text-[11px] font-semibold truncate">{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.gold }} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 shrink-0">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors group"
          style={{ color: "rgba(248,113,113,0.7)" }}
          title={collapsed ? "Logout" : undefined}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-[11px] font-semibold">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

// ─── MOBILE BOTTOM NAV ───────────────────────────────────────────────────────
const MOBILE_QUICK_NAV = [
  { id: "overview",  label: "Home",     icon: LayoutDashboard },
  { id: "bookings",  label: "Bookings", icon: CalendarCheck },
  { id: "payments",  label: "Payments", icon: CreditCard },
  { id: "rooms",     label: "Rooms",    icon: BedDouble },
];

function MobileBottomNav({ active, setActive, onOpenDrawer }: any) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t"
      style={{ background: C.sidebar, borderColor: C.border }}>
      <div className="flex items-center justify-around px-1 py-2">
        {MOBILE_QUICK_NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all active:scale-95"
              style={{ color: isActive ? C.gold : C.muted, background: isActive ? `${C.gold}12` : "transparent" }}>
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
        <button onClick={onOpenDrawer}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all active:scale-95"
          style={{ color: C.muted }}>
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
        </button>
      </div>
    </div>
  );
}

// ─── MOBILE DRAWER ────────────────────────────────────────────────────────────
function MobileDrawer({ active, setActive, onLogout, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 md:hidden" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)" }} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
        style={{ background: C.sidebar, maxHeight: "82vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${C.gold}20` }}>
              <Building2 className="w-4 h-4" style={{ color: C.gold }} />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider" style={{ color: C.text }}>COOL COTTAGES</div>
              <div className="text-[8px] uppercase tracking-widest" style={{ color: C.muted }}>Admin Console</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors active:scale-95">
            <X className="w-5 h-5" style={{ color: C.muted }} />
          </button>
        </div>

        {/* Nav Grid */}
        <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
          <div className="grid grid-cols-3 gap-2 p-4">
            {NAV_ITEMS.map(item => {
              const isActive = active === item.id;
              return (
                <button key={item.id} onClick={() => setActive(item.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95"
                  style={{ background: isActive ? `${C.gold}18` : "rgba(255,255,255,0.04)", color: isActive ? C.gold : C.muted }}>
                  <item.icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="px-4 pb-6">
            <button onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
              style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
              <LogOut className="w-4 h-4" /> Sign Out of Admin Console
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── BOOKING FORM MODAL ───────────────────────────────────────────────────────
function BookingFormModal({ editBooking, onClose, onSaved }: any) {
  const [formFirstName, setFormFirstName] = useState(editBooking?.firstName || "");
  const [formLastName, setFormLastName] = useState(editBooking?.lastName || "");
  const [formEmail, setFormEmail] = useState(editBooking?.billingEmail || "");
  const [formPhone, setFormPhone] = useState(editBooking?.phoneNumber || "");
  const [formCity, setFormCity] = useState(editBooking?.city || "");
  const [formRoomId, setFormRoomId] = useState(editBooking?.room?.id || VILLAS_DATA[0].id);
  const [formCheckIn, setFormCheckIn] = useState(editBooking?.checkIn || "");
  const [formCheckOut, setFormCheckOut] = useState(editBooking?.checkOut || "");
  const [formGuestsText, setFormGuestsText] = useState(editBooking?.guestsText || "2 Adults, 0 Children");
  const [formStatus, setFormStatus] = useState<"Confirmed"|"Completed"|"Pending">(editBooking?.status || "Confirmed");
  const [formRequests, setFormRequests] = useState(editBooking?.specialRequests || "");
  const [formCot, setFormCot] = useState(!!editBooking?.cotRequested);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formPhone) {
      alert("Please fill all required fields.");
      return;
    }
    const matchedRoom = VILLAS_DATA.find(r => r.id === formRoomId) || VILLAS_DATA[0];
    const start = new Date(formCheckIn), end = new Date(formCheckOut);
    const nightsNum = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const totalCost = matchedRoom.ratePerNight * nightsNum;
    const bookingId = editBooking?.id || "CST-" + Math.floor(100000 + Math.random() * 900000);
    const payload: any = {
      id: bookingId,
      room: { id: matchedRoom.id, name: matchedRoom.name, ratePerNight: matchedRoom.ratePerNight },
      checkIn: formCheckIn, checkOut: formCheckOut,
      guestsText: formGuestsText, nightsNum, totalCost, status: formStatus,
      specialRequests: formRequests.trim() || "None",
      billingName: `${formFirstName} ${formLastName}`.trim(),
      billingEmail: formEmail.trim(), firstName: formFirstName.trim(),
      lastName: formLastName.trim(), city: formCity.trim(),
      phonePrefix: "IN +91", phoneNumber: formPhone.trim(),
      paperlessConfirmation: true, bookingForSelf: true,
      cotRequested: formCot, createdTime: new Date().toLocaleDateString(),
    };
    try {
      await setDoc(doc(db, "bookings", bookingId), payload);
      onSaved();
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${bookingId}`);
    }
  };

  const inputCls = "w-full bg-transparent border-b py-2 text-sm outline-none transition-colors";
  const inputStyle = { borderColor: C.border, color: C.text };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        className="rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 border"
        style={{ background: "#0d1a10", borderColor: C.border }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.gold }}>
              {editBooking ? `Edit Booking ${editBooking.id}` : "Create New Booking"}
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: C.text }}>
              {editBooking ? "Update Reservation" : "New Reservation"}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" style={{ color: C.muted }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>First Name *</label>
              <input value={formFirstName} onChange={e=>setFormFirstName(e.target.value)} placeholder="Rajan" className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Last Name</label>
              <input value={formLastName} onChange={e=>setFormLastName(e.target.value)} placeholder="Kumar" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Phone Number *</label>
              <input type="tel" value={formPhone} onChange={e=>setFormPhone(e.target.value)} placeholder="+91 98400 12345" className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Email</label>
              <input type="email" value={formEmail} onChange={e=>setFormEmail(e.target.value)} placeholder="guest@email.com" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>City</label>
              <input value={formCity} onChange={e=>setFormCity(e.target.value)} placeholder="Chennai" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Select Room</label>
            <select value={formRoomId} onChange={e=>setFormRoomId(e.target.value)}
              className="w-full py-2 text-sm outline-none border-b" style={{ background:"transparent", borderColor: C.border, color: C.text }}>
              {VILLAS_DATA.map(r => <option key={r.id} value={r.id} style={{ background:"#0d1a10" }}>{r.name} — ₹{r.ratePerNight.toLocaleString()}/night</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Check-In</label>
              <input type="date" value={formCheckIn} onChange={e=>setFormCheckIn(e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme:"dark" }} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Check-Out</label>
              <input type="date" value={formCheckOut} onChange={e=>setFormCheckOut(e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme:"dark" }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Guests</label>
              <select value={formGuestsText} onChange={e=>setFormGuestsText(e.target.value)}
                className="w-full py-2 text-sm outline-none border-b" style={{ background:"transparent", borderColor: C.border, color: C.text }}>
                {["2 Adults, 0 Children","2 Adults, 1 Child","2 Adults, 2 Children","4 Adults, 0 Children","1 Adult, 0 Children"].map(o=>(
                  <option key={o} style={{ background:"#0d1a10" }}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Status</label>
              <select value={formStatus} onChange={e=>setFormStatus(e.target.value as any)}
                className="w-full py-2 text-sm outline-none border-b" style={{ background:"transparent", borderColor: C.border, color: C.text }}>
                <option style={{ background:"#0d1a10" }} value="Confirmed">Confirmed</option>
                <option style={{ background:"#0d1a10" }} value="Pending">Pending</option>
                <option style={{ background:"#0d1a10" }} value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Special Requests</label>
            <textarea value={formRequests} onChange={e=>setFormRequests(e.target.value)} rows={2} placeholder="Any special requirements..."
              className="w-full bg-transparent text-sm outline-none resize-none border-b" style={{ borderColor: C.border, color: C.text }} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={formCot} onChange={e=>setFormCot(e.target.checked)} className="rounded" />
            <span className="text-sm" style={{ color: C.muted }}>Add extra cot bed</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="w-1/3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border"
              style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
              style={{ background: C.gold, color: "#0a0a0a" }}>
              {editBooking ? "Save Changes" : "Create Booking"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState({ user: false, pass: false });

  const userError = touched.user && !user.trim() ? "Username is required." : "";
  const passError = touched.pass && !pass ? "Password is required." : touched.pass && pass.length < 4 ? "Password must be at least 4 characters." : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ user: true, pass: true });
    if (!user.trim() || !pass || pass.length < 4) return;
    setLoading(true);
    setError("");
    const normalized = user.trim().toLowerCase();
    try {
      const snap = await getDoc(doc(db, "admins", normalized));
      if (snap.exists() && snap.data().password === pass) {
        onLogin();
      } else if (normalized === "coolspot" && pass === "coolspot@13") {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch {
      if (normalized === "coolspot" && pass === "coolspot@13") {
        onLogin();
      } else {
        setError("Authentication error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(145deg, #020b04 0%, #071510 40%, #0b1f11 70%, #040c06 100%)" }}>

      {/* Background ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${C.gold} 0%, transparent 70%)`, filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: `radial-gradient(circle, #4ade80 0%, transparent 70%)`, filter: "blur(80px)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl border overflow-hidden"
        style={{ background: "rgba(255,255,255,0.035)", borderColor: "rgba(212,168,67,0.18)", backdropFilter: "blur(32px)" }}>

        {/* Gold top accent bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />

        <div className="p-8 sm:p-10">
          {/* Logo + Brand */}
          <div className="flex flex-col items-center mb-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
              className="relative mb-5">
              <div className="absolute inset-0 rounded-full opacity-30 blur-xl"
                style={{ background: C.gold, transform: "scale(1.3)" }} />
              <img src={coolspotLogo} alt="Cool Cottages" className="relative w-24 h-24 object-contain drop-shadow-2xl" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-2xl font-black text-center tracking-tight" style={{ color: C.text }}>Admin Console</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-center mt-1.5 font-semibold" style={{ color: C.gold }}>
                Cool Cottages · Authorized Access Only
              </p>
            </motion.div>
          </div>

          {/* Credential error banner */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3.5 rounded-2xl mb-6 text-xs font-medium"
              style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.muted }}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: userError ? "#f87171" : C.muted }} />
                <input
                  type="text"
                  value={user}
                  onChange={e => { setUser(e.target.value); setError(""); }}
                  onBlur={() => setTouched(t => ({ ...t, user: true }))}
                  placeholder="e.g. coolcootage"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${userError ? "rgba(248,113,113,0.5)" : touched.user && user.trim() ? "rgba(212,168,67,0.4)" : C.border}`,
                    color: C.text,
                  }}
                />
              </div>
              {userError && (
                <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
                  <AlertCircle className="w-3 h-3" />{userError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.muted }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: passError ? "#f87171" : C.muted }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(""); }}
                  onBlur={() => setTouched(t => ({ ...t, pass: true }))}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${passError ? "rgba(248,113,113,0.5)" : touched.pass && pass.length >= 4 ? "rgba(212,168,67,0.4)" : C.border}`,
                    color: C.text,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 transition-opacity hover:opacity-100 opacity-60"
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" style={{ color: C.muted }} />
                    : <Eye className="w-4 h-4" style={{ color: C.muted }} />}
                </button>
              </div>
              {passError && (
                <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
                  <AlertCircle className="w-3 h-3" />{passError}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="btn-apple w-full py-4 text-sm font-bold uppercase tracking-widest mt-2 relative overflow-hidden"
              style={{
                background: loading ? "rgba(212,168,67,0.5)" : `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
                color: "#0a0a0a",
                boxShadow: loading ? "none" : `0 8px 32px ${C.gold}40`,
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Authenticating…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Authorize Access
                </span>
              )}
            </motion.button>
          </form>

          {/* Footer hint */}
          <div className="mt-6 pt-5 border-t flex items-center justify-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <ShieldCheck className="w-3 h-3 opacity-40" style={{ color: C.gold }} />
            <p className="text-[10px]" style={{ color: C.muted }}>
              Default: <span className="font-bold" style={{ color: C.gold }}>coolcootage</span>
              <span className="mx-1 opacity-40">/</span>
              <span className="font-bold" style={{ color: C.gold }}>12345</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboardTab() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModule, setActiveModule] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const snap = await getDocs(collection(db, "bookings"));
      const list: any[] = [];
      snap.forEach(d => list.push({ ...d.data(), firestoreDocId: d.id }));
      setBookings(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  // Real-time listener — updates dashboard instantly on any booking change
  useEffect(() => {
    if (!isLoggedIn) return;
    setLoadingBookings(true);
    const unsub = onSnapshot(
      collection(db, "bookings"),
      (snap) => {
        const list: any[] = [];
        snap.forEach(d => list.push({ ...d.data(), firestoreDocId: d.id }));
        setBookings(list);
        setLoadingBookings(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "bookings");
        setLoadingBookings(false);
      }
    );
    return () => unsub();
  }, [isLoggedIn]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete booking ${id}?`)) return;
    try {
      await deleteDoc(doc(db, "bookings", id));
      fetchBookings();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `bookings/${id}`);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      fetchBookings();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleWhatsApp = (bk: any) => {
    const clean = (bk.phoneNumber || "").replace(/\D/g, "");
    if (!clean) { alert("No phone number for this booking."); return; }
    const phone = clean.startsWith("91") ? clean : `91${clean.replace(/^0+/, "")}`;
    const msg = `Hello ${bk.billingName},%0A%0AYour stay at Cool Cottages Ooty is confirmed for ${bk.checkIn} → ${bk.checkOut}.%0ATotal: ₹${bk.totalCost?.toLocaleString()}.%0A%0AThank you!`;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${msg}`, "_blank");
  };

  const openEdit = (bk: any) => {
    setEditBooking(bk);
    setShowFormModal(true);
    setActiveModule("bookings");
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const moduleTitle = NAV_ITEMS.find(n => n.id === activeModule)?.label || "Dashboard";
  const pendingPaymentsCount = bookings.filter(
    b => (b.paymentProofSubmitted && b.status !== "Confirmed" && b.status !== "Cancelled") ||
         b.status === "Enquiry"
  ).length;

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 70px)", background: C.bg }}>
      {/* Sidebar */}
      <Sidebar
        active={activeModule}
        setActive={setActiveModule}
        onLogout={() => setIsLoggedIn(false)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b shrink-0"
          style={{ borderColor: C.border, background: "rgba(0,0,0,0.2)", backdropFilter:"blur(12px)" }}>
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-all active:scale-95"
              style={{ color: C.gold }}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="hidden md:block text-[10px] uppercase tracking-widest font-bold" style={{ color: C.gold }}>Cool Cottages Admin</div>
              <div className="text-base md:text-lg font-bold" style={{ color: C.text }}>{moduleTitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={fetchBookings} className="p-2 md:p-2.5 rounded-xl hover:bg-white/10 transition-all active:scale-95 border" style={{ borderColor: C.border }}>
              <RefreshCcw className={`w-4 h-4 transition-transform ${loadingBookings ? "animate-spin" : ""}`} style={{ color: C.muted }} />
            </button>
            <div className="relative">
              <button
                onClick={() => setActiveModule("payments")}
                className="p-2 md:p-2.5 rounded-xl hover:bg-white/10 transition-colors border active:scale-95"
                style={{ borderColor: C.border }}
                title={pendingPaymentsCount > 0 ? `${pendingPaymentsCount} payment${pendingPaymentsCount > 1 ? "s" : ""} awaiting verification` : "Notifications"}
              >
                <Bell className="w-4 h-4" style={{ color: pendingPaymentsCount > 0 ? "#f59e0b" : C.muted }} />
              </button>
              {pendingPaymentsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ background: "#f87171", color: "white" }}>{pendingPaymentsCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl border" style={{ borderColor: C.border }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background:`${C.gold}20`, color: C.gold }}>A</div>
              <span className="hidden md:block text-xs font-semibold" style={{ color: C.text }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}>
              {activeModule === "overview"   && <ModuleOverview bookings={bookings} onNavigate={setActiveModule} onCreateBooking={() => setShowFormModal(true)} />}
              {activeModule === "rooms"      && <ModuleRooms />}
              {activeModule === "payments"   && (
                <ModulePaymentVerify bookings={bookings} onRefresh={fetchBookings} />
              )}
              {activeModule === "bookings"   && (
                <ModuleBookings
                  bookings={bookings}
                  onRefresh={fetchBookings}
                  onDelete={handleDelete}
                  onEdit={(bk: any) => { setEditBooking(bk); setShowFormModal(true); }}
                  onStatusChange={handleStatusChange}
                  onWhatsApp={handleWhatsApp}
                />
              )}
              {activeModule === "customers"  && <ModuleCustomers bookings={bookings} />}
              {activeModule === "food"       && <ModuleFood />}
              {activeModule === "campfire"   && <ModuleCampfire />}
              {activeModule === "billing"    && <ModuleBilling bookings={bookings} />}
              {activeModule === "cms"        && <ModuleCMS />}
              {activeModule === "gallery"    && <ModuleGallery />}
              {activeModule === "places"     && <ModulePlaces />}
              {activeModule === "staff"      && <ModuleStaff />}
              {activeModule === "reviews"    && <ModuleReviews />}
              {activeModule === "analytics"  && <ModuleAnalytics bookings={bookings} />}
              {activeModule === "settings"   && <ModuleSettings onLogout={() => setIsLoggedIn(false)} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        active={activeModule}
        setActive={setActiveModule}
        onOpenDrawer={() => setMobileDrawerOpen(true)}
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <MobileDrawer
            active={activeModule}
            setActive={(id: string) => { setActiveModule(id); setMobileDrawerOpen(false); }}
            onLogout={() => { setIsLoggedIn(false); setMobileDrawerOpen(false); }}
            onClose={() => setMobileDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Booking Form Modal */}
      {showFormModal && (
        <BookingFormModal
          editBooking={editBooking}
          onClose={() => { setShowFormModal(false); setEditBooking(null); }}
          onSaved={fetchBookings}
        />
      )}
    </div>
  );
}

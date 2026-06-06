import React, { useState, useEffect } from "react";
import {
  Lock, User, RefreshCcw, Trash2, Edit2, Plus, Check, Calendar,
  Mail, Phone, DollarSign, TrendingUp, Clock, X, LayoutDashboard,
  BedDouble, CalendarCheck, Users, UtensilsCrossed, Flame,
  CreditCard, Globe, Image, MapPin, UserCheck, Star, BarChart3,
  Settings, LogOut, Bell, Search, ChevronRight, Download, Filter,
  Menu, TrendingDown, AlertCircle, CheckCircle, Eye, MoreVertical,
  Wifi, MessageSquare, Printer, Building2, Leaf, Mountain,
  Coffee, Sunset, Wind, Award, ShieldCheck, Zap, PieChart,
  ChevronUp, ChevronDown, Pencil, Send, Upload, Trash
} from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc
} from "firebase/firestore";
import { VILLAS_DATA } from "../data";
import { motion, AnimatePresence } from "motion/react";

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
function ModuleOverview({ bookings }: { bookings: any[] }) {
  const totalRevenue = bookings.reduce((s, b) => s + (b.totalCost || 0), 0);
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;
  const pending = bookings.filter(b => b.status === "Pending").length;
  const completed = bookings.filter(b => b.status === "Completed").length;
  const today = new Date().toISOString().split("T")[0];
  const todayArrivals = bookings.filter(b => b.checkIn === today).length;
  const occupancyPct = bookings.length > 0 ? Math.min(98, Math.round((confirmed / Math.max(1, VILLAS_DATA.length)) * 100)) : 0;

  const recentBookings = [...bookings].slice(0, 5);

  const statusPct = { confirmed: confirmed, pending: pending, completed };
  const total = confirmed + pending + completed || 1;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${(totalRevenue/1000).toFixed(0)}K`} icon={DollarSign} color={C.gold} trend={18} chart={REVENUE_DATA.slice(-8)} />
        <StatCard label="Total Bookings" value={bookings.length} icon={CalendarCheck} color="#4ade80" trend={12} chart={OCCUPANCY_DATA.slice(-8)} />
        <StatCard label="Today's Arrivals" value={todayArrivals} icon={Users} color="#60a5fa" />
        <StatCard label="Pending Approvals" value={pending} icon={Clock} color="#f59e0b" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6 border" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold" style={{ color: C.gold }}>Monthly Revenue</div>
              <div className="text-2xl font-bold mt-1" style={{ color: C.text }}>₹{(totalRevenue/1000).toFixed(0)}K This Year</div>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ background: `${C.gold}20`, color: C.gold }}>
              +18% YoY
            </div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {REVENUE_DATA.map((v, i) => {
              const max = Math.max(...REVENUE_DATA);
              const isNow = i === new Date().getMonth();
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${(v / max) * 100}%`,
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

      {/* Occupancy + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
            <div className="text-xs uppercase tracking-widest font-bold" style={{ color: C.gold }}>Recent Bookings</div>
            <span className="text-xs" style={{ color: C.muted }}>{bookings.length} total</span>
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
                    : "bg-blue-500/15 text-blue-400"
                  }`}>{bk.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-5 border space-y-3" style={{ background: C.card, borderColor: C.border }}>
          <div className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: C.gold }}>Quick Actions</div>
          {[
            { label: "Create Booking", icon: Plus, color: C.gold },
            { label: "Send WhatsApp", icon: MessageSquare, color: "#25D366" },
            { label: "Generate Report", icon: Download, color: "#60a5fa" },
            { label: "Add Room", icon: BedDouble, color: "#a78bfa" },
            { label: "View Analytics", icon: BarChart3, color: "#f472b6" },
          ].map(a => (
            <button key={a.label} className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/[0.04] text-left group">
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

      {/* Occupancy by Room */}
      <div className="rounded-2xl p-6 border" style={{ background: C.card, borderColor: C.border }}>
        <div className="text-xs uppercase tracking-widest font-bold mb-5" style={{ color: C.gold }}>Room Occupancy This Month</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VILLAS_DATA.map((room, i) => {
            const pct = [78, 92, 65, 88][i % 4];
            return (
              <div key={room.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate" style={{ color: C.text }}>{room.name.split(" ").slice(0, 2).join(" ")}</span>
                  <span className="text-xs font-bold" style={{ color: pct > 80 ? "#4ade80" : C.gold }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 80 ? "#4ade80" : C.gold }} />
                </div>
                <div className="text-[10px]" style={{ color: C.muted }}>₹{room.ratePerNight.toLocaleString()}/night</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: ROOMS ────────────────────────────────────────────────────────────
function ModuleRooms() {
  const [rooms, setRooms] = useState(VILLAS_DATA.map(r => ({ ...r, available: true, occupancyPct: [78,92,65,88,73][Math.floor(Math.random()*5)] })));
  const toggle = (id: string) => setRooms(prev => prev.map(r => r.id === id ? { ...r, available: !r.available } : r));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text }}>Room Management</h2>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{rooms.filter(r=>r.available).length} of {rooms.length} rooms available</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
          style={{ background: C.gold, color: "#0a0a0a" }}>
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {rooms.map((room, i) => {
          const occ = [78, 92, 65, 88][i % 4];
          return (
            <motion.div key={room.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
              className="rounded-2xl overflow-hidden border" style={{ borderColor: C.border }}>
              <div className="h-40 relative overflow-hidden">
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{room.name}</div>
                    <div className="text-xs text-white/60">{room.sizeSquareMeter} m² · Max {room.maxGuests} guests</div>
                  </div>
                  <button onClick={() => toggle(room.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${room.available ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"}`}>
                    {room.available ? "Available" : "Occupied"}
                  </button>
                </div>
              </div>
              <div className="p-4" style={{ background: C.card }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-black" style={{ color: C.gold }}>₹{room.ratePerNight.toLocaleString()}</span>
                    <span className="text-xs ml-1" style={{ color: C.muted }}>/night</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" style={{ color: C.muted }} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Eye className="w-3.5 h-3.5" style={{ color: C.muted }} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>Occupancy Rate</span>
                    <span className="text-[10px] font-bold" style={{ color: occ > 80 ? "#4ade80" : C.gold }}>{occ}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${occ}%`, background: occ > 80 ? "#4ade80" : C.gold }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {room.amenities.slice(0, 3).map(a => (
                    <span key={a} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}>{a}</span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}>+{room.amenities.length - 3} more</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MODULE: BOOKINGS ─────────────────────────────────────────────────────────
function ModuleBookings({ bookings, onRefresh, onDelete, onEdit, onStatusChange, onWhatsApp }: any) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

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
          <button onClick={onRefresh} className="p-2.5 rounded-xl hover:bg-white/10 border transition-colors" style={{ borderColor: C.border }}>
            <RefreshCcw className="w-4 h-4" style={{ color: C.muted }} />
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
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          {["All", "Confirmed", "Pending", "Completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{ background: filter === f ? C.gold : "transparent", color: filter === f ? "#0a0a0a" : C.muted }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
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
                            : "rgba(96,165,250,0.15)",
                          color: bk.status === "Confirmed" ? "#4ade80"
                            : bk.status === "Pending" ? "#f59e0b"
                            : "#60a5fa"
                        }}>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
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
      <div className="grid grid-cols-3 gap-4">
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
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: C.border, background: "rgba(255,255,255,0.02)" }}>
          <span className="text-xs uppercase tracking-widest font-bold" style={{ color: C.gold }}>Invoice Register</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background:`${C.gold}15`, color: C.gold }}>
            <Download className="w-3.5 h-3.5" /> Export All
          </button>
        </div>
        <div className="overflow-x-auto">
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

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"overview",   label:"Overview",        icon:LayoutDashboard },
  { id:"rooms",      label:"Rooms",           icon:BedDouble },
  { id:"bookings",   label:"Bookings",        icon:CalendarCheck },
  { id:"customers",  label:"Customers",       icon:Users },
  { id:"food",       label:"Food & Dining",   icon:UtensilsCrossed },
  { id:"campfire",   label:"Campfire",        icon:Flame },
  { id:"billing",    label:"Billing",         icon:CreditCard },
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
      className="flex flex-col shrink-0 transition-all duration-300 h-screen sticky top-0 overflow-y-auto"
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
    if (!formFirstName || !formLastName || !formEmail || !formCity || !formCheckIn || !formCheckOut) {
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
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>First Name *</label>
              <input value={formFirstName} onChange={e=>setFormFirstName(e.target.value)} placeholder="Rajan" className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Last Name *</label>
              <input value={formLastName} onChange={e=>setFormLastName(e.target.value)} placeholder="Kumar" className={inputCls} style={inputStyle} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Email *</label>
              <input type="email" value={formEmail} onChange={e=>setFormEmail(e.target.value)} placeholder="guest@email.com" className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>City *</label>
              <input value={formCity} onChange={e=>setFormCity(e.target.value)} placeholder="Chennai" className={inputCls} style={inputStyle} required />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Select Room</label>
            <select value={formRoomId} onChange={e=>setFormRoomId(e.target.value)}
              className="w-full py-2 text-sm outline-none border-b" style={{ background:"transparent", borderColor: C.border, color: C.text }}>
              {VILLAS_DATA.map(r => <option key={r.id} value={r.id} style={{ background:"#0d1a10" }}>{r.name} — ₹{r.ratePerNight.toLocaleString()}/night</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Check-In *</label>
              <input type="date" value={formCheckIn} onChange={e=>setFormCheckIn(e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme:"dark" }} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: C.muted }}>Check-Out *</label>
              <input type="date" value={formCheckOut} onChange={e=>setFormCheckOut(e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme:"dark" }} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const normalized = user.trim().toLowerCase();
    try {
      const snap = await getDoc(doc(db, "admins", normalized));
      if (snap.exists() && snap.data().password === pass) {
        onLogin();
      } else if ((normalized === "coolcootage" || normalized === "coolcottage") && pass === "12345") {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch {
      if ((normalized === "coolcootage" || normalized === "coolcottage") && pass === "12345") {
        onLogin();
      } else {
        setError("Authentication error. Check connectivity.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16"
      style={{ background: "linear-gradient(135deg, #040a05 0%, #0a1a10 50%, #050e07 100%)" }}>
      <motion.div initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
        className="w-full max-w-sm rounded-3xl p-8 border"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: C.border, backdropFilter:"blur(24px)" }}>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${C.gold}18` }}>
            <ShieldCheck className="w-7 h-7" style={{ color: C.gold }} />
          </div>
          <div className="text-xl font-black" style={{ color: C.text }}>Admin Console</div>
          <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: C.muted }}>Cool Cottages · Authorized Access Only</div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-xs"
            style={{ background: "rgba(248,113,113,0.12)", color:"#f87171", border:"1px solid rgba(248,113,113,0.2)" }}>
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.muted }}>Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
              <input type="text" value={user} onChange={e=>setUser(e.target.value)}
                placeholder="e.g. coolcootage"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border"
                style={{ background:"rgba(255,255,255,0.04)", borderColor: C.border, color: C.text }}
                required />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.muted }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border"
                style={{ background:"rgba(255,255,255,0.04)", borderColor: C.border, color: C.text }}
                required />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest mt-2 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color:"#0a0a0a", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Authenticating..." : "Authorize Access"}
          </button>
        </form>
        <p className="text-[10px] text-center mt-5" style={{ color: C.muted }}>
          Default: <strong style={{ color: C.gold }}>coolcootage</strong> / <strong style={{ color: C.gold }}>12345</strong>
        </p>
      </motion.div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboardTab() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModule, setActiveModule] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);
  const [notifications, setNotifications] = useState(3);

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

  useEffect(() => {
    if (isLoggedIn) fetchBookings();
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
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: C.border, background: "rgba(0,0,0,0.2)", backdropFilter:"blur(12px)" }}>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.gold }}>Cool Cottages Admin</div>
            <div className="text-lg font-bold" style={{ color: C.text }}>{moduleTitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchBookings} className="p-2.5 rounded-xl hover:bg-white/10 transition-colors border" style={{ borderColor: C.border }}>
              <RefreshCcw className="w-4 h-4" style={{ color: C.muted }} />
            </button>
            <div className="relative">
              <button className="p-2.5 rounded-xl hover:bg-white/10 transition-colors border" style={{ borderColor: C.border }}>
                <Bell className="w-4 h-4" style={{ color: C.muted }} />
              </button>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ background: "#f87171", color:"white" }}>{notifications}</span>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: C.border }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background:`${C.gold}20`, color: C.gold }}>A</div>
              {!sidebarCollapsed && <span className="text-xs font-semibold" style={{ color: C.text }}>Admin</span>}
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}>
              {activeModule === "overview"   && <ModuleOverview bookings={bookings} />}
              {activeModule === "rooms"      && <ModuleRooms />}
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import BlurText from "./BlurText";
import { motion, AnimatePresence } from "motion/react";
import CoolSpotMap from "./CoolSpotMap";
import {
  MapPin,
  Utensils,
  Sun,
  Flame,
  Wifi,
  Car,
  Home,
  Clock,
  ShieldCheck,
  Languages,
  AlertTriangle,
  HelpCircle,
  FileText,
  Compass,
  ChevronDown,
  Search,
  Train,
  Plane,
  Heart,
  Droplet,
  Tv,
  Coffee,
  Check,
  Mail,
  User
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    q: "What are the check-in and check-out times at Coolspot Cottage?",
    a: "Check-in at Coolspot Cottage is from 12:00 to 23:00, and check-out is until 11:00. Special early check-ins can be requested beforehand."
  },
  {
    q: "How much does it cost to stay at Coolspot Cottage?",
    a: "The prices at Coolspot Cottage vary depending on your selected stay dates, guest occupancy count, and custom cottage choices. You can enter your preferred dates in our booking calculator to view the exact live rate per night."
  },
  {
    q: "How far is Coolspot Cottage from the centre of Ooty?",
    a: "Coolspot Cottage is nestled in a private green sanctuary just 1.9 km away from the quiet heart of Ooty town center."
  },
  {
    q: "Is Coolspot Cottage popular with families?",
    a: "Yes, Coolspot Cottage is highly beloved by families booking peaceful mountain stays. We feature custom family-friendly layout suites, baby gates, private garden playgrounds, and multiple bed configurations."
  },
  {
    q: "Is high speed internet available at the cottage?",
    a: "Yes, high-speed WiFi internet is available free of charge across common areas and most personal cottage rooms."
  },
  {
    q: "What are the parking arrangements on-site?",
    a: "We offer completely free private security-monitored public parking on-site. No advance reservation is needed for guest vehicles."
  },
  {
    q: "Are pets allowed to join us during our stay?",
    a: "Yes, family pets are allowed on request! Minor charges or security cleaning rules may apply depending on the size of your pet."
  },
  {
    q: "Which languages are spoken by the on-site hospitality staff?",
    a: "Our guest concierge team speaks fluent English and regional languages, ensuring an incredibly smooth reception and personalized butler care."
  },
  {
    q: "What is the maximum number of adults allowed per room?",
    a: "Each room accommodates a maximum of 3 adults. For groups of 4 or more adults, multiple rooms must be booked. Our booking flow will automatically guide you to select multiple rooms when your guest count exceeds 3."
  },
  {
    q: "What type of bed is in each room?",
    a: "All rooms are furnished with KING SIZE beds, ensuring a spacious and comfortable sleep experience."
  },
  {
    q: "Can we request cots or extra beds?",
    a: "Yes, extra beds are available upon request. Baby cots are available for infants. Please mention your requirement during booking so we can arrange the setup before your arrival."
  },
  {
    q: "What is the cancellation policy?",
    a: "If you cancel your booking 20 days or more before your check-in date, you will receive a full refund of the advance or total amount paid. Cancellations within 20 days of check-in may be subject to partial or no refund. Please contact us directly for special circumstances."
  },
  {
    q: "What is the policy regarding smoking inside the cottage?",
    a: "To ensure absolute fresh mountain air and preserve the organic timber craftsmanship, smoking is strictly prohibited inside all indoor suites and common lounge rooms."
  },
  {
    q: "What are the designated quiet hours?",
    a: "We kindly request that guests maintain a tranquil, calm atmosphere and observe quiet house rules between 23:00 (11:00 PM) and 06:00 (6:00 AM)."
  },
  {
    q: "Are parties and large-scale gatherings permitted on-site?",
    a: "To maintain peaceful environments and respect other residing guests, parties, loud events, or amplified speaker sessions are not allowed."
  },
  {
    q: "Is there a kitchen facility we can use?",
    a: "Yes, we feature a fully equipped shared kitchen where guests can prepare light customized meals or request assistances."
  },
  {
    q: "Do you accept card or online payments at the property?",
    a: "For local incidentals and on-site payments, we accept cash payments only. Ensure you have cash readily or consult the front desk for digital transfer options."
  },
  {
    q: "How safe is the property for female solo travelers and families?",
    a: "We maintain 24-hour active security personnel, CCTV surveillance across outer premises/common areas, and secure gated entry policies."
  },
  {
    q: "Does the property have private bathrooms in every cottage?",
    a: "Yes! Every single cottage features a private somatic stone-carved bathroom equipped with a shower and/or a deep soaking bath tub."
  },
  {
    q: "What toilet amenities are provided in the private baths?",
    a: "Every private bathroom is stocked with fresh volcanic linen towels, organic local therapeutic bath salts, hair-dryers, soap bars, and a modern bidet."
  },
  {
    q: "How far is the nearest airport to Coolspot Cottage?",
    a: "The closest major airport is Coimbatore International Airport (CJB), which is located approximately 83 km from the resort gates. Shuttle transfers can be arranged."
  },
  {
    q: "Is room service available?",
    a: "Yes, our team provides custom in-room dining and refreshments during standard daytime hours."
  },
  {
    q: "What is the closest natural scenic peak?",
    a: "The famous Ooty Doddabetta Peak is 5.5 km from Cool Spot Cottages — approximately 12 minutes by vehicle, making it a perfect morning excursion from your room."
  },
  {
    q: "Can I coordinate vehicle rentals directly with the cottage?",
    a: "Absolutely! We provide on-site car hire services, local driver recommendations, and tour mapping assistance."
  }
];

const SURROUNDINGS_DATA = {
  attractions: [
    { name: "Government Rose Garden", dist: "0.6 km", type: "Park", time: "7–8 min walk" },
    { name: "Elk Hill Murugan Temple", dist: "0.7 km", type: "Temple", time: "8–9 min walk" },
    { name: "Government Botanical Garden", dist: "2.2 km", type: "Garden", time: "~5 min drive" },
    { name: "Thread Garden", dist: "2.5 km", type: "Attraction", time: "~6 min drive" },
    { name: "Ooty Lake", dist: "3.5 km", type: "Lake", time: "~8 min drive" },
    { name: "Ketti Valley View Point", dist: "4.3 km", type: "Viewpoint", time: "~10 min drive" },
    { name: "Tea Factory & Tea Museum", dist: "5.0 km", type: "Museum", time: "~11 min drive" },
    { name: "Doddabetta Peak", dist: "5.5 km", type: "Mountain Peak", time: "~12 min drive" },
    { name: "Pykara Lake", dist: "22 km", type: "Lake", time: "~45 min drive" },
    { name: "Pykara Falls", dist: "23 km", type: "Waterfall", time: "~50 min drive" },
    { name: "Emerald Lake", dist: "24 km", type: "Lake", time: "~50 min drive" },
    { name: "Avalanche Lake", dist: "28 km", type: "Lake", time: "~1 hr drive" },
    { name: "Coonoor", dist: "18 km", type: "Town", time: "~35 min drive" },
    { name: "Mudumalai National Park", dist: "38 km", type: "Wildlife Reserve", time: "~1.5 hr drive" }
  ],
  food: [
    { name: "Sizzlers Restaurant", dist: "550 m", type: "Dine-in" },
    { name: "Mesiya Tiffin Centre", dist: "550 m", type: "Local snacks" },
    { name: "Mysore Darbar Restaurant", dist: "700 m", type: "Royal Indian" }
  ],
  nature: [
    { name: "Doddabetta Peak", dist: "5.5 km", type: "Mountain Peak" },
    { name: "Pykara Falls", dist: "23 km", type: "Waterfall" },
    { name: "Emerald Lake", dist: "24 km", type: "Lake" },
    { name: "Avalanche Lake", dist: "28 km", type: "Lake" }
  ],
  transit: [
    { name: "Ooty Railway Station", dist: "2.3 km", type: "Train Station" },
    { name: "Ooty Bus Station", dist: "2.1 km", type: "Bus" },
    { name: "Coimbatore International Airport", dist: "83 km", type: "Airport" }
  ]
};

const POPULAR_FACILITIES = [
  { name: "Free WiFi", icon: Wifi },
  { name: "Free parking", icon: Car },
  { name: "24/7 Hot Water", icon: Droplet },
  { name: "TV in room", icon: Tv },
  { name: "24/7 Security Camera", icon: ShieldCheck },
  { name: "Guest Attendant (8AM–10PM)", icon: User },
  { name: "Family rooms", icon: Home },
  { name: "Non-smoking rooms", icon: Sun }
];

const FACILITY_CATEGORIES = [
  {
    title: "Bathroom & Spa",
    icon: Droplet,
    items: ["24/7 Hot Water", "Bidet", "Bath or shower", "Private bathroom", "Toilet", "Twin shower"]
  },
  {
    title: "Bedroom comfort",
    icon: Home,
    items: ["Fresh volumetric Linen", "Warm timber wardrobe", "Secluded study nook"]
  },
  {
    title: "Outdoors",
    icon: Compass,
    items: ["Grand dining terrace", "Shared Iron/Steel-Bared Campfire Hearth"]
  },
  {
    title: "Kitchen & Dining",
    icon: Utensils,
    items: ["Shared gourmet kitchen", "High chairs on demand"]
  },
  {
    title: "Reception",
    icon: Flame,
    items: ["Plush modern sofa set", "Open space fireplace", "Relaxation wooden recliners"]
  },
  {
    title: "Media & Tech",
    icon: Tv,
    items: ["Flat-screen TV", "Satellite TV channels", "Ambient custom mood lighting"]
  },
  {
    title: "Common Services",
    icon: Clock,
    items: ["Wake-up service call", "Professional car hire booking", "Daily linen housekeeping"]
  },
  {
    title: "Common Services",
    icon: User,
    items: ["Guest Attendant on-site (8AM–10PM)", "Wake-up service call", "Professional car hire booking", "Daily linen housekeeping"]
  },
  {
    title: "Safety & Security",
    icon: ShieldCheck,
    items: ["24/7 Security Camera (CCTV)", "Fire extinguishers on hand", "CCTV outside boundaries", "CCTV in lobbies"]
  }
];

export default function CottageInfoTab() {
  const [activeSubSection, setActiveSubSection] = useState<"surroundings" | "facilities" | "rules" | "faq">("surroundings");
  const [faqSearch, setFaqSearch] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // States for Suggest Hours form
  const [showSuggestHours, setShowSuggestHours] = useState(false);
  const [suggestedOpen, setSuggestedOpen] = useState("08:30");
  const [suggestedClose, setSuggestedClose] = useState("21:45");
  const [suggestionComments, setSuggestionComments] = useState("");
  const [isSuggestionSubmitted, setIsSuggestionSubmitted] = useState(false);

  const handleSuggestHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuggestionSubmitted(true);
    setTimeout(() => {
      // Keep state clean or let it show success indefinitely for current view
    }, 3000);
  };

  const filteredFaqs = FAQ_LIST.filter(
    (item) =>
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="pt-24 pb-8 bg-gradient-to-b from-[#f8f9ff] to-white dark:from-[#00174a]/10 dark:to-transparent min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sub-Header Branding */}
        <div className="text-center mb-10">
          <span className="font-sans text-[11px] uppercase tracking-widest text-[#819ae7] font-extrabold block mb-2">
            Property Exploration
          </span>
          <BlurText
            text="Cottage Surroundings & Resident Guide"
            tag="h1"
            className="font-headline-lg text-3xl md:text-5xl text-[#001a52] dark:text-[#dbe1ff] font-medium tracking-tight mb-4 justify-center"
            delay={50}
            direction="top"
            stepDuration={0.38}
          />
          <BlurText
            text="Discover Ooty's natural elegance. Detailed lookbooks, surrounding local transit hubs, high-end guest facilities, check-in terms, and answers to your queries."
            className="font-sans text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed justify-center"
            delay={30}
            direction="bottom"
            stepDuration={0.28}
          />
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap justify-center border-b border-slate-200 dark:border-white/10 mb-10 pb-4 gap-2">
          {[
            { id: "surroundings", label: "Property Surroundings", icon: MapPin },
            { id: "facilities", label: "Premium Facilities", icon: Wifi },
            { id: "rules", label: "House Rules", icon: FileText },
            { id: "faq", label: `FAQs (${FAQ_LIST.length}+)`, icon: HelpCircle }
          ].map((sub) => {
            const Icon = sub.icon;
            const isSelected = activeSubSection === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubSection(sub.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-sans tracking-wider uppercase font-bold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#001a52] text-white shadow-md shadow-indigo-900/10 scale-95"
                    : "text-slate-500 hover:text-[#001a52] dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-900 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive content renders based on selected section */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* 1. PROPERTY SURROUNDINGS */}
            {activeSubSection === "surroundings" && (
              <motion.div
                key="surroundings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left Columns - List Categories */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Attractions List */}
                  <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Compass className="w-5 h-5 text-[#819ae7]" />
                      <h3 className="font-headline-md text-lg text-[#001a52] dark:text-[#dbe1ff]">
                        What's nearby
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SURROUNDINGS_DATA.attractions.map((att: any, i: number) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="text-xs font-sans text-slate-700 dark:text-slate-300 font-semibold leading-tight">
                              {att.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-[#001a52]/5 dark:bg-[#819ae7]/10 text-[#001a52] dark:text-[#819ae7] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                              {att.dist}
                            </span>
                          </div>
                          {att.time && (
                            <span className="text-[9px] text-slate-400">{att.time} · {att.type}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dining and Nature Grouped Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Restaurants & Cafes */}
                    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                        <Utensils className="w-4.5 h-4.5 text-[#819ae7]" />
                        <h3 className="font-headline-md text-base text-[#001a52] dark:text-[#dbe1ff]">
                          Restaurants & Cafes
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {SURROUNDINGS_DATA.food.map((f, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">{f.name}</span>
                            <span className="text-[10px] font-mono text-[#001a52] dark:text-[#819ae7] font-black">{f.dist}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Natural wild Beauty */}
                    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                        <Sun className="w-4.5 h-4.5 text-[#819ae7]" />
                        <h3 className="font-headline-md text-base text-[#001a52] dark:text-[#dbe1ff]">
                          Natural beauty
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {SURROUNDINGS_DATA.nature.map((n, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">{n.name}</span>
                            <span className="text-[10px] font-mono text-[#001a52] dark:text-[#819ae7] font-black">{n.dist}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Public Transport transit */}
                  <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Train className="w-4.5 h-4.5 text-[#819ae7]" />
                      <h3 className="font-headline-md text-base text-[#001a52] dark:text-[#dbe1ff]">
                        Public transport details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
                      {SURROUNDINGS_DATA.transit.map((tr, i) => (
                        <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-950/20 rounded-lg">
                          <span className="font-medium">{tr.name}</span>
                          <span className="text-[10px] font-mono text-[#001a52] dark:text-[#819ae7] font-bold">{tr.dist}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>                {/* Right Interactive Mock Map & Callouts */}
                <div className="space-y-6">
                  
                  {/* Detailed Digital Map & Location Frame */}
                  <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans text-[#819ae7] font-extrabold uppercase tracking-widest">
                        Physical Location & Directions
                      </span>
                      <span className="text-[10px] bg-[#819ae7]/10 text-[#819ae7] dark:bg-[#819ae7]/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        ★ Gated Resort
                      </span>
                    </div>

                    {/* Map — only CoolSpot Cottage marker, no other business pins */}
                    <div className="rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/10 shadow-sm">
                      <CoolSpotMap height="h-[210px]" zoom={17} />
                    </div>

                    {/* Address Content & Details */}
                    <div className="space-y-3.5 pt-1">
                      {/* Address detail */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#819ae7] shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[#001a52] dark:text-white block mb-0.5">Physical Address</span>
                          123/L, Vijayanagara Palace Road, Near HMT Gate, Ooty – 643001, Tamil Nadu
                        </div>
                      </div>

                      {/* Email + Owner */}
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-[#819ae7] shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[#001a52] dark:text-white block mb-0.5">Official Email</span>
                          <a href="mailto:Coolspotcottage@gmail.com" className="text-indigo-600 dark:text-[#819ae7] hover:underline">
                            Coolspotcottage@gmail.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-[#819ae7] shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[#001a52] dark:text-white block mb-0.5">Owner</span>
                          SARAVANA NAGARAJAN
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 dark:border-white/5 pt-3.5">
                        {/* Get There details */}
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Route Duration</span>
                          <span className="text-xs font-mono font-bold text-[#001a52] dark:text-[#819ae7] flex items-center gap-1 mt-0.5">
                            <Compass className="w-3.5 h-3.5 shrink-0" />
                            <span>3 hrs 53 mins</span>
                          </span>
                        </div>
                        
                        {/* Instant phone link */}
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Direct Hotline</span>
                          <a href="tel:+917010395526" className="text-xs font-mono font-bold text-indigo-600 dark:text-[#819ae7] hover:underline flex items-center gap-1 mt-0.5">
                            <Coffee className="w-3.5 h-3.5 shrink-0 text-[#819ae7]" />
                            <span>70103 95526</span>
                          </a>
                          <a href="tel:+919042737424" className="text-[10px] font-mono text-slate-400 hover:underline block mt-0.5">90427 37424</a>
                        </div>
                      </div>

                      {/* Direct External Map Redirect */}
                      <a
                        href="https://www.google.com/maps/place//@11.4039116,76.7118485,20.75z/data=!4m6!1m5!3m4!2zMTHCsDI0JzE0LjEiTiA3NsKwNDInNDIuNyJF!8m2!3d11.4039167!4d76.7118611!5m1!1e1?hl=en&entry=ttu&g_ep=EgoyMDI2MDYwMS4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#001a52] hover:bg-[#0c2c6d] text-white py-3 rounded-xl font-sans text-xs uppercase tracking-widest font-bold text-center block transition-all shadow-md select-none cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-amber-100" />
                        <span>Navigate on Google Maps</span>
                      </a>

                      {/* Map — only CoolSpot Cottage marker */}
                      <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
                        <CoolSpotMap height="h-48" zoom={18} />
                      </div>
                    </div>
                  </div>

                  {/* Operational Hours Card */}
                  <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#819ae7]" />
                        <span className="text-xs font-sans text-[#001a52] dark:text-[#dbe1ff] font-bold uppercase tracking-wider">
                          Service & Desk Hours
                        </span>
                      </div>
                      <span className="text-[9px] font-sans bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        ● Open Daily
                      </span>
                    </div>

                    {/* Weekly Schedule list */}
                    <div className="space-y-1.5 text-xs">
                      {[
                        { day: "Monday", hours: "Open 24 Hours" },
                        { day: "Tuesday", hours: "Open 24 Hours" },
                        { day: "Wednesday", hours: "Open 24 Hours" },
                        { day: "Thursday", hours: "Open 24 Hours" },
                        { day: "Friday", hours: "Open 24 Hours" },
                        { day: "Saturday", hours: "Open 24 Hours" },
                        { day: "Sunday", hours: "Open 24 Hours" }
                      ].map((item, idx) => {
                        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        const currentDayName = daysOfWeek[new Date().getDay()];
                        const isToday = currentDayName === item.day;

                        return (
                          <div 
                            key={idx} 
                            className={`flex justify-between items-center py-1.5 px-2.5 rounded-lg transition-colors ${
                              isToday 
                                ? "bg-indigo-50/60 dark:bg-slate-800 text-[#001a52] dark:text-[#819ae7] font-semibold border border-indigo-100/30 dark:border-white/5" 
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                            }`}
                          >
                            <span>{item.day}</span>
                            <span className="font-mono text-[11px]">{item.hours}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Suggest Hours Button & Collapsible form panel */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                      {!showSuggestHours ? (
                        <button
                          onClick={() => setShowSuggestHours(true)}
                          className="w-full text-center py-2.5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 hover:border-[#819ae7] hover:text-[#001a52] dark:hover:text-white text-xs font-sans tracking-wider text-slate-400 font-bold uppercase transition-all whitespace-nowrap cursor-pointer"
                        >
                          + Suggest new hours
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider">Suggest alternate hours</span>
                            <button 
                              onClick={() => { setShowSuggestHours(false); setIsSuggestionSubmitted(false); }}
                              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                            >
                              ✕ Close
                            </button>
                          </div>

                          {isSuggestionSubmitted ? (
                            <motion.div 
                              initial={{ scale: 0.95 }}
                              animate={{ scale: 1 }}
                              className="text-center py-4 space-y-2"
                            >
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                                <Check className="w-4 h-4" />
                              </div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Suggestion Submitted!</p>
                              <p className="text-[10px] text-slate-400">Our operations team will review your suggested times.</p>
                            </motion.div>
                          ) : (
                            <form onSubmit={handleSuggestHoursSubmit} className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Opens at</label>
                                  <input 
                                    type="text" 
                                    value={suggestedOpen} 
                                    onChange={(e) => setSuggestedOpen(e.target.value)}
                                    placeholder="e.g. 09:00 AM"
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Closes at</label>
                                  <input 
                                    type="text" 
                                    value={suggestedClose} 
                                    onChange={(e) => setSuggestedClose(e.target.value)}
                                    placeholder="e.g. 10:00 PM"
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Additional remarks</label>
                                <textarea
                                  value={suggestionComments}
                                  onChange={(e) => setSuggestionComments(e.target.value)}
                                  placeholder="Why are alternative hours preferred?"
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs resize-none"
                                />
                              </div>

                              <button 
                                type="submit" 
                                className="w-full py-2 btn-apple-primary text-[10px] uppercase font-semibold tracking-widest"
                              >
                                Submit Suggestion
                              </button>
                            </form>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Surroundings Summary */}
                  <div className="bg-[#efe4d9]/40 dark:bg-slate-900 p-6 rounded-2xl border border-[#efe4d9]/50 dark:border-white/5">
                    <span className="font-headline-lg text-lg text-amber-900 dark:text-[#819ae7] block mb-2 font-medium">
                      Highly Rated Location
                    </span>
                    <p className="font-sans text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Guests booking reservations frequently love this specific district. It combines the absolute tranquility of Nilgiri mountain forests with immediate proximity to major botanical reservation parks.
                    </p>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 2. PREMIUM FACILITIES */}
            {activeSubSection === "facilities" && (
              <motion.div
                key="facilities"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-10"
              >
                {/* Popular Facilities Badges Row */}
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
                  <h3 className="font-headline-md text-base text-slate-400 uppercase tracking-wider mb-6">
                    Most Popular Facilities
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {POPULAR_FACILITIES.map((fac, i) => {
                      const Icon = fac.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-white/5 hover:scale-105 transition-all">
                          <Icon className="w-4.5 h-4.5 text-[#819ae7]" />
                          <span className="text-xs font-sans text-[#001a52] dark:text-[#dbe1ff] font-bold">
                            {fac.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Categorized Facilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {FACILITY_CATEGORIES.map((cat, i) => {
                    const CategoryIcon = cat.icon;
                    return (
                      <div key={i} className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-white/5 pb-2.5 text-[#001a52] dark:text-[#819ae7]">
                          <CategoryIcon className="w-4 h-4" />
                          <h4 className="font-headline-md text-sm font-bold tracking-tight uppercase">
                            {cat.title}
                          </h4>
                        </div>
                        <ul className="space-y-2">
                          {cat.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                              <span className="w-1 h-1 bg-[#819ae7] rounded-full" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Footnote Services disclaimer */}
                <div className="p-5 bg-blue-50/40 dark:bg-slate-950/30 rounded-xl flex items-start gap-3 border border-blue-100/30 dark:border-white/5">
                  <Languages className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-[#001a52] dark:text-[#819ae7] block">Languages spoken by caretaker teams:</span>
                    <span className="text-slate-500 dark:text-slate-400">English, Hindi, and regional Tamil languages spoken fluently for seamless international coordination services.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. HOUSE RULES */}
            {activeSubSection === "rules" && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Active Check-in Check-out Timeline */}
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                  <h3 className="font-headline-md text-lg text-[#001a52] dark:text-[#dbe1ff] border-b pb-4 border-slate-100 dark:border-white/5 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#819ae7]" />
                    <span>Check-In & Check-Out Schedule</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    <div className="absolute inset-y-0 left-1/2 -ml-0.5 w-[1px] bg-slate-100 dark:bg-white/5 hidden md:block" />
                    
                    {/* Check In */}
                    <div className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded-xl transition-all">
                      <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-full shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-headline-md text-sm font-bold text-slate-800 dark:text-slate-200">
                          Check-In Term
                        </h4>
                        <p className="font-mono text-xl md:text-2xl font-black text-[#001a52] dark:text-[#819ae7] mt-1">
                          12:00 PM
                        </p>
                        <span className="text-xs text-slate-400 block mt-2">
                          Standard early baggage drop available. ID proofs mandatory at arrival desk.
                        </span>
                      </div>
                    </div>

                    {/* Check Out */}
                    <div className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded-xl transition-all">
                      <div className="bg-amber-500/10 text-amber-500 p-3 rounded-full shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-headline-md text-sm font-bold text-slate-800 dark:text-slate-200">
                          Check-Out Term
                        </h4>
                        <p className="font-mono text-xl md:text-2xl font-black text-[#001a52] dark:text-[#819ae7] mt-1">
                          11:00 AM
                        </p>
                        <span className="text-xs text-slate-400 block mt-2">
                          Later checkout is subject to room availability and package options.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Substantive House Rules Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Policies Checklists */}
                  <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <h3 className="font-headline-md text-base text-[#001a52] dark:text-[#dbe1ff] border-b pb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                      <span>Resident Rules Checklist</span>
                    </h3>
                    
                    <div className="space-y-4 text-xs">
                      {/* Quiet Hours */}
                      <div className="flex items-start gap-2.5">
                        <span className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] uppercase font-bold shrink-0 text-slate-600 dark:text-slate-300">Quiet</span>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Quiet Hours</span>
                          <span className="text-slate-500">Guests must preserve mountain quietude between 23:00 and 06:00.</span>
                        </div>
                      </div>

                      {/* Smoking */}
                      <div className="flex items-start gap-2.5">
                        <span className="p-1 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded text-[9px] uppercase font-bold shrink-0">No Smoke</span>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Strictly Non-Smoking</span>
                          <span className="text-slate-500">Smoking is not allowed inside cottage rooms or indoor social bays.</span>
                        </div>
                      </div>

                      {/* Gatherings */}
                      <div className="flex items-start gap-2.5">
                        <span className="p-1 bg-amber-500/10 text-amber-600 rounded text-[9px] uppercase font-bold shrink-0">No Events</span>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">No Social Parties</span>
                          <span className="text-slate-500">Large gatherings or private events are not permitted on forest lawns.</span>
                        </div>
                      </div>

                      {/* Cash only */}
                      <div className="flex items-start gap-2.5">
                        <span className="p-1 bg-[#001a52]/10 text-[#001a52] dark:text-[#819ae7] rounded text-[9px] uppercase font-bold shrink-0">Payment</span>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Cash Payments Only</span>
                          <span className="text-slate-500">Cottage billing services accept cash only at checking desk.</span>
                        </div>
                      </div>

                      {/* Parking */}
                      <div className="flex items-start gap-2.5">
                        <span className="p-1 bg-emerald-500/10 text-emerald-600 rounded text-[9px] uppercase font-bold shrink-0">Parking</span>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Parking (First Come – First Serve)</span>
                          <span className="text-slate-500">Free on-site parking is available on a first come, first serve basis. No advance reservation required.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Children & Pets Policies */}
                  <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <h3 className="font-headline-md text-base text-[#001a52] dark:text-[#dbe1ff] border-b pb-2 flex items-center gap-2">
                      <Heart className="w-4.5 h-4.5 text-rose-500" />
                      <span>Family & Cot Policies</span>
                    </h3>

                    <div className="space-y-4 text-xs leading-relaxed">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Child policies:</span>
                        <p className="text-slate-500">
                          Children of any age are welcome. Realtime availability details can be queried by inserting child occupancy count in reservation panels.
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs mb-1">Cots & Extra Beds</span>
                        <div className="flex justify-between items-center text-xs mt-2 border-b border-dashed pb-2">
                          <span className="text-slate-500">Infant cot (Age 0 - 3 yrs)</span>
                          <span className="font-mono font-bold text-[#001a52] dark:text-[#819ae7]">₹ 400 / child, per night</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Preregistration cots vary based on options chosen. There are no spare adult extra mattresses available.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Pet requests allowed</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Special Request Prompt */}
                <div className="p-6 bg-[#efe4d9]/40 dark:bg-slate-900 text-center rounded-2xl">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Need customized checkouts or special accessibility request? Coolspot Cottage accepts custom notes. Ensure to specify during reservation setup panels in the next step!
                  </p>
                </div>
              </motion.div>
            )}

            {/* 4. EXPANDABLE FAQ PANEL (20+ QUESTIONS) */}
            {activeSubSection === "faq" && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Search Bar FAQ */}
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search over 20+ questions (e.g. WiFi, parking, check-out)..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 font-sans text-xs uppercase tracking-wider text-[#001a52] dark:text-[#dbe1ff] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#819ae7]"
                  />
                </div>

                {/* FAQ Accordions card */}
                {filteredFaqs.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFaqs.map((faq, index) => {
                      const isOpen = activeFaq === index;
                      return (
                        <div
                          key={index}
                          className="bg-white dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden"
                        >
                          <button
                            onClick={() => setActiveFaq(isOpen ? null : index)}
                            className="w-full text-left p-5 flex items-center justify-between gap-4 font-sans text-xs md:text-sm text-[#001a52] dark:text-[#dbe1ff] font-bold hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          
                          {/* Answer Reveal Transition */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden border-t border-slate-100 dark:border-white/5"
                              >
                                <div className="p-5 font-sans text-xs md:text-sm text-slate-600 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-950/20 leading-relaxed">
                                  {faq.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-400">
                      No matching queries found. Try searching another term or contact concierge service.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

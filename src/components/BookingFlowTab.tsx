import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  MapPin,
  Check,
  Lock,
  ShieldCheck,
  Compass,
  Sparkles,
  Clock,
  Coffee,
  ArrowRight,
  ChevronRight,
  Coins,
  Info,
  BedDouble,
  Wallet,
  CreditCard,
  Search
} from "lucide-react";
import { Room, Experience, Booking } from "../types";
import { VILLAS_DATA, EXPERIENCES_DATA } from "../data";
import { motion } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc, getDocs, collection, updateDoc } from "firebase/firestore";

interface BookingFlowTabProps {
  initialRoom?: Room;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: string;
  initialChildAges?: string[];
  onBookingConfirmed: (booking: Booking) => void;
}

export default function BookingFlowTab({
  initialRoom = VILLAS_DATA[0],
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = "2 Adults, 0 Children",
  initialChildAges = [],
  onBookingConfirmed
}: BookingFlowTabProps) {
  // Current Active Step (1: Stay Info, 2: Guest Details, 3: Success or Submit)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields - Step 1
  const [room, setRoom] = useState<Room>(initialRoom);
  // Tracks which specific room numbers the guest has chosen (empty until user explicitly selects)
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestAdults, setGuestAdults] = useState(() => parseInt(initialGuests.split(" Adult")[0]) || 2);
  const [guestChildren, setGuestChildren] = useState(() => parseInt(initialGuests.split(", ")[1]?.split(" Child")[0] ?? "0") || 0);
  const [guestChildAges, setGuestChildAges] = useState<string[]>(initialChildAges);
  const guests = `${guestAdults} Adult${guestAdults !== 1 ? "s" : ""}, ${guestChildren} Child${guestChildren !== 1 ? "ren" : ""}`;
  const [selectedExps, setSelectedExps] = useState<Experience[]>([]);

  // Form Fields - Step 2 (Replica of Booking.com)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [countryRegion, setCountryRegion] = useState("India");
  const [city, setCity] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("IN +91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [paperlessConfirmation, setPaperlessConfirmation] = useState(true);
  const [bookingForSelf, setBookingForSelf] = useState(true);
  const [extraBedRequested, setExtraBedRequested] = useState(false);
  const [extraBedCount, setExtraBedCount] = useState(1);
  const [workTrip, setWorkTrip] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [arrivalTime, setArrivalTime] = useState("14:00 - 15:00");
  const [cotRequested, setCotRequested] = useState(false);
  const [petAllowed, setPetAllowed] = useState(false);
  const [campfireRequested, setCampfireRequested] = useState(false);
  const [parkingRequired, setParkingRequired] = useState(false);

  const [paymentMode, setPaymentMode] = useState<"advance" | "full">("advance");

  // Inline validation errors
  const [firstNameError, setFirstNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Room availability state (fetched from Firebase)
  const [bookedRoomNumbers, setBookedRoomNumbers] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityFetched, setAvailabilityFetched] = useState(false);

  // Live rates from Firebase rooms collection (set by admin panel)
  const [roomRates, setRoomRates] = useState<Record<string, number>>({});

  // Status & Submit values
  const [submitting, setSubmitting] = useState(false);
  const [generatedBooking, setGeneratedBooking] = useState<Booking | null>(null);

  // Payment proof upload state
  const [paymentSubStep, setPaymentSubStep] = useState<"qr" | "proof" | "done">("qr");
  const [proofRef, setProofRef] = useState("");
  const [proofAmount, setProofAmount] = useState("");
  const [proofDateTime, setProofDateTime] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [proofSubmitting, setProofSubmitting] = useState(false);

  // Scroll to top of hero on mount (page load / tab switch)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Check-in must be today or later; only clear checkout if it's invalid
  // Sync guestChildAges array length with guestChildren count
  useEffect(() => {
    setGuestChildAges((prev: string[]) => {
      const arr = [...prev];
      while (arr.length < guestChildren) arr.push("");
      return arr.slice(0, guestChildren);
    });
  }, [guestChildren]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const resolvedCheckIn = (!checkIn || checkIn < today) ? today : checkIn;
    if (resolvedCheckIn !== checkIn) setCheckIn(resolvedCheckIn);
    // Clear checkout only if it's before or equal to the resolved check-in
    if (checkOut && checkOut <= resolvedCheckIn) setCheckOut("");
  }, []);

  // Fetch live room rates set by admin from Firebase rooms collection
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const snap = await getDocs(collection(db, "rooms"));
        const rates: Record<string, number> = {};
        snap.forEach((d) => {
          const data = d.data();
          if (data.ratePerNight) rates[d.id] = data.ratePerNight;
        });
        setRoomRates(rates);
      } catch (err) {
        console.error("Room rate fetch error:", err);
      }
    };
    fetchRates();
  }, []);

  // RETRIEVE: query Firebase for booked room numbers on selected dates
  const fetchRoomAvailability = async (ciDate: string, coDate: string) => {
    if (!ciDate || !coDate || ciDate >= coDate) {
      setBookedRoomNumbers([]);
      setAvailabilityFetched(false);
      return;
    }
    setAvailabilityLoading(true);
    try {
      const snap = await getDocs(collection(db, "bookings"));
      const taken: string[] = [];
      snap.forEach((d) => {
        const b = d.data();
        // Overlap: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
        if (b.status !== "Cancelled" && b.checkIn < coDate && b.checkOut > ciDate && Array.isArray(b.assignedRooms)) {
          taken.push(...b.assignedRooms);
        }
      });
      setBookedRoomNumbers([...new Set(taken)]);
      setAvailabilityFetched(true);
    } catch (err) {
      console.error("Availability fetch error:", err);
      setBookedRoomNumbers([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomAvailability(checkIn, checkOut);
  }, [checkIn, checkOut]);

  // When guest count drops back to ≤ 3 adults, trim multi-selection to one room
  useEffect(() => {
    const count = parseInt(guests.split(" Adult")[0]) || 2;
    if (count <= 3 && selectedRoomNumbers.length > 1) {
      setSelectedRoomNumbers(prev => [prev[0]]);
    }
  }, [guests]);

  // Calculate reservation metrics
  let nights = 1;
  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    if (diff > 0) {
      nights = Math.ceil(diff / (1000 * 3600 * 24));
    }
  }

  const adultCount = parseInt(guests.split(" Adult")[0]) || 2;
  // > 3 adults → multi-room selection allowed; ≤ 3 → single room only
  const isMultiRoomMode = adultCount > 3;

  // Assigned rooms: bundle always takes all its numbers; otherwise use explicit selections
  const assignedRooms = room.isBundle
    ? (room.roomNumbers || [])
    : selectedRoomNumbers.filter(Boolean);

  const roomsNeeded = assignedRooms.length || 1;

  // Helper: get the rate for any individual room number by looking up its parent category
  const getRateForNumber = (num: string): number => {
    const cat = VILLAS_DATA.find(v => (v.roomNumbers || []).includes(num));
    if (!cat) return 0;
    return roomRates[cat.id] ?? cat.ratePerNight;
  };

  // Use admin-set Firebase rate if available, otherwise fall back to static default
  const effectiveRate = roomRates[room.id] ?? room.ratePerNight;

  // Cost: bundle rate once; individual rooms summed per selected number
  const roomBaseCost = room.isBundle
    ? effectiveRate * nights
    : (selectedRoomNumbers.length > 0
        ? selectedRoomNumbers.reduce((sum, num) => sum + getRateForNumber(num) * nights, 0)
        : effectiveRate * nights);
  const expsCost = selectedExps.reduce((acc, curr) => acc + curr.cost, 0);
  const extraBedRate = 1500;
  const extraBedCost = extraBedRequested ? extraBedRate * extraBedCount * nights : 0;
  const totalCost = roomBaseCost + expsCost + extraBedCost;

  const advanceAmount = Math.round(totalCost * 0.4);
  const remainingAmount = totalCost - advanceAmount;

  // Availability derived values (9 rooms total: 101–108)
  const TOTAL_ROOMS = 9;
  const availableRoomCount = TOTAL_ROOMS - bookedRoomNumbers.length;
  const isHighDemand = availabilityFetched && bookedRoomNumbers.length >= 6;
  const isFullyBooked = availabilityFetched && availableRoomCount <= 0;

  // Step 1 is valid when dates are set, a room number is selected, and all child ages are selected
  const allChildAgesSelected = guestChildren === 0 || (guestChildAges.length === guestChildren && guestChildAges.every(a => a !== ""));
  const isStep1Valid = !!(checkIn && checkOut && checkIn < checkOut && allChildAgesSelected && selectedRoomNumbers.length > 0);

  // Returns true if a category has at least one unbooked room
  const isCategoryAvailable = (r: Room): boolean => {
    if (!availabilityFetched) return true;
    const nums = r.roomNumbers || [];
    if (r.isBundle) return nums.every((n) => !bookedRoomNumbers.includes(n));
    return nums.some((n) => !bookedRoomNumbers.includes(n));
  };

  // Count available rooms within a category
  const categoryAvailableCount = (r: Room): number => {
    if (!availabilityFetched) return (r.roomNumbers || []).length;
    return (r.roomNumbers || []).filter((n) => !bookedRoomNumbers.includes(n)).length;
  };

  // Toggle Experiences
  const handleToggleExp = (exp: Experience) => {
    if (selectedExps.some((e) => e.id === exp.id)) {
      setSelectedExps((prev) => prev.filter((e) => e.id !== exp.id));
    } else {
      setSelectedExps((prev) => [...prev, exp]);
    }
  };

  // Process Confirmation / Firebase insertion
  const handleCompleteBooking = async () => {
    setSubmitting(true);
    const bookingId = "CST-" + Math.floor(100000 + Math.random() * 900000);
    
    // Construct database entity aligning metadata and schema requirements
    const newBooking: any = {
      id: bookingId,
      room: {
        id: room.id,
        name: room.name,
        ratePerNight: effectiveRate,
        roomNumbers: room.roomNumbers,
      },
      checkIn,
      checkOut,
      guestsText: guests,
      nightsNum: nights,
      totalCost,
      status: "Pending",
      specialRequests: specialRequests.trim() || "None",
      billingName: `${firstName} ${lastName}`.trim(),
      billingEmail: billingEmail.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      countryRegion,
      city: city.trim(),
      phonePrefix,
      phoneNumber: phoneNumber.trim(),
      secondaryPhone: secondaryPhone.trim() || null,
      paperlessConfirmation,
      bookingForSelf,
      workTrip,
      cotRequested,
      extraBedRequested,
      extraBedCount,
      extraBedRate,
      extraBedTotal: extraBedCost,
      arrivalTime,
      petAllowed,
      campfireRequested,
      parkingRequired,
      guestChildAges,
      assignedRooms,
      roomsBooked: roomsNeeded,
      paymentMode,
      advanceAmount: paymentMode === "advance" ? advanceAmount : 0,
      remainingAmount: paymentMode === "advance" ? remainingAmount : totalCost,
      createdTime: new Date().toLocaleString()
    };

    const pathForWrite = `bookings/${bookingId}`;
    try {
      // Save directly to the live Firebase Firestore service
      await setDoc(doc(db, "bookings", bookingId), newBooking);
      console.log("Booking saved securely in Firebase DB.");
      
      setGeneratedBooking(newBooking);
      setStep(3); // Show payment QR screen FIRST
      onBookingConfirmed(newBooking); // Updates bookings list without navigating away
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, pathForWrite);
    } finally {
      setSubmitting(false);
    }
  };

  const executeWhatsAppLink = async () => {
    if (!generatedBooking) return;
    const phoneNo = "070103 95526".replace(/\s+/g, '');
    const cleanNo = phoneNo.startsWith("0") ? "91" + phoneNo.substring(1) : phoneNo;

    const b = generatedBooking;
    const fmtDate = (d: string) => {
      if (!d) return "—";
      const dt = new Date(d + "T00:00:00");
      return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const roomsLabel = b.assignedRooms?.length
      ? b.assignedRooms.map((n: string) => `#${n}`).join(" + ")
      : "TBD";

    // Build inclusions list
    const inclusionLines: string[] = [];
    if (b.campfireRequested) inclusionLines.push("• Campfire Evening");
    if (b.petAllowed) inclusionLines.push("• Pet Friendly Arrangement");
    if (b.parkingRequired) inclusionLines.push("• Parking Reserved");
    if (b.cotRequested) inclusionLines.push("• Baby Cot (Complimentary)");
    if (b.extraBedRequested) inclusionLines.push(`• Extra Bed × ${b.extraBedCount} (₹${(b.extraBedTotal || 0).toLocaleString()} total)`);
    if ((b.selectedExps || b.selectedExperiences || []).length > 0) {
      (b.selectedExps || b.selectedExperiences || []).forEach((exp: any) => {
        inclusionLines.push(`• ${exp.name} — ₹${exp.cost.toLocaleString()}`);
      });
    }

    // Build pricing block
    const roomRate = b.room?.ratePerNight ?? effectiveRate;
    const roomsCount = b.roomsBooked ?? 1;
    const nightsCount = b.nightsNum ?? nights;
    const roomCostTotal = (b.assignedRooms?.length > 1 && !b.room?.isBundle)
      ? b.assignedRooms.reduce((s: number, num: string) => {
          const cat = VILLAS_DATA.find((v: any) => (v.roomNumbers || []).includes(num));
          const r = cat ? (roomRates[cat.id] ?? cat.ratePerNight) : roomRate;
          return s + r * nightsCount;
        }, 0)
      : roomRate * nightsCount * roomsCount;

    const expsCostTotal = (b.selectedExps || b.selectedExperiences || []).reduce((s: number, e: any) => s + e.cost, 0);
    const extraBedCostTotal = b.extraBedTotal ?? 0;

    const sep = "°°°°°°°°°°°°°°°°°°°°°°°°°°°°";
    const line = "─────────────────────────────";

    const message =
`🏡 *COOLSPOT COTTAGE — BOOKING CONFIRMATION*

Dear ${b.firstName || b.billingName},

Thank you for choosing Coolspot Cottage, Ooty! We are pleased to confirm your reservation and look forward to welcoming you soon.

${sep}
📋 *BOOKING DETAILS*
${sep}

🎫 Booking ID      : ${b.id}
👤 Guest Name      : ${b.billingName}
📞 WhatsApp No.    : ${b.phonePrefix} ${b.phoneNumber}${b.secondaryPhone ? `\n📞 Alt. Number     : ${b.secondaryPhone}` : ""}
📧 Email           : ${b.billingEmail || "Not provided"}
🏙️ City / Region   : ${b.city ? `${b.city}, ` : ""}${b.countryRegion || "India"}

${sep}
🏨 *STAY DETAILS*
${sep}

🏠 Room Type       : ${b.room?.name}
🔑 Room No.        : ${roomsLabel}
🛏️ Rooms Booked    : ${roomsCount} Room${roomsCount > 1 ? "s" : ""}
📅 Check-In        : ${fmtDate(b.checkIn)}
📅 Check-Out       : ${fmtDate(b.checkOut)}
🌙 No. of Nights   : ${nightsCount} Night${nightsCount > 1 ? "s" : ""}
👥 No. of Guests   : ${b.guestsText}${b.guestChildAges?.length > 0 && b.guestChildAges.some((a: string) => a !== "") ? `\n👶 Children Ages   : ${b.guestChildAges.map((a: string, i: number) => a ? `Child ${i + 1}: ${a} yr${a !== "1" ? "s" : ""}` : "").filter(Boolean).join(", ")}` : ""}${b.arrivalTime ? `\n🕐 Arrival Time    : ${b.arrivalTime}` : ""}

${sep}
✨ *INCLUSIONS & ADD-ONS*
${sep}

${inclusionLines.join("\n")}

${sep}
💰 *PRICING SUMMARY*
${sep}

${b.assignedRooms?.length > 1
  ? b.assignedRooms.map((num: string) => {
      const cat = VILLAS_DATA.find((v: any) => (v.roomNumbers || []).includes(num));
      const r = cat ? (roomRates[cat.id] ?? cat.ratePerNight) : roomRate;
      return `Room #${num} @ ₹${r.toLocaleString()} × ${nightsCount} night${nightsCount > 1 ? "s" : ""} = ₹${(r * nightsCount).toLocaleString()}`;
    }).join("\n")
  : `${b.room?.name} @ ₹${roomRate.toLocaleString()} × ${nightsCount} night${nightsCount > 1 ? "s" : ""} × ${roomsCount} room${roomsCount > 1 ? "s" : ""} = ₹${roomCostTotal.toLocaleString()}`
}${expsCostTotal > 0 ? `\nActivities & Experiences = ₹${expsCostTotal.toLocaleString()}` : ""}${extraBedCostTotal > 0 ? `\nExtra Bed(s) = ₹${extraBedCostTotal.toLocaleString()}` : ""}

${line}
💵 *Total Payable   : ₹${b.totalCost?.toLocaleString()} (Incl. taxes)*
${line}
${b.paymentMode === "advance"
  ? `✅ Advance Paid    : ₹${b.advanceAmount?.toLocaleString()} (40%)\n⏳ Balance Due     : ₹${b.remainingAmount?.toLocaleString()} (payable at Check-In)`
  : `✅ Full Payment    : ₹${b.totalCost?.toLocaleString()} (payable at Check-In)`}

${sep}
📋 *SPECIAL REQUESTS*
${sep}

${b.specialRequests && b.specialRequests !== "None" ? b.specialRequests : "None"}
🐾 Pet             : ${b.petAllowed ? "Yes — Pet-friendly setup arranged" : "No"}
🔥 Campfire        : ${b.campfireRequested ? "Yes — Bonfire setup requested" : "No"}
🚗 Parking         : ${b.parkingRequired ? "Yes — Parking spot reserved" : "No"}

${sep}
📜 *TERMS & CONDITIONS*
${sep}

• Check-In @ 12:00 PM & Check-Out @ 10:00 AM
• Early Check-In or Late Check-Out subject to availability and chargeable
• Children below 5 years are complimentary
• Children from 5 to 12 years are chargeable at applicable rates
• Above 12 years full charges are applicable
• ID proof mandatory for all adults (Hard or Soft copy)
• Outside food & drinks are not allowed
• No smoking / drinking inside cottage rooms
• No parties / events unless entire cottage is booked
• Quiet hours strictly enforced between 11:00 PM and 6:00 AM
• Pets allowed only with prior confirmation

${sep}
❌ *CANCELLATION POLICY*
${sep}

• 25+ days prior to Check-In: Full refund applicable
• 20 to 25 days prior to Check-In: 50% refund applicable
• Below 20 days prior to Check-In: No refund
• All refunds attract a 10% administrative charge

${line}

Assuring you our best service at all times. Do feel free to contact us for any clarifications or requirements.

Have a wonderful stay! 🌿

*Warm Regards,*
*Coolspot Cottage, Ooty* 🏔️
📞 +91 70103 95526`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNo}&text=${encoded}`;
    window.open(whatsappUrl, "_blank");
  };

  const executeWhatsAppUnpaidNotice = () => {
    if (!generatedBooking) return;
    const b = generatedBooking;
    const phoneNo = "070103 95526".replace(/\s+/g, "");
    const cleanNo = phoneNo.startsWith("0") ? "91" + phoneNo.substring(1) : phoneNo;

    const paidAmt = parseFloat(proofAmount) || 0;
    const requiredAmt = b.paymentMode === "advance"
      ? (b.advanceAmount || 0)
      : (b.totalCost || 0);
    const shortfall = requiredAmt - paidAmt;

    const message =
`⚠️ *COOLSPOT COTTAGE — PAYMENT INCOMPLETE*

Dear ${b.firstName || b.billingName},

We received your payment proof, but the amount submitted does not cover the required payment for your booking. Please complete the payment to confirm your reservation.

📋 *BOOKING REFERENCE*
🎫 Booking ID       : ${b.id}
👤 Guest Name       : ${b.billingName}
📞 WhatsApp No.     : ${b.phonePrefix} ${b.phoneNumber}
📅 Check-In         : ${b.checkIn}
📅 Check-Out        : ${b.checkOut}
🏠 Room             : ${b.room?.name}

💰 *PAYMENT STATUS*
${b.paymentMode === "advance"
  ? `• 40% Advance Required : ₹${requiredAmt.toLocaleString()}
• Amount Submitted      : ₹${paidAmt.toLocaleString()}
• Shortfall (to pay)    : ₹${shortfall.toLocaleString()}`
  : `• Full Amount Required : ₹${requiredAmt.toLocaleString()}
• Amount Submitted      : ₹${paidAmt.toLocaleString()}
• Shortfall (to pay)    : ₹${shortfall.toLocaleString()}`}

⚠️ *Your booking will only be confirmed once we receive the full required amount of ₹${requiredAmt.toLocaleString()}.*

Please scan the UPI QR code on the booking page or contact us directly to complete your payment.

📞 *Coolspot Cottage, Ooty* — +91 70103 95526`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${cleanNo}&text=${encoded}`, "_blank");
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedBooking) return;
    setProofSubmitting(true);
    try {
      const paidAmt = parseFloat(proofAmount) || 0;
      await updateDoc(doc(db, "bookings", generatedBooking.id), {
        paymentProofRef: proofRef.trim(),
        paymentProofAmount: paidAmt,
        paymentProofDateTime: proofDateTime,
        paymentProofSubmitted: true,
      });
      setPaymentSubStep("done");

      // Auto-open WhatsApp after submission:
      // - Full/sufficient payment → send booking confirmation
      // - Underpaid → send payment-incomplete notice
      const requiredAmt = generatedBooking.paymentMode === "advance"
        ? (generatedBooking.advanceAmount || 0)
        : (generatedBooking.totalCost || 0);
      if (paidAmt >= requiredAmt) {
        executeWhatsAppLink();
      } else {
        executeWhatsAppUnpaidNotice();
      }
    } catch (err) {
      console.error("Proof submit error:", err);
    } finally {
      setProofSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-800 pb-20">
      
      {/* Spectacular Custom Hero Header section */}
      <section className="relative bg-[#001a52] text-white py-16 md:py-24 text-center px-4 overflow-hidden mb-10 select-none">
        <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 to-[#001a52]" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#819ae7] inline-block bg-white/10 px-3 py-1 rounded-full mb-3">
            ★ Coolspot Cottage Ooty Booking Portal
          </span>
          <h1 className="font-headline-lg text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Complete Your Bespoke Stay
          </h1>
          <p className="font-sans text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Configure your tranquil escape down the Elk Hill heights in Ooty. Enjoy lush greenery, bespoke hospitality, and modern convenience nested in pristine wilderness.
          </p>
        </div>
      </section>

      {/* Modern Horizontal Process Steps Counter */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          {[
            { nr: 1, label: "Stay Specifications" },
            { nr: 2, label: "Guest Registry" },
            { nr: 3, label: "Confirmation Details" }
          ].map((s) => (
            <div key={s.nr} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                step === s.nr 
                  ? "bg-[#001a52] text-white" 
                  : step > s.nr 
                    ? "bg-emerald-500 text-white" 
                    : "bg-slate-100 text-slate-400"
              }`}>
                {step > s.nr ? <Check className="w-4 h-4" /> : s.nr}
              </div>
              <span className={`text-[11px] uppercase font-bold tracking-wider hidden sm:inline ${
                step === s.nr
                  ? "text-[#001a52] dark:text-white"
                  : step > s.nr
                    ? "text-slate-700 dark:text-slate-200"
                    : "text-slate-400 dark:text-slate-500"
              }`}>
                {s.label}
              </span>
              {s.nr < 3 && <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE INTERACTIVE FORM STEPS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* STEP 1: Select Room and stay dates */}
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6 text-left"
            >
              <div>
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold block mb-4 border-b pb-2">
                  1. Stay & Accommodation Selection
                </h3>

                {/* Dates first so availability can be checked */}
                {(() => {
                  const today = new Date().toISOString().split("T")[0];
                  const minCheckOut = checkIn
                    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0]
                    : "";
                  return (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Check-In Date
                        </label>
                        <input
                          type="date"
                          required
                          min={today}
                          value={checkIn}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            // Reset checkout if it's no longer valid
                            if (checkOut && checkOut <= e.target.value) setCheckOut("");
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs md:text-sm"
                        />
                      </div>
                      <div>
                        <label className={`block text-[11px] font-sans font-bold uppercase tracking-wider mb-2 ${checkIn ? "text-slate-500" : "text-slate-300"}`}>
                          Check-Out Date
                        </label>
                        <input
                          type="date"
                          required
                          disabled={!checkIn}
                          min={minCheckOut}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className={`w-full border rounded-lg py-2 px-3 text-xs md:text-sm transition-all ${
                            checkIn
                              ? "bg-slate-50 border-slate-200"
                              : "bg-slate-100 border-slate-100 cursor-not-allowed text-slate-400"
                          }`}
                        />
                        {!checkIn && (
                          <p className="text-[10px] text-slate-400 mt-1">Select check-in date first</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Search Availability button */}
                {checkIn && checkOut && checkIn < checkOut && (
                  <button
                    type="button"
                    onClick={() => fetchRoomAvailability(checkIn, checkOut)}
                    disabled={availabilityLoading}
                    className="w-full btn-apple-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md mb-4 disabled:opacity-60"
                  >
                    {availabilityLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Checking Availability…</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Search Availability</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {/* Live availability banner */}
                {checkIn && checkOut && checkIn < checkOut && (
                  <div className={`rounded-xl p-3.5 flex items-center gap-3 border text-xs mb-4 ${
                    availabilityLoading ? "bg-slate-50 border-slate-200"
                    : isFullyBooked   ? "bg-red-50 border-red-200"
                    : isHighDemand    ? "bg-amber-50 border-amber-200"
                    : availabilityFetched ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50 border-slate-200"
                  }`}>
                    {availabilityLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-[#001a52] rounded-full animate-spin shrink-0" />
                        <span className="text-slate-500 font-medium">Checking room availability…</span>
                      </>
                    ) : isFullyBooked ? (
                      <>
                        <Info className="w-4 h-4 text-red-500 shrink-0" />
                        <div>
                          <span className="font-bold text-red-700 block">Fully Booked</span>
                          <span className="text-red-600">All 9 rooms are taken for these dates. Please choose different dates.</span>
                        </div>
                      </>
                    ) : isHighDemand ? (
                      <>
                        <Info className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <span className="font-bold text-amber-700 block">
                            Only {availableRoomCount} room{availableRoomCount !== 1 ? "s" : ""} available!
                          </span>
                          <span className="text-amber-600">
                            {bookedRoomNumbers.length} of 9 rooms already booked — book now to secure your stay.
                          </span>
                        </div>
                      </>
                    ) : availabilityFetched ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-700 block">
                            {availableRoomCount} room{availableRoomCount !== 1 ? "s" : ""} available
                          </span>
                          <span className="text-emerald-600">Good availability for these dates.</span>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Room selector: category header + individual room number items */}
                {isMultiRoomMode && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                    <BedDouble className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px] text-amber-700 font-semibold">
                      4+ guests — select multiple rooms below
                    </span>
                  </div>
                )}
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Room
                </label>
                <div className="space-y-3">
                  {VILLAS_DATA.map((r) => {
                    const avail = isCategoryAvailable(r);
                    const availCount = categoryAvailableCount(r);
                    const isCatSelected = r.isBundle
                      ? room.id === r.id && selectedRoomNumbers.length > 0
                      : (r.roomNumbers || []).some(n => selectedRoomNumbers.includes(n));
                    const liveRate = roomRates[r.id] ?? r.ratePerNight;
                    return (
                      <div
                        key={r.id}
                        className={`rounded-xl border-2 overflow-hidden transition-all ${
                          isCatSelected ? "border-[#001a52]" : "border-slate-200"
                        } ${!avail ? "opacity-50" : ""}`}
                      >
                        {/* Category header row */}
                        <div className={`flex items-center gap-3 px-3 py-2.5 ${isCatSelected ? "bg-[#e5eeff]" : "bg-white"}`}>
                          <img src={r.imageUrl} alt={r.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${isCatSelected ? "text-[#001a52]" : "text-slate-700"}`}>
                                {r.name}
                              </span>
                              {!avail ? (
                                <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Fully Booked</span>
                              ) : isHighDemand && availabilityFetched ? (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{availCount} left</span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-[#001a52]">₹{liveRate.toLocaleString()}/night</span>
                              {r.isBundle && <span className="text-[9px] text-slate-400">· bundle (all rooms included)</span>}
                            </div>
                          </div>
                        </div>

                        {/* Individual room number buttons — N buttons for N rooms */}
                        <div className={`px-3 pb-3 pt-2 flex gap-2 flex-wrap border-t ${
                          isCatSelected ? "bg-[#eef2ff] border-[#c7d4f8]" : "bg-slate-50 border-slate-100"
                        }`}>
                          {(r.roomNumbers || []).map((num) => {
                            const isRoomBooked = availabilityFetched && bookedRoomNumbers.includes(num);
                            const isRoomSelected = r.isBundle
                              ? room.id === r.id && selectedRoomNumbers.length > 0
                              : selectedRoomNumbers.includes(num);
                            return (
                              <button
                                key={num}
                                type="button"
                                disabled={!avail || isRoomBooked}
                                onClick={() => {
                                  if (!avail || isRoomBooked) return;
                                  if (r.isBundle) {
                                    setRoom(r);
                                    setSelectedRoomNumbers(r.roomNumbers || []);
                                  } else if (isMultiRoomMode) {
                                    // Toggle: add or remove this room number
                                    setRoom(r);
                                    setSelectedRoomNumbers(prev => {
                                      if (prev.includes(num)) {
                                        const next = prev.filter(n => n !== num);
                                        return next.length > 0 ? next : [num];
                                      }
                                      return [...prev, num];
                                    });
                                  } else {
                                    // Single-room mode: replace selection
                                    setRoom(r);
                                    setSelectedRoomNumbers([num]);
                                  }
                                }}
                                className={`flex-1 min-w-[64px] py-2 px-2 rounded-lg text-xs font-bold border-2 transition-all ${
                                  isRoomBooked
                                    ? "cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400"
                                    : isRoomSelected
                                    ? "bg-[#001a52] border-[#001a52] text-white shadow-sm"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-[#001a52] hover:text-[#001a52] cursor-pointer"
                                }`}
                              >
                                Room #{num}
                                {isRoomBooked && <span className="block text-[9px] font-normal opacity-70">Taken</span>}
                                {isRoomSelected && !isRoomBooked && <span className="block text-[9px] font-normal opacity-80">Selected</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guests Selection */}
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Guests Count
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 space-y-3">
                  {/* Adults row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700">Adults</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setGuestAdults(a => Math.max(1, a - 1))}
                        className="w-7 h-7 rounded-full border-2 border-[#001a52]/30 flex items-center justify-center text-[#001a52] hover:bg-[#001a52] hover:text-white hover:border-[#001a52] transition-all font-bold text-base leading-none cursor-pointer"
                      >−</button>
                      <span className="w-6 text-center text-sm font-black text-[#001a52]">{guestAdults}</span>
                      <button
                        type="button"
                        onClick={() => setGuestAdults(a => Math.min(24, a + 1))}
                        className="w-7 h-7 rounded-full border-2 border-[#001a52]/30 flex items-center justify-center text-[#001a52] hover:bg-[#001a52] hover:text-white hover:border-[#001a52] transition-all font-bold text-base leading-none cursor-pointer"
                      >+</button>
                    </div>
                  </div>
                  {/* Children row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700">Children</span>
                      <span className="block text-[10px] text-slate-400">Ages 0–12</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setGuestChildren(c => Math.max(0, c - 1))}
                        className="w-7 h-7 rounded-full border-2 border-[#001a52]/30 flex items-center justify-center text-[#001a52] hover:bg-[#001a52] hover:text-white hover:border-[#001a52] transition-all font-bold text-base leading-none cursor-pointer"
                      >−</button>
                      <span className="w-6 text-center text-sm font-black text-[#001a52]">{guestChildren}</span>
                      <button
                        type="button"
                        onClick={() => setGuestChildren(c => Math.min(12, c + 1))}
                        className="w-7 h-7 rounded-full border-2 border-[#001a52]/30 flex items-center justify-center text-[#001a52] hover:bg-[#001a52] hover:text-white hover:border-[#001a52] transition-all font-bold text-base leading-none cursor-pointer"
                      >+</button>
                    </div>
                  </div>
                  {/* rooms notice */}
                  {(guestAdults + guestChildren) > 3 && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <BedDouble className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-[11px] text-amber-700 font-semibold">
                        {Math.min(9, Math.ceil((guestAdults + guestChildren) / 3))} rooms required for {guestAdults + guestChildren} guests
                      </span>
                    </div>
                  )}

                  {/* Child age dropdowns */}
                  {guestChildren > 0 && (
                    <div className="pt-2 border-t border-slate-100 mt-1">
                      <p className="text-xs font-bold text-slate-700 mb-2">
                        Age of Children <span className="text-red-500">*</span>
                        <span className="text-[10px] font-normal text-slate-400 ml-1">(required to continue)</span>
                      </p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {Array.from({ length: guestChildren }, (_, i) => {
                          const isSelected = guestChildAges[i] !== "" && guestChildAges[i] !== undefined;
                          return (
                            <div key={i} className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-500">
                                Child {i + 1} {!isSelected && <span className="text-red-400">*</span>}
                              </span>
                              <select
                                value={guestChildAges[i] || ""}
                                onChange={(e) => {
                                  const arr = [...guestChildAges];
                                  arr[i] = e.target.value;
                                  setGuestChildAges(arr);
                                }}
                                className={`border rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#001a52] cursor-pointer ${
                                  !isSelected ? "border-red-300" : "border-slate-200"
                                }`}
                              >
                                <option value="">Select age</option>
                                {Array.from({ length: 18 }, (_, age) => (
                                  <option key={age} value={String(age)}>{age} yr{age !== 1 ? "s" : ""}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                      {!allChildAgesSelected && (
                        <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1">
                          <span>⚠</span> Please select age for all children to continue
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-room assignment notice */}
              {isMultiRoomMode && assignedRooms.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <span className="font-bold block mb-0.5">Multiple Rooms Selected for 4+ Adults</span>
                    <span className="text-amber-700">
                      Rooms: <strong>{assignedRooms.map(n => `#${n}`).join(" + ")}</strong>
                      {room.isBundle ? " (Family Suite Bundle)" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Continue button — enabled only when dates set + all child ages selected */}
              {!isStep1Valid && (
                <p className="text-[11px] text-slate-400 text-center -mb-2">
                  {!checkIn || !checkOut
                    ? "Select check-in & check-out dates to continue"
                    : !allChildAgesSelected
                    ? "Select age for all children to continue"
                    : selectedRoomNumbers.length === 0
                    ? "Select a room number to continue"
                    : ""}
                </p>
              )}
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="w-full btn-apple-primary py-3 text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <span>Continue to Guest Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Your details form (Replicating Screenshot 1) */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-left"
            >
              {/* Stay Specifications */}
              <div className="bg-[#001a52] rounded-2xl p-5 text-white">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/50 mb-4">Stay Specifications</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">Check-In</span>
                    <span className="text-sm font-bold">{checkIn ? new Date(checkIn + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">Check-Out</span>
                    <span className="text-sm font-bold">{checkOut ? new Date(checkOut + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">Duration</span>
                    <span className="text-sm font-bold">{nights} Night{nights !== 1 ? "s" : ""}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">Room Type</span>
                    <span className="text-sm font-bold">{room.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">Guests</span>
                    <span className="text-sm font-bold">
                      {guestAdults} Adult{guestAdults !== 1 ? "s" : ""}
                      {guestChildren > 0 ? `, ${guestChildren} Child${guestChildren !== 1 ? "ren" : ""}` : ""}
                    </span>
                    {guestChildren > 0 && guestChildAges.some(a => a !== "") && (
                      <span className="text-[10px] text-white/60 block mt-0.5">
                        Ages: {guestChildAges.map((a, i) => a ? `${a} yr${a !== "1" ? "s" : ""}` : `Child ${i+1}`).join(", ")}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">Rooms</span>
                    <span className="text-sm font-bold">{roomsNeeded} Room{roomsNeeded !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>

              {/* SignIn Notice Bar */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>
                    Sign in to book with your saved details or <strong className="text-indigo-600 hover:underline cursor-pointer">register</strong> to manage your bookings on the go!
                  </span>
                </div>
              </div>

              {/* Enter Details Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight pb-3 border-b flex items-center gap-1.5">
                  <span>Enter your details</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">First name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setFirstNameError(e.target.value.trim() ? "" : "First name is required");
                      }}
                      onBlur={() => setFirstNameError(firstName.trim() ? "" : "First name is required")}
                      placeholder="e.g. John"
                      className={`w-full bg-slate-50 border rounded-lg py-2.5 px-3 text-xs ${firstNameError ? "border-red-400" : "border-slate-200"}`}
                    />
                    {firstNameError && <p className="text-[10px] text-red-500 mt-1">{firstNameError}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Last name <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Email address <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="e.g. johndoe@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Confirmation email goes to this address</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Country / Region <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      value={countryRegion}
                      onChange={(e) => setCountryRegion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">City / Town <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ooty"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">WhatsApp Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select
                        value={phonePrefix}
                        onChange={(e) => setPhonePrefix(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs focus:outline-none"
                      >
                        <option>IN +91</option>
                        <option>US +1</option>
                        <option>GB +44</option>
                        <option>AE +971</option>
                      </select>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhoneNumber(digits);
                          if (digits.length === 0) setPhoneError("WhatsApp number is required");
                          else if (digits.length < 10) setPhoneError("Enter exactly 10 digits");
                          else setPhoneError("");
                        }}
                        onBlur={() => {
                          if (!phoneNumber) setPhoneError("WhatsApp number is required");
                          else if (phoneNumber.length < 10) setPhoneError("Enter exactly 10 digits");
                        }}
                        placeholder="10-digit number"
                        className={`flex-1 bg-slate-50 border rounded-lg py-2.5 px-3 text-xs ${phoneError ? "border-red-400" : "border-slate-200"}`}
                      />
                    </div>
                    {phoneError && <p className="text-[10px] text-red-500 mt-1">{phoneError}</p>}
                    {!phoneError && <p className="text-[10px] text-slate-400 mt-1">We'll send your booking confirmation on WhatsApp</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Secondary Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      value={secondaryPhone}
                      onChange={(e) => setSecondaryPhone(e.target.value)}
                      placeholder="Alternate contact number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs"
                    />
                  </div>
                </div>

                {/* Paperless checkbox */}
                <label className="flex items-start gap-2.5 py-2.5 px-3 bg-indigo-50/20 border border-indigo-100/40 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={paperlessConfirmation} 
                    onChange={(e) => setPaperlessConfirmation(e.target.checked)}
                    className="rounded mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#001a52] block">Yes, I'd like free paperless confirmation (recommended)</span>
                    <span className="text-slate-400 text-[10px] block">We'll text you a link to download our app</span>
                  </div>
                </label>

                {/* Who are you booking for? Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-2">Who are you booking for? (optional)</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input 
                        type="radio" 
                        name="bookingFor" 
                        checked={bookingForSelf} 
                        onChange={() => setBookingForSelf(true)} 
                      />
                      <span>I am the main guest</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input 
                        type="radio" 
                        name="bookingFor" 
                        checked={!bookingForSelf} 
                        onChange={() => setBookingForSelf(false)} 
                      />
                      <span>Booking is for someone else</span>
                    </label>
                  </div>
                </div>

                {/* Traveling for work? */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-2">Are you travelling for work? (optional)</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input 
                        type="radio" 
                        name="workTrip" 
                        checked={workTrip} 
                        onChange={() => setWorkTrip(true)} 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input 
                        type="radio" 
                        name="workTrip" 
                        checked={!workTrip} 
                        onChange={() => setWorkTrip(false)} 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Pet / Campfire / Parking Add-ons */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Add-Ons & Preferences</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Let us know what you need so we can prepare in advance.</p>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-[#001a52]/30 transition-all">
                    <input
                      type="checkbox"
                      checked={petAllowed}
                      onChange={(e) => setPetAllowed(e.target.checked)}
                      className="rounded accent-[#001a52]"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">🐾 Pet Friendly Stay</span>
                      <span className="text-[10px] text-slate-400">Bringing a pet? We'll arrange a pet-friendly setup.</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-[#001a52]/30 transition-all">
                    <input
                      type="checkbox"
                      checked={campfireRequested}
                      onChange={(e) => setCampfireRequested(e.target.checked)}
                      className="rounded accent-[#001a52]"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">🔥 Campfire Evening</span>
                      <span className="text-[10px] text-slate-400">Request a cozy bonfire setup for your evening.</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-[#001a52]/30 transition-all">
                    <input
                      type="checkbox"
                      checked={parkingRequired}
                      onChange={(e) => setParkingRequired(e.target.checked)}
                      className="rounded accent-[#001a52]"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">🚗 Parking Required</span>
                      <span className="text-[10px] text-slate-400">A parking space will be reserved for your vehicle. Parking is available on a first-come, first-served basis.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Good to know layout block matching screenshot */}
              <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-emerald-800">Good to know:</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>No credit card needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Your room will be 100% confirmed upon receipt of a 40% advance payment. The remaining amount can be paid directly at the property.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Congratulations! You've chosen the Economical room at Coolspot Cottage. Don't miss out, book now!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Extra cot will be confirmed after arrival at the property.</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Special requests</h4>
                <p className="text-[10px] text-slate-400">Special requests cannot be guaranteed - but the property will do its best to meet your needs.</p>
                <textarea 
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Requests in English or Hindi (optional)..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-none"
                />
              </div>

              {/* Final Review House Rules banner */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800">Review house rules</h4>
                <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl">
                  <p>• No smoking / drinking inside cottage rooms</p>
                  <p>• No parties / events unless booked as complete villa</p>
                  <p>• Quiet hours strictly enforced between 23:00 and 06:00</p>
                </div>
                <p className="text-[10px] text-slate-400">By continuing, you are agreeing to these rules.</p>
              </div>

              {/* Payment Option */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Wallet className="w-4 h-4 text-[#001a52]" />
                  <h4 className="text-xs font-bold text-slate-800">Payment Option</h4>
                </div>
                <p className="text-[10px] text-slate-400">Choose your preferred payment plan. Balance is settled at the property during check-in.</p>

                <div className="space-y-3">
                  {/* 40% Advance */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMode === "advance"
                        ? "border-[#001a52] bg-[#e5eeff]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === "advance"}
                      onChange={() => setPaymentMode("advance")}
                      className="mt-0.5 accent-[#001a52]"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-slate-800 block">40% Advance Payment</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Confirm with <strong className="text-[#001a52]">₹{advanceAmount.toLocaleString()}</strong> advance.&nbsp;
                        Remaining <strong>₹{remainingAmount.toLocaleString()}</strong> paid at property.
                      </span>
                    </div>
                    <CreditCard className="w-4 h-4 text-[#819ae7] shrink-0 mt-0.5" />
                  </label>

                  {/* Full Payment */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMode === "full"
                        ? "border-[#001a52] bg-[#e5eeff]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === "full"}
                      onChange={() => setPaymentMode("full")}
                      className="mt-0.5 accent-[#001a52]"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-slate-800 block">Full Payment at Property</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Pay the full amount <strong className="text-[#001a52]">₹{totalCost.toLocaleString()}</strong> upon check-in. No advance required.
                      </span>
                    </div>
                    <Coins className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  </label>
                </div>

                {/* Payment summary line */}
                <div className="bg-[#f8f9ff] rounded-xl p-3 text-xs flex justify-between items-center border border-slate-100">
                  <span className="text-slate-500 font-medium">
                    {paymentMode === "advance" ? "Advance to pay now:" : "Full amount at check-in:"}
                  </span>
                  <span className="font-black text-[#001a52] text-sm">
                    ₹{(paymentMode === "advance" ? advanceAmount : totalCost).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 btn-apple border border-slate-300 text-slate-500 text-xs font-sans font-semibold uppercase tracking-wider text-center"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!firstName || !phoneNumber) {
                      alert("Please complete all required fields! (First name, WhatsApp Number)");
                      return;
                    }
                    if (phoneNumber.length < 10) {
                      setPhoneError("Enter exactly 10 digits");
                      return;
                    }
                    // Validate email only if provided
                    if (billingEmail && !billingEmail.includes("@")) {
                      alert("Please enter a valid email address!");
                      return;
                    }
                    handleCompleteBooking();
                  }}
                  disabled={submitting}
                  className="flex-1 py-3 btn-apple-primary text-xs font-sans font-semibold uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-md disabled:opacity-55"
                >
                  <span>{submitting ? "Processing Reservation..." : "Next: Final Details"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Complete screen (Replicating Screenshot 2) */}
          {step === 3 && generatedBooking && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-left"
            >
              {/* Payment Summary Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-5 top-5 w-24 h-24 text-amber-500/10 shrink-0">
                  <Coins className="w-full h-full rotate-12" />
                </div>

                <h3 className="font-headline-md text-lg text-slate-800 font-extrabold mb-1">
                  {generatedBooking.paymentMode === "advance" ? "40% Advance Selected" : "Full Payment at Property"}
                </h3>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-4">
                  {generatedBooking.paymentMode === "advance"
                    ? "Please arrange the advance payment with the property to confirm your reservation."
                    : "No advance needed. Pay the full amount upon check-in at Coolspot Cottage."}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Assigned Rooms */}
                  <div className="bg-[#f0f4ff] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BedDouble className="w-3.5 h-3.5 text-[#001a52]" />
                      <span className="text-[10px] uppercase font-bold text-[#001a52] tracking-wider">Assigned Room{(generatedBooking.assignedRooms?.length || 0) > 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-sm font-black text-[#001a52]">
                      {generatedBooking.assignedRooms?.map((n: string) => `#${n}`).join(" + ") || "TBD"}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{generatedBooking.roomsBooked} room{generatedBooking.roomsBooked > 1 ? "s" : ""} · {generatedBooking.guestsText}</span>
                  </div>

                  {/* Payment breakdown */}
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Payment</span>
                    </div>
                    {generatedBooking.paymentMode === "advance" ? (
                      <>
                        <span className="text-sm font-black text-amber-700">₹{generatedBooking.advanceAmount?.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 block">advance · ₹{generatedBooking.remainingAmount?.toLocaleString()} at property</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-black text-[#001a52]">₹{generatedBooking.totalCost?.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 block">full amount at check-in</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Payment Step: QR → Proof → Done ── */}
              {paymentSubStep === "qr" && (
                <div className="bg-white p-6 rounded-3xl border-2 border-[#001a52]/20 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#001a52] text-white flex items-center justify-center font-black text-lg">₹</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Complete Your Payment</h4>
                      <span className="text-[11px] text-slate-500">Scan the QR below to pay via UPI</span>
                    </div>
                  </div>

                  {/* Amount to pay */}
                  <div className="bg-[#e5eeff] rounded-2xl p-4 text-center">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#001a52] mb-1">
                      {generatedBooking.paymentMode === "advance" ? "Pay 40% Advance Now" : "Pay Full Amount"}
                    </div>
                    <div className="text-3xl font-black text-[#001a52]">
                      ₹{generatedBooking.paymentMode === "advance"
                        ? generatedBooking.advanceAmount?.toLocaleString()
                        : generatedBooking.totalCost?.toLocaleString()}
                    </div>
                    {generatedBooking.paymentMode === "advance" && (
                      <div className="text-[10px] text-slate-500 mt-1">
                        Remaining ₹{generatedBooking.remainingAmount?.toLocaleString()} to be paid at property
                      </div>
                    )}
                  </div>

                  {/* QR Code placeholder */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-48 h-48 border-4 border-dashed border-[#001a52]/30 rounded-2xl flex flex-col items-center justify-center bg-slate-50 text-center p-4">
                      <div className="grid grid-cols-3 gap-1 mb-3 opacity-40">
                        {Array.from({length:9}).map((_,i) => (
                          <div key={i} className={`rounded ${i===0||i===2||i===6||i===8?"w-8 h-8 border-4 border-[#001a52]":"w-8 h-8 bg-[#001a52]/60"}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-[#001a52] uppercase tracking-wide">UPI Payment QR</span>
                      <span className="text-[9px] text-slate-400 mt-1">Admin: upload QR in Settings</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-600 font-medium">WhatsApp us to receive the payment QR directly:</p>
                      <a href="https://wa.me/919042737424" target="_blank" rel="noopener noreferrer"
                        className="text-sm font-black text-[#25D366] hover:underline">+91 90427 37424</a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaymentSubStep("proof")}
                    className="w-full btn-apple-primary font-sans text-xs uppercase tracking-widest font-semibold py-3 flex items-center justify-center gap-2 shadow"
                  >
                    <Compass className="w-4 h-4" />
                    <span>I've Made the Payment — Submit Proof</span>
                  </button>
                  <button type="button" onClick={executeWhatsAppLink}
                    className="w-full btn-apple border border-emerald-400 text-emerald-700 text-xs font-semibold py-2.5 hover:bg-emerald-50 uppercase tracking-wider">
                    Also Notify via WhatsApp
                  </button>
                </div>
              )}

              {paymentSubStep === "proof" && (
                <form onSubmit={handleProofSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-800">Upload Payment Proof</h4>
                  <p className="text-[10px] text-slate-400">Enter your UPI transaction details so we can verify your payment. Your booking will be confirmed once verified by our team.</p>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1.5">
                      Transaction / UTR Reference Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={proofRef}
                      onChange={e => setProofRef(e.target.value)}
                      placeholder="e.g. 426789123456"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#001a52]/30 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1.5">
                      Amount Paid (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={proofAmount}
                      onChange={e => setProofAmount(e.target.value)}
                      placeholder={String(generatedBooking.paymentMode === "advance"
                        ? generatedBooking.advanceAmount
                        : generatedBooking.totalCost)}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#001a52]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block mb-1.5">
                      Date & Time of Payment *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={proofDateTime}
                      onChange={e => setProofDateTime(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#001a52]/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={proofSubmitting}
                    className="w-full btn-apple-green font-sans text-xs uppercase tracking-widest font-semibold py-3 flex items-center justify-center gap-2"
                  >
                    {proofSubmitting ? "Submitting..." : "Submit Payment Proof"}
                  </button>
                  <button type="button" onClick={() => setPaymentSubStep("qr")}
                    className="w-full text-xs text-slate-400 hover:text-slate-600 py-2 transition-colors cursor-pointer">
                    ← Back to QR
                  </button>
                </form>
              )}

              {paymentSubStep === "done" && (
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-lg">✓</div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-800">Payment Proof Submitted!</h4>
                      <span className="text-[11px] font-mono uppercase bg-emerald-500/15 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                        Booking ID: {generatedBooking.id}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#20513d] leading-relaxed">
                    Your payment proof has been submitted. Our team will verify and confirm your booking within 2–4 hours. You'll receive a WhatsApp confirmation once verified.
                  </p>
                  <button type="button" onClick={executeWhatsAppLink}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs uppercase tracking-widest font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow transition-all cursor-pointer">
                    <Compass className="w-4 h-4 text-emerald-100" />
                    <span>Also Send via WhatsApp (+91 70103 95526)</span>
                  </button>
                </div>
              )}

              {/* Success summary terms */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-800 pb-2 border-b">Compliance & Information agreement</h4>
                <label className="flex items-start gap-2 text-xs text-slate-500">
                  <input type="checkbox" defaultChecked className="rounded mt-0.5" />
                  <span>I agree to receiving marketing emails from Booking.com / Coolspot Cottage including promotions, personalized recommendations, and update alerts.</span>
                </label>

                <p className="text-[10px] text-slate-400 leading-normal">
                  By completing, you allow us to tailor offers and context to your interests by monitoring usage. Unsubscribe in config dashboard. Read our <strong className="hover:underline text-indigo-600 cursor-pointer">privacy policy</strong>.
                </p>
                <p className="text-[10px] text-slate-400 leading-normal pt-1 border-t border-slate-100">
                  Your booking is with Coolspot Cottage directly. Completing this request acts as mutual agreement to the cottage guide <strong className="hover:underline text-indigo-600 cursor-pointer">booking conditions</strong> and <strong className="hover:underline text-indigo-600 cursor-pointer">general terms</strong>.
                </p>
              </div>

              <div className="pb-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full text-center py-3 btn-apple border border-slate-200 hover:border-[#001a52] text-[#001a52] text-xs font-semibold uppercase tracking-wider font-sans"
                >
                  Return to Landing Page
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: PRICE ESTIMATES OVERVIEW BOX */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left">
            <h4 className="text-[10px] uppercase tracking-widest text-[#4a607c] font-black border-b pb-2">
              Stay Details Summary
            </h4>

            {/* Room Category details preview */}
            <div className="flex gap-3">
              <img 
                src={room.imageUrl || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=200&q=80"} 
                alt={room.name} 
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100" 
              />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#819ae7] block">Selected Suite</span>
                <span className="text-xs font-bold text-slate-800 block leading-tight">{room.name}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">₹{effectiveRate.toLocaleString()} / Night</span>
              </div>
            </div>

            {/* Stay Info specifics list */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Duration:</span>
                <span className="font-semibold text-[#001a52]">{nights} Night{nights > 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Dates:</span>
                <span className="font-semibold text-slate-600">{checkIn || "Not set"} to {checkOut || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Guests:</span>
                <span className="font-semibold text-slate-600">{guests}</span>
              </div>
              {/* Room assignment */}
              <div className="flex justify-between items-start">
                <span className="text-slate-400">Room(s):</span>
                <span className="font-semibold text-[#001a52] text-right">
                  {assignedRooms.length > 0 ? assignedRooms.map(n => `#${n}`).join(" + ") : "TBD"}
                  {assignedRooms.length > 1 && (
                    <span className="block text-[10px] text-amber-600 font-bold">{assignedRooms.length} rooms selected</span>
                  )}
                </span>
              </div>
              {selectedExps.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Activities:</span>
                  <span className="font-semibold text-slate-600">{selectedExps.length} Selected</span>
                </div>
              )}
              {cotRequested && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Extra Cot Bed:</span>
                  <span className="font-semibold text-[#001a52]">Yes (Included)</span>
                </div>
              )}
            </div>

            {/* Price breakdown invoice */}
            <div className="bg-[#f8f9ff] p-4 rounded-2xl space-y-2 border border-slate-100 shadow-inner mt-2">
              {room.isBundle || selectedRoomNumbers.length <= 1 ? (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Room #{assignedRooms[0] ?? "—"} · ₹{effectiveRate.toLocaleString()}/night:</span>
                  <span className="font-mono font-bold">₹{roomBaseCost.toLocaleString()}</span>
                </div>
              ) : (
                selectedRoomNumbers.map(num => {
                  const cat = VILLAS_DATA.find(v => (v.roomNumbers || []).includes(num));
                  const rate = cat ? (roomRates[cat.id] ?? cat.ratePerNight) : 0;
                  return (
                    <div key={num} className="flex justify-between text-xs text-slate-600">
                      <span>Room #{num} · ₹{rate.toLocaleString()}/night:</span>
                      <span className="font-mono font-bold">₹{(rate * nights).toLocaleString()}</span>
                    </div>
                  );
                })
              )}

              {selectedExps.length > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Activities:</span>
                  <span className="font-mono font-bold">₹{expsCost.toLocaleString()}</span>
                </div>
              )}

              {extraBedRequested && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Extra Bed:</span>
                  <span className="font-mono font-bold">₹{extraBedCost.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200/40 text-[#001a52]">
                <span className="text-[10px] font-sans uppercase font-bold tracking-wider">Total</span>
                <span className="font-headline-md text-xl font-black">₹{totalCost.toLocaleString()}</span>
              </div>

              {/* Payment breakdown */}
              {step >= 2 && (
                <div className="pt-2 border-t border-slate-200/40 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    {paymentMode === "advance" ? "40% Advance Plan" : "Full Payment Plan"}
                  </div>
                  {paymentMode === "advance" ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-amber-700 font-semibold">Advance (40%):</span>
                        <span className="font-mono font-bold text-amber-700">₹{advanceAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Balance at property:</span>
                        <span className="font-mono text-slate-500">₹{remainingAmount.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Pay at property:</span>
                      <span className="font-mono font-bold text-[#001a52]">₹{totalCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

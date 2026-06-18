import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DecryptedText from './DecryptedText';

interface GoogleReview {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  timeAgo: string;
  rating: number;
  tripType?: string;
  text: string;
  scores: { rooms: number; service: number; location: number };
  highlights?: string[];
}

// ── 4★ and 5★ reviews interleaved ────────────────────────────────────────────
const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 1,
    name: "Vijeesh Panayanthatta",
    initials: "V",
    avatarColor: "#5d4037",
    timeAgo: "5 months ago",
    rating: 5,
    tripType: "Holiday | Family",
    text: "Its very comfortable to use it and the manager Midhun was done very good job. Happy to stay here and next time should be select this.",
    scores: { rooms: 5.0, service: 5.0, location: 5.0 },
    highlights: ["Quiet", "Child-friendly", "Great value"],
  },
  {
    id: 7,
    name: "NANDINI SINGH",
    initials: "N",
    avatarColor: "#00695c",
    timeAgo: "2 months ago",
    rating: 4,
    tripType: "Holiday | Friends",
    text: "It was a good room, the services was also good. Just one suggestion... Please make sure that the room that you are giving to your guest, everything works out fine in that room.",
    scores: { rooms: 4.0, service: 5.0, location: 4.0 },
    highlights: ["Quiet", "Child-friendly"],
  },
  {
    id: 2,
    name: "Bharanidharan N",
    initials: "B",
    avatarColor: "#1565c0",
    timeAgo: "8 months ago",
    rating: 5,
    tripType: "Holiday | Couple",
    text: "Room is too good and well maintained and the room service is fantastic. location is excellent and great view from terrace. Overall experience is good",
    scores: { rooms: 5.0, service: 5.0, location: 5.0 },
    highlights: ["Great view", "Romantic"],
  },
  {
    id: 9,
    name: "Sachin CS",
    initials: "S",
    avatarColor: "#e65100",
    timeAgo: "a year ago",
    rating: 4,
    tripType: "Holiday | Couple",
    text: "Love the Rooms very clean, budget friendly and Service from the staff saravan he is too good, and especially best option for couples. It was a completely quite atmosphere there. Very good place to stay with scenic view of beautiful Ooty. Rooms were clean, tidy and spacious. Good supportive staff. Guys go for it if you visit Ooty...",
    scores: { rooms: 5.0, service: 5.0, location: 5.0 },
    highlights: ["Great view", "Romantic", "Quiet"],
  },
  {
    id: 3,
    name: "Harish S",
    initials: "H",
    avatarColor: "#4a148c",
    timeAgo: "5 months ago",
    rating: 5,
    tripType: "Holiday | Family",
    text: "Room service was very good. everything in the room was clean. Midhun who works there looked after the customers patiently and according to my own preferences. The lodge was very nice.",
    scores: { rooms: 5.0, service: 5.0, location: 5.0 },
    highlights: ["Luxury", "Great view", "Quiet", "Child-friendly", "Great value"],
  },
  {
    id: 12,
    name: "G Kishore Kumar",
    initials: "G",
    avatarColor: "#4e342e",
    timeAgo: "a year ago",
    rating: 4,
    tripType: "Holiday | Friends",
    text: "Enjoyed a lot, the rooms are clean and spacious. Perfect location. Special thanks to Mr saravanan. Location is excellent and great view from terrace. Overall experience was satisfactory",
    scores: { rooms: 4.0, service: 4.0, location: 5.0 },
    highlights: ["Great view", "Great value"],
  },
  {
    id: 4,
    name: "Aswin k",
    initials: "A",
    avatarColor: "#1b5e20",
    timeAgo: "2 months ago",
    rating: 5,
    tripType: "Holiday | Family",
    text: "Was the best for this price, family friendly. Exactly in center of town and parking available for total 4 cars. Service was also good. Hot water for shower and drinking available. Nice terrace view too. Suggested for both family and bachelor",
    scores: { rooms: 5.0, service: 5.0, location: 5.0 },
    highlights: ["Quiet", "Child-friendly", "Great value"],
  },
  {
    id: 8,
    name: "hari haran",
    initials: "h",
    avatarColor: "#0277bd",
    timeAgo: "9 months ago",
    rating: 4,
    tripType: "Holiday | Family",
    text: "Hospitality is good and they will help you if you need anything. We asked them for extra bedsheets to use as a bed cover because the bed was too chill. They gave them without any hesitation. They also helped us to plan the itinerary. They have 24*7 hot water available. The location is also very good with car parking for upto 2 cars.",
    scores: { rooms: 3.0, service: 4.0, location: 4.0 },
    highlights: ["Quiet"],
  },
  {
    id: 5,
    name: "Supriya Cs",
    initials: "S",
    avatarColor: "#880e4f",
    timeAgo: "6 months ago",
    rating: 5,
    tripType: "Holiday | Couple",
    text: "The room was exceptionally clean and comfortable. I especially appreciated the cozy bed and quiet atmosphere. Great stay overall!",
    scores: { rooms: 5.0, service: 5.0, location: 5.0 },
    highlights: ["Luxury"],
  },
  {
    id: 13,
    name: "Poorva Agarwal",
    initials: "P",
    avatarColor: "#c62828",
    timeAgo: "4 months ago",
    rating: 4,
    tripType: "Holiday | Friends",
    text: "Good Experience, 10/10 recommended",
    scores: { rooms: 4.0, service: 4.0, location: 4.0 },
    highlights: ["Quiet"],
  },
  {
    id: 6,
    name: "Kiruthika Kiruthika",
    initials: "K",
    avatarColor: "#33691e",
    timeAgo: "3 months ago",
    rating: 5,
    text: "We had a wonderful stay at the cottage. The place was clean, peaceful, and surrounded by beautiful nature. The staff were friendly and helpful, making our stay very comfortable. It's a perfect spot for a relaxing getaway. Highly recommended!",
    scores: { rooms: 5.0, service: 5.0, location: 5.0 },
  },
  {
    id: 14,
    name: "Vignesh Ram",
    initials: "V",
    avatarColor: "#283593",
    timeAgo: "9 months ago",
    rating: 4,
    text: "Good place to visit with family and friends..cheap and best",
    scores: { rooms: 5.0, service: 5.0, location: 5.0 },
  },
  {
    id: 11,
    name: "Prakhyath Jogi",
    initials: "P",
    avatarColor: "#2e7d32",
    timeAgo: "5 months ago",
    rating: 4,
    text: "It was a wonderful experience but hot water issue is a concern.",
    scores: { rooms: 4.0, service: 4.0, location: 4.0 },
  },
  {
    id: 10,
    name: "Vignesh Anilkumar",
    initials: "V",
    avatarColor: "#6a1b9a",
    timeAgo: "2 years ago",
    rating: 4,
    text: "Had a pleasant stay for two days. Bed mattress and pillow quality is good. I would highly recommend this property for peaceful stay and comfortable sleep. I really liked owner and nitsh attender for their friendly approach. Property located 1.5 km away from Ooty main. Peaceful sleep with awesome climate.",
    scores: { rooms: 4.0, service: 2.0, location: 4.0 },
  },
  {
    id: 15,
    name: "Sandhya radhakrishnan",
    initials: "S",
    avatarColor: "#00838f",
    timeAgo: "7 months ago",
    rating: 4,
    text: "Good place to stay and enjoy",
    scores: { rooms: 3.0, service: 5.0, location: 4.0 },
  },
];

const CAROUSEL_CSS = `
.gr-wrap {
  position: relative;
  height: 310px;
  overflow: hidden;
  user-select: none;
}

.gr-item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 340px;
  transform: translateY(-50%) translateX(-50%) scale(0.2);
  transition: all 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.gr-item.gr-now {
  transform: translateY(-50%) translateX(-50%) scale(1);
  opacity: 1;
  pointer-events: auto;
  z-index: 10;
}

.gr-item.gr-next {
  transform: translateY(-50%) translateX(-138%) scale(0.74);
  opacity: 0.45;
  z-index: 5;
  filter: blur(1.5px);
}

.gr-item.gr-prev {
  transform: translateY(-50%) translateX(38%) scale(0.74);
  opacity: 0.45;
  z-index: 5;
  filter: blur(1.5px);
}

@media (min-width: 768px) {
  .gr-wrap { height: 290px; }
  .gr-item { width: 380px; }
  .gr-item.gr-next { transform: translateY(-50%) translateX(-132%) scale(0.74); }
  .gr-item.gr-prev { transform: translateY(-50%) translateX(32%) scale(0.74); }
}
`;

const getSlideClass = (idx: number, active: number, total: number): string => {
  const diff = idx - active;
  if (diff === 0) return 'gr-now';
  if (diff === 1 || diff === -(total - 1)) return 'gr-next';
  if (diff === -1 || diff === total - 1) return 'gr-prev';
  return '';
};

const GoogleG = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const StarRow = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" width="13" height="13" fill={i < count ? '#fbbc04' : '#e0e0e0'} aria-hidden="true">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

export default function GoogleReviewCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [readyToAdvance, setReadyToAdvance] = useState(false);
  const total = GOOGLE_REVIEWS.length;

  const next = useCallback(() => setActive(c => (c + 1) % total), [total]);
  const prev = useCallback(() => setActive(c => (c - 1 + total) % total), [total]);

  // Advance only after active card's text animation fully completes
  useEffect(() => {
    if (!readyToAdvance || paused) return;
    const t = setTimeout(() => {
      next();
      setReadyToAdvance(false);
    }, 500);
    return () => clearTimeout(t);
  }, [readyToAdvance, paused, next]);

  // Reset ready flag whenever active card changes
  useEffect(() => { setReadyToAdvance(false); }, [active]);

  const handleAnimComplete = useCallback(() => { setReadyToAdvance(true); }, []);

  const handlePrev = () => { prev(); setReadyToAdvance(false); };
  const handleNext = () => { next(); setReadyToAdvance(false); };
  const handleDot = (i: number) => { setActive(i); setReadyToAdvance(false); };

  return (
    <div className="w-full py-8 select-none">
      <style dangerouslySetInnerHTML={{ __html: CAROUSEL_CSS }} />

      {/* Section header with decrypt animation */}
      <div className="flex flex-col items-center mb-6 gap-1">
        <div className="flex items-center gap-2">
          <GoogleG />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
            <DecryptedText
              text="Google Reviews"
              animateOn="view"
              speed={30}
              maxIterations={12}
              sequential
              revealDirection="start"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
              className="text-sm font-bold text-slate-600 dark:text-slate-300"
              encryptedClassName="text-sm font-bold text-amber-400/60"
            />
          </span>
          <StarRow />
          <span className="text-sm font-black text-[#001a52] dark:text-[#dbe1ff] ml-0.5">5.0</span>
        </div>
        <p className="text-[11px] text-slate-400 tracking-wide">
          <DecryptedText
            text="Based on verified guest experiences"
            animateOn="view"
            speed={20}
            maxIterations={10}
            sequential
            revealDirection="center"
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            className="text-[11px] text-slate-400 tracking-wide"
            encryptedClassName="text-[11px] text-amber-400/40 tracking-wide"
          />
        </p>
      </div>

      {/* 3D carousel */}
      <div
        className="gr-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {GOOGLE_REVIEWS.map((review, idx) => {
          const isActive = idx === active;
          return (
            <div
              key={review.id}
              className={`gr-item ${getSlideClass(idx, active, total)}`}
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-xl p-5 h-full">

                {/* Top row: avatar + name (decrypt on each activation) + rating */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: review.avatarColor }}
                    >
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {/* key remount on every activation → decrypt plays each time card appears */}
                        <DecryptedText
                          key={`name-${review.id}-${isActive}`}
                          text={review.name}
                          animateOn="view"
                          speed={22}
                          maxIterations={10}
                          sequential
                          revealDirection="start"
                          characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
                          className="text-[13px] font-bold text-slate-800 dark:text-slate-100"
                          encryptedClassName="text-[13px] font-bold text-amber-400/70"
                        />
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">{review.timeAgo} on</span>
                        <GoogleG />
                        <span className="text-[10px] text-slate-400 font-medium">Google</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-base font-black text-slate-700 dark:text-slate-200">{review.rating}/5</span>
                </div>

                {/* Trip type */}
                {review.tripType && (
                  <p className="text-[10px] text-slate-400 mb-2">{review.tripType}</p>
                )}

                {/* Stars */}
                <div className="mb-2.5">
                  <StarRow count={review.rating} />
                </div>

                {/* Review text — fixed-height wrapper prevents card shake during decrypt */}
                <div className="h-[54px] overflow-hidden mb-3">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed cursor-default">
                    <DecryptedText
                      key={`text-${review.id}-${isActive}`}
                      text={review.text}
                      animateOn="view"
                      speed={14}
                      maxIterations={12}
                      sequential
                      revealDirection="start"
                      characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
                      className="text-[11px] text-slate-600 dark:text-slate-300"
                      encryptedClassName="text-[11px] text-amber-400/60 dark:text-amber-400/40"
                      onComplete={isActive ? handleAnimComplete : undefined}
                    />
                  </p>
                </div>

                {/* Sub-scores */}
                <div className="flex gap-3 text-[10px] text-slate-500 dark:text-slate-400 mb-2.5 font-medium">
                  <span><span className="font-bold text-slate-700 dark:text-slate-300">Rooms</span> {review.scores.rooms.toFixed(1)}</span>
                  <span><span className="font-bold text-slate-700 dark:text-slate-300">Service</span> {review.scores.service.toFixed(1)}</span>
                  <span><span className="font-bold text-slate-700 dark:text-slate-300">Location</span> {review.scores.location.toFixed(1)}</span>
                </div>

                {/* Highlights */}
                {review.highlights && review.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Hotel highlights</span>
                    {review.highlights.slice(0, 4).map((h, i) => (
                      <span key={i} className="text-[9px] text-slate-400 dark:text-slate-500">
                        {i > 0 && '· '}{h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot indicators + arrows */}
      <div className="flex items-center justify-center gap-3 mt-5">
        <button
          onClick={handlePrev}
          className="btn-apple-ghost p-1.5"
          aria-label="Previous review"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-1.5">
          {GOOGLE_REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === active
                  ? 'w-5 h-2 bg-[#001a52] dark:bg-[#819ae7]'
                  : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="btn-apple-ghost p-1.5"
          aria-label="Next review"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import ThreeDHoverGallery from "./ThreeDHoverGallery";
import BlurText from "./BlurText";

// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgFrontview from "../public/images/frontview.jpg";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgCottagesFrontview from "../public/images/coolcottages_frontview.png";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgRoomsview from "../public/images/coolcottage_roomsview.jpg";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgBedrooms from "../public/images/coolcottage_bedrooms.jpg";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgBedroom from "../public/images/coolcottage_bedroom.jpg";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgSingleBed from "../public/images/coolcottage_single bed.jpg";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgCampfire from "../public/images/coolcottage_campfirearea.jpg";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgLivingroom from "../public/images/coolcottage_livingroom.jpg";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgPlayingArea from "../public/images/coolcottage_playing area.jpg";
// @ts-expect-error - Vite resolves image assets dynamically at build time
import imgRestroom from "../public/images/coolcottage_restroom.jpg";

const GALLERY_IMAGES = [
  { src: imgFrontview, caption: "Property Entrance", category: "Exterior" },
  { src: imgCottagesFrontview, caption: "Front View", category: "Exterior" },
  { src: imgRoomsview, caption: "Mountain View Room", category: "Rooms" },
  { src: imgBedrooms, caption: "Deluxe Family Room", category: "Rooms" },
  { src: imgBedroom, caption: "Standard Bedroom", category: "Rooms" },
  { src: imgSingleBed, caption: "Budget Room", category: "Rooms" },
  { src: imgLivingroom, caption: "Living Area", category: "Common Areas" },
  { src: imgCampfire, caption: "Campfire Area", category: "Common Areas" },
  { src: imgPlayingArea, caption: "Playing & Recreation Area", category: "Common Areas" },
  { src: imgRestroom, caption: "Restroom", category: "Facilities" },
];

const CATEGORIES = ["All", "Exterior", "Rooms", "Common Areas", "Facilities"];

export default function GalleryTab() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImg, setLightboxImg] = useState<{ src: string; caption: string } | null>(null);

  const filtered = activeCategory === "All"
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter((img) => img.category === activeCategory);

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
            Visual Tour
          </motion.span>
          <BlurText
            text="Gallery"
            tag="h1"
            className="font-headline-lg text-4xl md:text-5xl mb-4 justify-center"
            delay={80}
            direction="top"
            stepDuration={0.42}
          />
          <BlurText
            text="A visual tour of Cool Spot Cottages — from the scenic entrance to every cozy room."
            className="text-white/70 text-sm max-w-xl mx-auto justify-center"
            delay={35}
            direction="bottom"
            stepDuration={0.28}
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#001a52] text-white shadow-md"
                  : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-[#001a52]/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-14"
        >
          <AnimatePresence>
            {filtered.map((img, i) => (
              <motion.div
                key={img.caption}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setLightboxImg(img)}
                className={`relative rounded-xl overflow-hidden group cursor-pointer shadow-sm ${
                  i === 0 ? "col-span-2 row-span-2 h-64 md:h-full" : "h-40"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#001a52]/0 group-hover:bg-[#001a52]/50 transition-all duration-300 flex items-end">
                  <div className="p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-white text-[10px] font-semibold tracking-wider uppercase block">
                      {img.caption}
                    </span>
                    <span className="text-white/60 text-[9px]">{img.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 3D Interactive Section */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-12">
          <div className="text-center mb-8">
            <span className="text-[11px] uppercase tracking-widest text-[#819ae7] font-extrabold block mb-2">
              Interactive Experience
            </span>
            <h2 className="font-headline-lg text-2xl md:text-3xl text-[#001a52] dark:text-[#dbe1ff]">
              3D Immersive Gallery
            </h2>
          </div>
          <ThreeDHoverGallery />
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              <img
                src={lightboxImg.src}
                alt={lightboxImg.caption}
                className="w-full rounded-2xl object-contain max-h-[80vh]"
              />
              <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-2 rounded-full">
                <span className="text-white text-xs font-semibold">{lightboxImg.caption}</span>
              </div>
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute -top-4 -right-4 bg-white text-[#001a52] rounded-full p-2 shadow-lg hover:bg-amber-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

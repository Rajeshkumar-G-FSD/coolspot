/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, X, Gift, Info, Lock, Home, BedDouble, Images, Phone, ChevronDown } from "lucide-react";
import coolspotLogo from "../public/images/coolspot.png";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openConcierge: () => void;
  bookingCount: number;
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  openConcierge,
  bookingCount,
  darkMode,
  toggleTheme,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "destinations", label: "Home", icon: Home },
    { id: "rooms", label: "Rooms", icon: BedDouble },
    { id: "gallery", label: "Gallery", icon: Images },
    { id: "about", label: "About Us", icon: Info },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "packages", label: "Offers", icon: Gift },
    { id: "admin", label: "Admin", icon: Lock },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Thin amber top accent bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 z-50" />

      <nav
        id="main-nav"
        className={`fixed top-[2px] left-0 w-full z-45 transition-all duration-500 ${
          isScrolled
            ? "bg-[#000e30]/95 backdrop-blur-2xl border-b border-amber-400/15 shadow-[0_8px_32px_rgba(0,14,48,0.6)] py-3"
            : "bg-gradient-to-b from-[#001040] to-[#001a52] border-b border-white/8 shadow-[0_4px_24px_rgba(0,10,40,0.4)] py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick("destinations")}
            className="focus:outline-none group shrink-0 cursor-pointer"
          >
            <img
              src={coolspotLogo}
              alt="CoolSpot Cottages"
              className="h-9 md:h-11 w-auto object-contain group-hover:opacity-90 transition-opacity duration-300"
            />
          </button>

          {/* Thin vertical gold divider */}
          <div className="hidden md:block w-px h-7 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent mx-4 lg:mx-6 shrink-0" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1">
            <div className="flex items-center gap-0.5 lg:gap-1">
              {navItems.map((item, i) => {
                const isActive = activeTab === item.id;
                return (
                  <React.Fragment key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`relative group px-3 lg:px-4 py-2 font-sans text-[10px] lg:text-[11px] uppercase tracking-[0.12em] lg:tracking-[0.15em] font-semibold transition-all duration-300 focus:outline-none ${
                        isActive
                          ? "text-amber-400"
                          : "text-white/65 hover:text-white"
                      }`}
                    >
                      {item.label}
                      {/* Sliding underline */}
                      <span
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] rounded-full bg-amber-400 transition-all duration-300 ${
                          isActive ? "w-4/5 opacity-100" : "w-0 opacity-0 group-hover:w-3/5 group-hover:opacity-60"
                        }`}
                      />
                    </button>
                    {/* Small dot separator between items */}
                    {i < navItems.length - 1 && (
                      <span className="text-white/15 text-[6px] select-none">•</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Phone quick-link */}
            <a
              href="tel:+917010395526"
              className="hidden lg:flex items-center gap-1.5 text-white/50 hover:text-amber-300 transition-colors duration-300 text-[9px] font-mono tracking-wider mr-4 shrink-0"
            >
              <Phone className="w-3 h-3" />
              +91 70103 95526
            </a>

            {/* Premium Book Now CTA */}
            <button
              onClick={() => handleNavClick("booking-flow")}
              className="shrink-0 relative overflow-hidden border border-amber-400/70 text-amber-400 hover:text-[#001a52] px-5 py-2 rounded text-[10px] lg:text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-300 group shadow-[0_0_14px_rgba(251,191,36,0.15)] hover:shadow-[0_0_22px_rgba(251,191,36,0.35)] cursor-pointer"
            >
              <span className="absolute inset-0 bg-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative">Book Now</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-white hover:bg-white/8 hover:border-white/20 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-400 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#000820]/85 backdrop-blur-xl"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-in panel from right */}
        <div
          className={`absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-gradient-to-b from-[#001040] to-[#001a52] shadow-2xl flex flex-col transition-transform duration-400 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Amber accent line at top of drawer */}
          <div className="h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
            <img src={coolspotLogo} alt="CoolSpot Cottages" className="h-8 w-auto object-contain" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25 font-semibold px-2 mb-3">Navigation</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 text-left transition-all duration-200 group ${
                    isActive
                      ? "bg-amber-400/10 border border-amber-400/25"
                      : "border border-transparent hover:bg-white/5 hover:border-white/8"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isActive ? "bg-amber-400/20" : "bg-white/5 group-hover:bg-white/10"
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-white/55"}`} />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-widest ${
                    isActive ? "text-amber-400" : "text-white/70"
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer — CTA + social */}
          <div className="px-4 py-6 border-t border-white/6 space-y-3">
            <button
              onClick={() => handleNavClick("booking-flow")}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-[#001a52] rounded-xl font-sans text-xs uppercase tracking-[0.15em] font-extrabold transition-all shadow-lg cursor-pointer"
            >
              Book Your Stay
            </button>
            <a
              href="tel:+917010395526"
              className="flex items-center justify-center gap-2 text-white/45 hover:text-white/75 text-[10px] font-mono tracking-wide transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              +91 70103 95526
            </a>

            {/* Social icons in mobile drawer */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1877f2]/20 hover:bg-[#1877f2]/40 flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 text-[#4fa3ff]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#e1306c]/20 hover:bg-[#e1306c]/40 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 text-[#f77fb3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://wa.me/917010395526"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#25d366]/20 hover:bg-[#25d366]/40 flex items-center justify-center transition-all"
                aria-label="WhatsApp"
              >
                <svg className="w-3.5 h-3.5 text-[#4fdf80]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, X, Gift, Info, Lock, Home, BedDouble, Images, Phone } from "lucide-react";
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
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
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
      <nav
        id="main-nav"
        className={`fixed top-0 left-0 w-full z-45 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-[#001a52] backdrop-blur-xl border-white/10 shadow-md py-4"
            : "bg-[#001a52]/95 backdrop-blur-md border-white/10 shadow-sm py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick("destinations")}
            className="focus:outline-none group cursor-pointer"
          >
            <img
              src={coolspotLogo}
              alt="CoolSpot Cottages"
              className="h-10 md:h-12 w-auto object-contain group-hover:opacity-85 transition-opacity"
            />
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center flex-1 justify-end">
            <div className="flex items-center gap-1 lg:gap-2 flex-wrap justify-end">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`nav-item flex items-center gap-1 font-sans text-[10px] lg:text-xs uppercase tracking-wider lg:tracking-widest transition-all pb-1 border-b-2 relative px-1 lg:px-1.5 ${
                      isActive
                        ? "text-white font-bold border-amber-400"
                        : "text-white/70 font-medium border-transparent hover:text-white"
                    }`}
                  >
                    <Icon className="w-3 h-3 lg:w-3.5 lg:h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 px-1 py-0.5 text-[8px] font-bold bg-[#ba1a1a] text-white rounded-full leading-none animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Book Room CTA */}
            <button
              onClick={() => handleNavClick("destinations")}
              className="ml-3 shrink-0 bg-amber-400 text-[#001a52] hover:bg-amber-300 px-4 py-2 rounded font-sans text-[10px] lg:text-xs uppercase tracking-widest font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              Book Room
            </button>
          </div>

          {/* Mobile Action Controls */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#001a52]/80 backdrop-blur-md md:hidden transition-all duration-300">
          <div className="bg-white dark:bg-[#213145] h-full w-4/5 max-w-xs shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-8 border-b pb-4 border-[#001a52]/10 dark:border-white/10">
                <div>
                  <img
                    src={coolspotLogo}
                    alt="CoolSpot Cottages"
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center justify-between w-full p-3 rounded-lg font-sans text-xs uppercase tracking-widest border transition-all ${
                        isActive
                          ? "bg-[#e5eeff] text-[#001a52] border-[#abbbde] font-bold"
                          : "text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-[#ba1a1a] text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-[#001a52]/10 dark:border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab("destinations");
                }}
                className="w-full py-3 bg-[#001a52] hover:bg-[#0e2f76] text-white rounded-lg font-sans text-xs uppercase tracking-widest font-semibold text-center block"
              >
                Book Your Villa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

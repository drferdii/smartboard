"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, MapPin, ArrowUpRight, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export const SemayotHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const navLinks = [
    { label: "Menu", href: "#menu" },
    { label: "Tentang", href: "#about" },
    { label: "Lokasi", href: "#location" },
    { label: "Admin", href: "/admin/overview" },
  ];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const headerBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(250, 246, 240, 0.85)", "rgba(250, 246, 240, 0.95)"]
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(231, 229, 228, 0.6)", "rgba(231, 229, 228, 0.9)"]
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 80],
    ["0 4px 20px rgba(0,0,0,0.08)", "0 4px 24px rgba(0,0,0,0.12)"]
  );

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <motion.div
          style={{
            backgroundColor: headerBg,
            borderBottomColor: headerBorder,
            boxShadow: headerShadow,
          }}
          className="border-b backdrop-blur-xl transition-colors duration-300"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <Link href="#hero" className="flex items-center gap-2.5 group">
                <div className="relative w-12 h-12 md:w-14 md:h-14 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/semayot/images/logo.jpg"
                    alt="Rumah Makan Semayot Logo"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 48px, 56px"
                  />
                </div>
                <span className="text-lg md:text-xl font-black text-[#1C1917] font-display tracking-tight">
                  SEMAYOT
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative px-4 py-2 text-sm font-bold text-[#57534E] hover:text-[#1C1917] transition-colors rounded-lg hover:bg-[#1C1917]/[0.03]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* Location Badge - Desktop */}
                <a
                  href="https://www.google.com/maps?q=Bengkayang,+Kalimantan+Barat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-[#78716C] hover:text-[#FF4F79] transition-colors mr-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#FF4F79]" />
                  <span>Bengkayang</span>
                </a>

                {/* CTA Button */}
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href="tel:+6281649470780"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#1C1917] text-white rounded-full hover:bg-[#292524] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hubungi</span>
                </motion.a>

                {/* Mobile Phone Icon */}
                <a
                  href="tel:+6281649470780"
                  className="md:hidden w-11 h-11 rounded-full bg-[#1C1917] flex items-center justify-center text-white active:bg-[#292524] transition-colors"
                  aria-label="Telepon"
                >
                  <Phone className="w-4 h-4" />
                </a>

                {/* Mobile Hamburger */}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden w-11 h-11 rounded-full bg-[#1C1917]/5 flex items-center justify-center text-[#1C1917] active:bg-[#1C1917]/10 transition-colors"
                  aria-label="Toggle menu"
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-nav-panel"
                >
                  {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#1C1917]/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-16 left-4 right-4 z-50 md:hidden"
            >
              <div 
                id="mobile-nav-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Menu navigasi"
                className="bg-[#FAF6F0]/98 backdrop-blur-xl rounded-2xl p-2 shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-[#E7E5E4]/80"
              >
                <nav className="flex flex-col">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 + 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="flex items-center justify-between px-4 py-3.5 text-sm font-bold text-[#44403C] hover:text-[#1C1917] hover:bg-[#1C1917]/[0.03] rounded-xl transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
                      </Link>
                    </motion.div>
                  ))}
                  <div className="px-4 pb-3 pt-1">
                    <a
                      href="tel:+6281649470780"
                      className="flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-[#292524] text-white py-3.5 rounded-xl text-sm font-bold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Phone className="w-4 h-4" />
                      <span>Hubungi Kami</span>
                    </a>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default SemayotHeader;

"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Phone, Clock, ShoppingBag } from "lucide-react";

const WhatsAppChat = dynamic(() => import("./whatsapp-chat"), {
  ssr: false,
});

export const SemayotHero: React.FC = () => {
  return (
    <section id="hero" className="relative w-full min-h-[85vh] lg:max-h-[900px] bg-[#2A1810] overflow-hidden flex flex-col">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"

          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/semayot/images/semarendang.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#1C1917]/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
      </div>

      {/* Main content - 2 column layout */}
      <div className="relative z-10 flex flex-col justify-start lg:justify-center flex-1 px-6 md:px-12 lg:px-20 pt-20 md:pt-24 pb-52 sm:pb-56 lg:pb-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 items-start">

          {/* Left - WhatsApp Chat */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-2 lg:order-1 flex justify-center lg:justify-end lg:pr-10 lg:-mt-36 min-h-[560px] sm:min-h-[600px]"
          >
            <WhatsAppChat />
          </motion.div>

          {/* Right - Hero Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <motion.a
              href="https://www.google.com/maps?q=Bengkayang,+Kalimantan+Barat"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 mb-6 md:mb-8 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FFC2D6]" />
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">
                Bengkayang, Kalimantan Barat
              </span>
            </motion.a>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-4xl md:text-5xl lg:text-7xl font-black text-[#F5E6C8] mb-4 md:mb-6 font-display tracking-tight leading-[1.05]"
            >
              Kenikmatan autentik dalam setiap sajian.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-sm md:text-lg text-white/75 font-medium max-w-lg mb-8 md:mb-10"
            >
              Spesialis masakan tradisional Dayak &amp; olahan daging asap otentik di Bumi Amas, Bengkayang.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1, type: "spring", stiffness: 100 }}
              className="relative inline-flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute w-[110px] h-[110px] md:w-[130px] md:h-[130px]"
              >
                <svg viewBox="0 0 140 140" className="w-full h-full">
                  <defs>
                    <path id="heroCirclePath" d="M 70, 70 m -55, 0 a 55,55 0 1,1 110,0 a 55,55 0 1,1 -110,0" />
                  </defs>
                  <text className="fill-white/50 text-[9px] font-bold uppercase tracking-[0.25em]">
                    <textPath href="#heroCirclePath">• LIHAT MENU • LIHAT MENU • LIHAT MENU •</textPath>
                  </text>
                </svg>
              </motion.div>
              <Link
                href="#menu"
                aria-label="Lihat Menu"
                className="relative z-10 w-[75px] h-[75px] md:w-[85px] md:h-[85px] bg-[#FAF6F0] rounded-full flex items-center justify-center shadow-[0_8px_40px_rgba(0,0,0,0.25)] hover:scale-105 transition-transform duration-300 group"
              >
                <ArrowUpRight className="w-7 h-7 md:w-8 md:h-8 text-[#1C1917] group-hover:rotate-45 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 md:pb-8 px-4 md:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-[#FAF6F0]/95 backdrop-blur-md rounded-3xl p-5 md:p-8 border border-[#E7E5E4] shadow-[0_16px_48px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4F79]" />
                  <h4 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Lokasi</h4>
                </div>
                <p className="text-[#1C1917] text-sm font-bold leading-snug">Bumi Amas, Bengkayang</p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-3.5 h-3.5 text-[#FF4F79]" />
                  <h4 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Kontak</h4>
                </div>
                <a href="tel:+6281649470780" className="text-[#1C1917] text-sm font-extrabold hover:text-[#FF4F79] transition-colors font-mono break-words">
                  0816-4947-0780
                </a>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#FF4F79]" />
                  <h4 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Jam Buka</h4>
                </div>
                <p className="text-[#1C1917] text-sm font-bold">08:00 - 21:00 WIB</p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#FF4F79]" />
                  <h4 className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Layanan</h4>
                </div>
                <p className="text-[#1C1917] text-sm font-bold">Dine-in · Takeaway</p>
                <span className="text-[10px] text-[#FF4F79] font-extrabold mt-1">Cash only</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default SemayotHero;

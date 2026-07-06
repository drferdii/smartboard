"use client";

import React from "react";
import { motion } from "framer-motion";
import { SemayotMascot } from "./semayot-mascot";
import { LiquidBlobs } from "./liquid-blobs";
import { featuredMenu } from "@/lib/semayot/menu-data";
import { semayotBusinessInfo } from "@/lib/semayot/business-info";
import { homepageCopy } from "@/lib/semayot/homepage-copy";
import { Phone, Award, AlertCircle } from "lucide-react";

export const TodayRecommendationSection: React.FC = () => {
  const recommendedItem = featuredMenu[0];
  const formattedPhone = semayotBusinessInfo.phone.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(
    `Halo Rumah Makan Semayot, saya tertarik memesan Menu Rekomendasi Hari Ini: *${recommendedItem.name}*. Apakah tersedia hari ini?`
  );
  const waUrl = `https://wa.me/62${formattedPhone.substring(1)}?text=${encodedMessage}`;

  return (
    <section id="rekomendasi" className="relative py-24 overflow-hidden">
      <LiquidBlobs variant="recommendation" />

      {/* Animated gradient border strip at top */}
      <div className="absolute top-0 left-0 right-0 h-1 animated-border-gradient gpu-accelerated" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/70 backdrop-blur-md border border-[#E7E5E4] rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_40px_rgba(28,25,23,0.05)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left — Mascot */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <SemayotMascot variant="recommendation" size={240} className="sm:w-[280px] sm:h-[280px]" />

              {/* Mascot bubble */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                viewport={{ once: true }}
                className="absolute top-[-16px] bg-white/95 backdrop-blur-md border border-[#E7E5E4] px-5 py-3 rounded-2xl shadow-[0_8px_24px_rgba(28,25,23,0.06)] text-center max-w-[210px]"
              >
                <p className="text-xs font-bold text-[#1C1917]">
                  {homepageCopy.recommendation.mascotBubble}
                </p>
                <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#E7E5E4] rotate-45" />
              </motion.div>
            </div>

            {/* Right — Content */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFBEB]/80 backdrop-blur-sm border border-[#FDE68A] text-xs font-extrabold text-[#D97706] mb-6 uppercase tracking-wider"
              >
                <Award className="w-4 h-4 fill-[#D97706] stroke-none" />
                <span>{homepageCopy.recommendation.badge}</span>
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] mb-4 font-display tracking-tight"
              >
                {homepageCopy.recommendation.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-base text-[#57534E] font-medium leading-relaxed mb-8 max-w-xl"
              >
                {homepageCopy.recommendation.subtitle}
              </motion.p>

              {/* Highlight card with animated gradient border */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full p-[2px] rounded-3xl animated-border-gradient mb-8 gpu-accelerated"
              >
                <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFF0F3] to-[#FFFBEB] flex items-center justify-center text-4xl shrink-0 shadow-[2px_2px_0px_rgba(28,25,23,0.06)]">
                    🍖
                  </div>
                  <div className="flex-grow text-left">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-[#1C1917] font-display">
                        {recommendedItem.name}
                      </h3>
                      <span className="text-xs font-extrabold text-[#D97706] whitespace-nowrap bg-[#FFFBEB] px-2.5 py-1 rounded-lg border border-[#FDE68A]">
                        {recommendedItem.price}
                      </span>
                    </div>
                    <p className="text-sm text-[#57534E] leading-relaxed">
                      {recommendedItem.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {recommendedItem.needsOwnerConfirmation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#A8A29E] bg-white/70 backdrop-blur-sm border border-[#E7E5E4] px-4 py-2.5 rounded-2xl mb-6"
                >
                  <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>Khas Ulasan Pelanggan (Perlu Konfirmasi)</span>
                </motion.div>
              )}

              <motion.a
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#1C1917] hover:bg-[#292524] text-white text-base font-bold px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.15)] transition-colors duration-200"
              >
                <Phone className="w-5 h-5" />
                <span>Hubungi via Telepon / WhatsApp</span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

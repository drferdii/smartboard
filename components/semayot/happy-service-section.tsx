"use client";

import React from "react";
import { motion } from "framer-motion";
import { Utensils, Heart, Sparkles, MessageSquare } from "lucide-react";
import { homepageCopy } from "@/lib/semayot/homepage-copy";
import { LiquidBlobs } from "./liquid-blobs";

const iconMap = {
  utensils: Utensils,
  heart: Heart,
  sparkles: Sparkles,
  "message-square": MessageSquare,
};

export const HappyServiceSection: React.FC = () => {
  return (
    <section id="keunggulan" className="relative py-24 overflow-hidden">
      <LiquidBlobs variant="service" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-block text-xs font-bold uppercase tracking-widest text-[#15803D] bg-[#F0FDF4]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#BBF7D0]"
          >
            {homepageCopy.service.badge}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1917] mt-5 mb-5 font-display tracking-tight"
          >
            {homepageCopy.service.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-[#57534E] font-medium leading-relaxed"
          >
            {homepageCopy.service.subtitle}
          </motion.p>
        </div>

        {/* Pillars Grid */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 overflow-x-auto snap-x snap-mandatory md:overflow-visible pb-6 md:pb-0" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {homepageCopy.service.pillars.map((pillar, index) => {
            const IconComponent = iconMap[pillar.icon] || Utensils;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35, rotate: -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm border border-[#E7E5E4] p-8 rounded-3xl shadow-[0_4px_20px_rgba(28,25,23,0.03)] hover:shadow-[0_12px_32px_rgba(28,25,23,0.08)] transition-shadow duration-300 flex flex-col items-center lg:items-start text-center lg:text-left snap-center shrink-0 w-[280px] md:w-auto md:shrink"
              >
                {/* Icon with bounce */}
                <motion.div
                  whileInView={{
                    y: [0, -6, 0],
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 2,
                    delay: 0.5 + index * 0.15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF0F3] to-[#FFFBEB] flex items-center justify-center text-[#D97706] mb-6 shadow-[2px_2px_0px_rgba(28,25,23,0.06)]"
                >
                  <IconComponent className="w-6 h-6" />
                </motion.div>
                <h3 className="text-lg font-bold text-[#1C1917] mb-3 font-display">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

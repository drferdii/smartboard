"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Testimonial } from "@/components/ui/design-testimonial";
import { Star } from "lucide-react";

export const ReviewsSection: React.FC = () => {
  const distributionData = [
    { stars: 5, count: 8 },
    { stars: 4, count: 1 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];

  return (
    <section id="reviews" className="relative px-6 md:px-12 lg:px-20 py-20 md:py-28 lg:py-36 overflow-hidden bg-[#0e465a]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/semayot/images/rumah-makan.webp"
          alt="Gedung Rumah Makan Semayot"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0e465a]/85" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-12 h-px bg-[#FF4F79]" />
            <span className="text-xs font-bold text-[#FF4F79] uppercase tracking-[0.2em]">
              Testimoni
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 font-display tracking-tight"
          >
            Ulasan Pelanggan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-white/80 font-medium"
          >
            Apa kata mereka yang sudah mencicipi masakan kami
          </motion.p>
        </div>

        {/* Rating + Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="lg:col-span-1 bg-[#FAF6F0]/95 backdrop-blur-sm p-8 rounded-3xl border border-[#E7E5E4] flex flex-col justify-center"
          >
            <div className="flex items-end gap-3 mb-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  >
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-6xl md:text-7xl font-black text-[#1C1917] mb-2 font-mono">
                4,9
              </p>
              <p className="text-lg text-[#78716C] font-bold">dari 5</p>
            </div>
            <p className="text-base text-[#57534E] font-extrabold">
              9 ulasan
            </p>
          </motion.div>

          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="space-y-4">
              {distributionData.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-white/90 w-20">{stars} bintang</span>
                  <div className="flex-1 bg-white/10 rounded-full h-3.5 overflow-hidden border border-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(count / 9) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut", delay: (5 - stars) * 0.1 }}
                      className="bg-[#D97706] h-full rounded-full"
                    />
                  </div>
                  <span className="text-sm font-mono font-bold text-white w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Testimonial Component */}
        <Testimonial />
      </div>
    </section>
  );
};
export default ReviewsSection;

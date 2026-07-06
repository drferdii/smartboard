"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Navigation, Phone, Compass, Star } from "lucide-react";
import { semayotBusinessInfo } from "@/lib/semayot/business-info";
import { homepageCopy } from "@/lib/semayot/homepage-copy";
import { LiquidBlobs } from "./liquid-blobs";

export const LocationCtaSection: React.FC = () => {
  const formattedPhone = semayotBusinessInfo.phone.replace(/[^0-9]/g, "");

  return (
    <section id="lokasi" className="relative py-24 overflow-hidden">
      <LiquidBlobs variant="location" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

          {/* Left — Map & Landmark */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-6 flex flex-col h-full"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-[#E7E5E4] rounded-3xl p-8 shadow-[0_4px_20px_rgba(28,25,23,0.03)] flex-grow flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#15803D] bg-[#F0FDF4]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#BBF7D0]">
                  {homepageCopy.location.badge}
                </span>
                <h3 className="text-2xl font-bold text-[#1C1917] mt-6 mb-4 font-display">
                  {semayotBusinessInfo.name}
                </h3>

                {/* Landmark chip */}
                <div className="flex items-start gap-3 bg-[#FAFAF9] border border-[#E7E5E4] p-4 rounded-2xl mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E7E5E4] flex items-center justify-center text-[#D97706] shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1917] mb-0.5">{homepageCopy.location.directionsLabel}</h4>
                    <p className="text-xs text-[#57534E] font-medium leading-relaxed">
                      {semayotBusinessInfo.landmark} (Seed Clue)
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive map placeholder with ripple pin */}
              <motion.a
                whileHover={{ y: -4 }}
                href={semayotBusinessInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative h-56 bg-gradient-to-br from-[#F0FDF4] to-[#FFFBEB] border border-[#E7E5E4] rounded-2xl flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#1C1917_1.5px,transparent_1.5px)] [background-size:18px_18px]" />

                {/* Ripple effect behind pin */}
                <div className="absolute z-0">
                  <div className="w-16 h-16 rounded-full border-2 border-[#15803D]/20 animate-[ripple_2s_ease-out_infinite]" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-[#15803D]/15 animate-[ripple_2s_ease-out_infinite_0.6s]" />
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className="z-10 bg-[#15803D] text-white p-3.5 rounded-full shadow-[0_4px_16px_rgba(21,128,61,0.25)] mb-4"
                >
                  <MapPin className="w-7 h-7 fill-white stroke-[#15803D]" />
                </motion.div>

                <span className="z-10 text-sm font-bold text-[#44403C] group-hover:text-[#15803D] transition-colors duration-200">
                  {homepageCopy.location.ctaMaps}
                </span>

                <div className="absolute inset-0 bg-[#15803D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.a>
            </div>
          </motion.div>

          {/* Right — Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-[#E7E5E4] rounded-3xl p-8 shadow-[0_4px_20px_rgba(28,25,23,0.03)] h-full flex flex-col justify-between">
              <div className="space-y-7">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF0F3] to-[#FFFBEB] flex items-center justify-center text-[#D97706] shrink-0 shadow-[2px_2px_0px_rgba(28,25,23,0.04)]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1C1917] mb-1">Alamat Utama</h4>
                    <p className="text-sm text-[#57534E] leading-relaxed">
                      {semayotBusinessInfo.address}
                    </p>
                  </div>
                </div>

                {/* Hours & Facilities */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#FFFBEB] flex items-center justify-center text-[#15803D] shrink-0 shadow-[2px_2px_0px_rgba(28,25,23,0.04)]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1C1917] mb-1">Jam & Fasilitas</h4>
                    <p className="text-sm text-[#57534E] leading-relaxed mb-1">
                      Status: <span className="text-[#15803D] font-bold">{semayotBusinessInfo.openingHoursStatus}</span> (Tutup pukul {semayotBusinessInfo.closingTime})
                    </p>
                    <p className="text-xs text-[#A8A29E] font-bold">
                      Dine-in · Takeaway · {homepageCopy.location.paymentNote}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFFBEB] to-[#FFF0F3] flex items-center justify-center text-[#D97706] shrink-0 shadow-[2px_2px_0px_rgba(28,25,23,0.04)]">
                    <Star className="w-6 h-6 fill-[#D97706] stroke-none" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1C1917] mb-1">Rating Google Maps</h4>
                    <p className="text-sm text-[#57534E] leading-relaxed">
                      ⭐ <span className="font-extrabold text-[#1C1917]">{semayotBusinessInfo.rating}</span> / 5.0 ({semayotBusinessInfo.reviewCount} ulasan)
                    </p>
                    <p className="text-xs text-[#A8A29E] font-bold">
                      8× bintang 5 · 1× bintang 4
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  href={semayotBusinessInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#1C1917] hover:bg-[#292524] text-white text-base font-bold px-6 py-4 rounded-2xl shadow-[0_4px_16px_rgba(28,25,23,0.1)] transition-colors duration-200"
                >
                  <Navigation className="w-5 h-5 fill-white stroke-none" />
                  <span>{homepageCopy.location.ctaMaps}</span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  href={`tel:${formattedPhone}`}
                  className="flex items-center justify-center gap-2 w-full bg-white/80 backdrop-blur-sm border-2 border-[#E7E5E4] hover:border-[#D97706] text-[#1C1917] text-base font-bold px-6 py-4 rounded-2xl transition-colors duration-200"
                >
                  <Phone className="w-5 h-5 text-[#D97706]" />
                  <span>{homepageCopy.location.ctaCall}</span>
                </motion.a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

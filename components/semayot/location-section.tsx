"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Phone, Compass, ArrowUpRight } from "lucide-react";

export const LocationSection: React.FC = () => {
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.5!2d109.4858797!3d0.8312772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31e335c4a9c2c4cb%3A0xfc8a3aa13021ead2!2sRumah%20Makan%20Semayot!5e0!3m2!1sid!2sid!4v1719000000000";

  return (
    <section id="location" className="bg-[#FCF9F2] px-6 md:px-12 lg:px-20 py-14 md:py-18 lg:py-22 border-b border-[#E7E5E4]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1C1917] mb-4 font-display tracking-tight"
        >
          Temukan Semayot di Bengkayang
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg text-[#57534E] mb-16 md:mb-20 font-medium"
        >
          Lokasi persisnya di jantung Bumi Amas
        </motion.p>

        {/* Editorial location grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Location details */}
          <div className="space-y-10">
            {/* Address card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pb-8 border-b border-[#E7E5E4] flex gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] border border-[#FFD4DF] flex items-center justify-center text-[#FF4F79] shrink-0 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider mb-2">
                  Alamat Lengkap
                </p>
                <p className="text-xl md:text-2xl font-extrabold text-[#1C1917] font-display leading-tight">
                  Bumi Amas, Bengkayang
                </p>
                <p className="text-base text-[#57534E] font-medium mt-1">
                  Kabupaten Bengkayang, Kalimantan Barat
                </p>
              </div>
            </motion.div>

            {/* Plus code card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="pb-8 border-b border-[#E7E5E4] flex gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0 shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider mb-3">
                  Plus Code
                </p>
                <div className="flex items-center gap-3">
                  <code className="text-2xl md:text-3xl font-black text-[#1C1917] tracking-wider font-mono bg-white border border-[#E7E5E4] px-3 py-1 rounded-xl">
                    RFJP+G9
                  </code>
                </div>
                <p className="text-sm text-[#57534E] font-medium mt-2">
                  Gunakan untuk navigasi GPS yang lebih akurat
                </p>
              </div>
            </motion.div>

            {/* Phone card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] shrink-0 shadow-sm">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider mb-2">
                  Hubungi Semayot
                </p>
                <a 
                  href="tel:+6281649470780"
                  className="text-2xl font-extrabold text-[#1C1917] hover:text-[#FF4F79] transition-colors font-mono"
                >
                  0816-4947-0780
                </a>
                <p className="text-sm text-[#57534E] font-medium mt-2">
                  Konfirmasi informasi terbaru
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Map + CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="flex flex-col gap-6"
          >
            {/* Google Maps Embed with Grey Theme */}
            <div className="relative rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(28,25,23,0.08)] border border-[#E7E5E4]">
              <div className="relative aspect-[4/3] w-full">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(100%) contrast(1.1) brightness(1.05)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Rumah Makan Semayot"
                  className="absolute inset-0 w-full h-full"
                />
                {/* Grey overlay tint for consistent theme */}
                <div className="absolute inset-0 bg-[#E7E5E4]/10 pointer-events-none" />
              </div>
              {/* Map caption */}
              <div className="bg-[#FAF6F0] px-5 py-3 border-t border-[#E7E5E4] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF4F79] shrink-0" />
                <p className="text-xs font-bold text-[#57534E]">
                  Bumi Amas, Bengkayang — Plus Code: RFJP+G9
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="https://www.google.com/maps/place/Rumah+Makan+Semayot/@0.8312772,109.4858797,17z/data=!4m7!3m6!1s0x31e335c4a9c2c4cb:0xfc8a3aa13021ead2!8m2!3d0.8312772!4d109.4858797!10e1!16s%2Fg%2F11fqll5pxj?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-5 py-4 flex items-center justify-center gap-2 font-bold bg-[#1C1917] hover:bg-[#292524] text-white rounded-2xl transition-colors shadow-sm text-sm"
                >
                  <span>Buka Maps</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="tel:+6281649470780"
                  className="w-full px-5 py-4 flex items-center justify-center gap-2 font-bold bg-[#FFF0F3] hover:bg-[#FFE0E6] text-[#FF4F79] border border-[#FFD4DF] rounded-2xl transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Telepon</span>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default LocationSection;

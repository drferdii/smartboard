"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Navigation } from "lucide-react";

export const CtaFinalSection: React.FC = () => {
  return (
    <section className="bg-[#1C1917] px-6 md:px-12 lg:px-20 py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 grain-overlay pointer-events-none opacity-40 z-0" />

      {/* Decorative gradient blur */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#FF4F79]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Background food image with low opacity */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/semayot/images/han.jpg"
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#1C1917]/80" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight"
        >
          Dari Tungku Asap Tradisional, Menuju Hangatnya Kebersamaan.
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg md:text-xl text-stone-300 leading-relaxed mb-12 md:mb-16 max-w-2xl mx-auto font-medium"
        >
          Resep turun-temurun dengan bumbu pilihan. Cek lokasi atau hubungi kami untuk informasi terbaru.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="https://www.google.com/maps/place/Rumah+Makan+Semayot/@0.8312772,109.4858797,17z/data=!4m7!3m6!1s0x31e335c4a9c2c4cb:0xfc8a3aa13021ead2!8m2!3d0.8312772!4d109.4858797!10e1!16s%2Fg%2F11fqll5pxj?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold bg-[#FF4F79] hover:bg-[#E03D63] text-white rounded-full transition-colors shadow-lg shadow-[#FF4F79]/30"
            >
              <Navigation className="w-5 h-5 fill-white stroke-none" />
              <span>Lokasi Kami</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <a
              href="tel:+6281649470780"
              className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold bg-white/10 text-white border border-white/20 hover:bg-white/25 rounded-full transition-colors backdrop-blur-md"
            >
              <Phone className="w-5 h-5 text-[#FFC2D6]" />
              <span>Telepon Sekarang</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-sm text-stone-400 italic max-w-2xl mx-auto"
        >
          <span>
            Hubungi kami untuk informasi jam buka dan menu terbaru.
          </span>
        </motion.div>
      </div>
    </section>
  );
};
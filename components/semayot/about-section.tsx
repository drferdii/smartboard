"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Utensils, CreditCard, Clock } from "lucide-react";

export const AboutSection: React.FC = () => {
  const infoItems = [
    { icon: MapPin, label: "Lokasi", value: "Bumi Amas, Bengkayang", href: "https://www.google.com/maps?q=Bengkayang,+Kalimantan+Barat" },
    { icon: Star, label: "Rating", value: "4,9/5 dari 9 ulasan Google", href: "https://www.google.com/maps/place/Rumah+Makan+Semayot/@0.8312772,109.4858797,17z/data=!4m8!3m7!1s0x31e335c4a9c2c4cb:0xfc8a3aa13021ead2!8m2!3d0.8312772!4d109.4858797!9m1!1b1!16s%2Fg%2F11fqll5pxj?entry=ttu" },
    { icon: Utensils, label: "Layanan", value: "Dine-in & Takeaway" },
    { icon: CreditCard, label: "Pembayaran", value: "Cash only" },
    { icon: Clock, label: "Jam Buka", value: "Setiap hari, 08:00 - 21:00 WIB" },
  ];

  return (
    <section id="about" className="relative bg-[#FCF9F2] overflow-hidden">
      {/* Section label & Title (Original Position) */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 pt-24 md:pt-32 lg:pt-40 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-12 h-px bg-[#FF4F79]" />
          <span className="text-xs font-bold text-[#FF4F79] uppercase tracking-[0.2em]">
            Tentang Kami
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1C1917] font-display tracking-tight leading-[1.1] max-w-3xl mb-12 md:mb-16"
        >
          Tentang Semayot
        </motion.h2>
      </div>

      {/* Full-bleed cinematic video with a slight top spacing */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full aspect-video md:aspect-[21/9] lg:aspect-[3/1] mt-4 md:mt-6"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/semayot/images/semayot.mp4" type="video/mp4" />
        </video>
        {/* Bottom gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FCF9F2] via-transparent to-[#1C1917]/20 pointer-events-none" />
        {/* Left side text overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 w-full pb-8 md:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#1C1917]/80 backdrop-blur-md text-white border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-[#FF4F79] animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest">
                Non-halal · Masakan khas Dayak
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content below video (Original Clean Layout) */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 pb-24 md:pb-32 lg:pb-40 pt-12 md:pt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left - Story text */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-lg md:text-xl text-[#57534E] leading-relaxed font-medium font-sans">
                Melanjutkan dedikasi dari pemilik sebelumnya, kini RM Semayot diurus dan dikembangkan oleh <span className="text-[#FF4F79] font-extrabold">dr. Alyn Kristiani MMRS</span>. Langkah estafet ini kami ambil biar cita rasa legendaris babi asap khas Dayak di Bengkayang tetap mengepul hangat dan terus menemani obrolan santai Anda sekeluarga!
              </p>
            </motion.div>
          </div>

          {/* Right - Info cards */}
          <div className="lg:col-span-5">
            <div className="space-y-0">
              {infoItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 + 0.3 }}
                    className="flex items-center gap-4 py-5 border-b border-[#1C1917]/10 last:border-b-0 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#FFF0F3] border border-[#FFD4DF] flex items-center justify-center text-[#FF4F79] shrink-0 group-hover:bg-[#FF4F79] group-hover:text-white transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-[0.15em] mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base text-[#1C1917] font-bold hover:text-[#FF4F79] hover:underline underline-offset-2 decoration-[#FF4F79]/30 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm md:text-base text-[#1C1917] font-bold">{item.value}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export const ExperienceSection: React.FC = () => {
  const features = [
    {
      title: "Rasa lokal yang kuat",
      description: "Ulasan pelanggan menyebut makanan Semayot lezat dan memiliki rasa pedas yang pas.",
      image: "/semayot/images/menu1.webp"
    },
    {
      title: "Nyaman untuk makan di tempat",
      description: "Semayot tersedia dengan layanan dine-in dan pelanggan menyebut tempatnya nyaman untuk bersantai.",
      image: "/semayot/images/menu3.webp"
    },
    {
      title: "Cepat dan sederhana",
      description: "Pelanggan menyebut pelayanan cepat. Informasi juga mencatat takeaway tersedia untuk kenyamanan Anda.",
      image: "/semayot/images/menu5.webp"
    }
  ];

  return (
    <section className="bg-[#f7e4de] px-6 md:px-12 lg:px-20 py-14 md:py-18 lg:py-22 border-b border-[#f7e4de]/60 relative overflow-hidden">
      {/* No pig characters - clean design */}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1C1917] mb-4 font-display tracking-tight"
            >
              Yang dicari dari Semayot
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg md:text-xl text-[#57534E] font-medium"
            >
              Dari ulasan pelanggan, Semayot dikenal lewat rasa yang lezat, tempat nyaman, dan pelayanan cepat.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
            whileHover={{ scale: 1.08, rotate: -3 }}
            className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-56 md:h-56 lg:w-64 lg:h-64 flex-shrink-0 mx-auto md:mx-0 -mt-2 sm:-mt-6 md:-mt-10"
          >
            <Image
              src="/semayot/images/sema2_trans.webp"
              alt="Maskot Semayot"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 176px, (max-width: 1024px) 224px, 256px"
            />
          </motion.div>
        </div>

        {/* Feature blocks */}
        <div className="space-y-10 md:space-y-12">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ x: 8 }}
              className="md:flex md:items-start md:gap-12 lg:gap-16 pb-10 md:pb-12 border-b border-[#E7E5E4] last:border-b-0 relative"
            >
              {/* Number indicator */}
              <div className="mb-6 md:mb-0 md:flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.1, color: "#FF4F79" }}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#1C1917]/10 transition-colors duration-300 select-none"
                >
                  {String(idx + 1).padStart(2, '0')}
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1C1917] mb-3 md:mb-4 font-display tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-[#57534E] leading-relaxed max-w-2xl font-medium">
                  {feature.description}
                </p>
              </div>

              {/* Food image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 + 0.2 }}
                className="mt-6 md:mt-0 md:flex-shrink-0 w-full md:w-48 lg:w-56 h-36 sm:h-40 md:h-48 lg:h-56 rounded-2xl overflow-hidden shadow-lg border border-[#E7E5E4]"
              >
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={224}
                  height={224}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default ExperienceSection;

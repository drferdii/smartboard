"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertTriangle, BookOpen, UtensilsCrossed } from "lucide-react";

interface LocalMenuItem {
  src: string;
  name: string;
  category: string;
  description: string;
}

export const MenuInfoSection: React.FC = () => {
  const localMenus: LocalMenuItem[] = [
    {
      src: "/semayot/images/menu1.webp",
      name: "Tumis Pare Pedas",
      category: "Sayuran Tradisional",
      description: "Pare segar iris melingkar, ditumis dengan cabai merah dan bawang bombay. Rasa pahit-pedas khas yang menggugah selera, disajikan dalam nampan stainless."
    },
    {
      src: "/semayot/images/menu2.webp",
      name: "Tumis Rebung",
      category: "Sayuran Tradisional",
      description: "Rebung muda pilihan iris memanjang, dimasak dengan bumbu rempah gurih berkuah merah. Tekstur renyah dengan rasa pedas manis yang khas."
    },
    {
      src: "/semayot/images/menu3.webp",
      name: "Daging Masak Rempah",
      category: "Daging Masak",
      description: "Potongan daging pilihan dimasak meresap dalam kuah kental berbumbu rempah khas Kalimantan, dipadu kentang yang lembut. Gurih, pedas, dan beraroma kuat."
    },
    {
      src: "/semayot/images/menu4.webp",
      name: "Daging Asap Suwir",
      category: "Daging Asap",
      description: "Daging asap tradisional disuwir halus, ditumis garing dengan irisan jahe dan bumbu rempah. Aroma asap kayu bakar yang khas and menggoda."
    },
    {
      src: "/semayot/images/menu5.webp",
      name: "Semur Daging Rebung",
      category: "Daging Masak",
      description: "Daging empuk dimasak perlahan dalam kuah semur kental berwarna gelap, dipadu rebung muda dan rempah hutan. Rasa gurih manis yang meresap sempurna."
    },
    {
      src: "/semayot/images/menu6.webp",
      name: "Daging Asap Tumis Cabai",
      category: "Daging Asap",
      description: "Olahan daging asap gurih ditumis bersama cabai hijau dan daun rempah. Perpaduan rasa pedas dan aroma asap yang menggugah selera."
    }
  ];

  return (
    <section id="menu" className="bg-[#FFF0F3] px-6 md:px-12 lg:px-20 py-14 md:py-18 lg:py-22 border-b border-[#FFD4DF]/60 relative overflow-hidden">
      {/* Background decoration decorative blobs */}
      <div className="absolute top-1/2 left-[-10%] w-[400px] h-[400px] bg-[#FAF6F0]/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-[#FFC2D6]/20 rounded-full blur-[70px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-xs font-extrabold text-[#D97706] mb-6 uppercase tracking-wider shadow-sm"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Galeri Sajian Terpopuler</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-[#1C1917] mb-6 font-display tracking-tight leading-tight"
          >
            Identitas Masakan Semayot
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-base md:text-lg text-[#57534E] leading-relaxed font-medium mb-8"
          >
            Berikut adalah beberapa hidangan andalan kami. Untuk daftar menu lengkap dan harga terbaru, silakan hubungi kami langsung.
          </motion.p>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.25 }}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs md:text-sm font-bold text-amber-950 uppercase tracking-wide">
              Konfirmasi Menu & Harga via Telepon
            </p>
          </motion.div>
        </div>

        {/* Redesigned Menu Cards Grid with Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {localMenus.map((menu, idx) => (
            <motion.div
              key={menu.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-[#FAF6F0] rounded-3xl overflow-hidden border border-[#E7E5E4] shadow-[0_4px_20px_rgba(28,25,23,0.03)] hover:shadow-[0_12px_32px_rgba(28,25,23,0.08)] transition-all duration-300 flex flex-col h-full group"
            >
              {/* Image Container */}
              <div className="relative h-60 w-full overflow-hidden bg-stone-200">
                <Image
                  src={menu.src}
                  alt={menu.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={idx < 3}
                />
                {/* Category Badge overlay */}
                <div className="absolute top-4 left-4 bg-[#1C1917]/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
                  {menu.category}
                </div>
              </div>

              {/* Text Content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-extrabold text-[#1C1917] mb-3 font-display tracking-tight leading-snug">
                  {menu.name}
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed font-medium flex-grow">
                  {menu.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

  {/* Heritage Note — Large Handwritten Style */}
        <div className="mt-8 pt-6 border-t border-[#E7E5E4] text-center">
          <p
            className="font-display italic text-lg md:text-2xl text-[#1C1917]/70 leading-relaxed max-w-3xl mx-auto"
            style={{
              textShadow: "0 2px 6px rgba(0,0,0,0.08), 0 0 20px rgba(255,79,121,0.12)",
            }}
          >
            Resep masakan khas turun temurun dari dapur keluarga Dayak Bengkayang. Tiap hidangan diolah dengan teknik tradisional yang diwariskan dari generasi ke generasi.
          </p>
        </div>

      </div>
    </section>
  );
};
export default MenuInfoSection;

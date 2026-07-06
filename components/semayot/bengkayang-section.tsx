"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";

export const BengkayangSection: React.FC = () => {
  const mapLink = "https://www.google.com/maps?q=Bengkayang,+Kalimantan+Barat";
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.1, 0.35], [50, 0]);

  return (
    <section ref={sectionRef} className="relative bg-[#F5EFEB] py-14 md:py-18 lg:py-22 overflow-hidden border-b-2 border-t-2 border-[#1C1917]">
      {/* Newspaper texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 24px, #1C1917 24px, #1C1917 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, #1C1917 24px, #1C1917 25px)`,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 relative z-10 text-[#1C1917] font-serif">
        {/* Newspaper Masthead */}
        <div className="text-center mb-12 md:mb-16 border-b-4 border-double border-[#1C1917] pb-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#78716C] mb-3"
          >
            Edisi Khusus Informasi Wilayah
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black font-display tracking-tight uppercase mb-4 leading-none"
          >
            SEMAYOT NEWS
          </motion.h2>

          {/* Date & Issue bar */}
          <div className="border-t border-b border-[#1C1917] py-2 flex flex-wrap justify-between items-center text-xs font-sans font-bold uppercase tracking-wider text-[#44403C]">
            <span>Vol. XXVI No. 7</span>
            <span>
              Kota{" "}
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#FF4F79] transition-colors"
              >
                Bengkayang
              </a>
              , Kalimantan Barat
            </span>
            <span className="hidden sm:inline">Hari Ini</span>
            <span className="hidden sm:inline">Harga: 1 Porsi Babi Asap</span>
          </div>
        </div>

        {/* Headline / Editorial Header */}
        <div className="mb-12 border-b border-[#1C1917]/20 pb-8 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black font-display tracking-tight leading-tight mb-4">
            Mengenal Lebih Dekat{" "}
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#FF4F79] transition-colors decoration-2"
            >
              Bengkayang
            </a>
            : Surga Riam dan Tradisi di Ujung Barat Kalimantan
          </h3>
          <p className="text-sm font-sans font-semibold text-[#57534E] leading-relaxed italic">
            Kabupaten perbatasan yang menyimpan ribuan air terjun eksotis, keunikan arsitektur adat, serta keselarasan budaya multi-etnis yang harmonis.
          </p>
        </div>

        {/* Newspaper 3-Column Layout */}
        <motion.div 
          style={{ opacity: contentOpacity, y: contentY }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 text-sm leading-relaxed text-[#292524] text-justify"
        >
          
          {/* COLUMN 1: Sejarah & Julukan Riam */}
          <div className="space-y-8 md:pr-4 md:border-r border-[#1C1917]/25">
            <div>
              <h4 className="text-lg font-black font-display tracking-tight uppercase mb-3 border-b-2 border-[#1C1917] pb-1">
                I. Bumi 1000 Riam
              </h4>
              <p className="first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:text-[#1C1917] first-letter:font-display">
                Kabupaten{" "}
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#FF4F79] font-bold"
                >
                  Bengkayang
                </a>{" "}
                sangat terkenal dengan julukan "Bumi 1000 Riam" karena memiliki ratusan hingga ribuan air terjun (riam) eksotis. Salah satu yang paling ikonik adalah Riam Merasap di Desa Sahan, yang sering dijuluki sebagai "Niagara Kecil" Kalimantan Barat karena kemegahan alirannya yang menderu deras membelah hutan pedalaman Kalbar.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-black font-display tracking-tight uppercase mb-3 border-b-2 border-[#1C1917] pb-1">
                II. Sejarah Pemekaran
              </h4>
              <p>
                Secara historis, Kabupaten{" "}
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#FF4F79] font-bold"
                >
                  Bengkayang
                </a>{" "}
                resmi berdiri pada tanggal 20 April 1999 setelah dimekarkan dari Kabupaten Sambas berdasarkan Undang-Undang Nomor 10 Tahun 1999. Langkah pemekaran ini diambil guna mempercepat pembangunan daerah dan meningkatkan kesejahteraan masyarakat di wilayah perbatasan utara Kalimantan Barat.
              </p>
            </div>
          </div>

          {/* COLUMN 2: Arsitektur & Budaya Perayaan */}
          <div className="space-y-8 md:px-2 md:border-r border-[#1C1917]/25">
            <div>
              <h4 className="text-lg font-black font-display tracking-tight uppercase mb-3 border-b-2 border-[#1C1917] pb-1">
                III. Keunikan Rumah Baruk
              </h4>
              <p>
                Berbeda dengan suku Dayak pada umumnya yang tinggal di Rumah Betang berbentuk memanjang, suku Dayak Bidayuh di{" "}
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#FF4F79] font-bold"
                >
                  Bengkayang
                </a>{" "}
                memiliki arsitektur khas bernama Rumah Baruk. Rumah adat ini berbentuk bundar/melingkar dan menjulang tinggi, yang secara historis berfungsi sebagai tempat pertahanan sekaligus pusat ritual adat.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-black font-display tracking-tight uppercase mb-3 border-b-2 border-[#1C1917] pb-1">
                IV. Cap Go Meh Meriah
              </h4>
              <p>
                Budaya di{" "}
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#FF4F79] font-bold"
                >
                  Bengkayang
                </a>{" "}
                sangat harmonis dengan perpaduan etnis Dayak, Melayu, dan Tionghoa. Setiap tahunnya, perayaan Cap Go Meh yang berpusat di Vihara Ariamarama menjadi daya tarik wisata luar biasa dan diklaim sebagai perayaan terbesar kedua di Kalimantan Barat setelah Kota Singkawang.
              </p>
            </div>
          </div>

          {/* COLUMN 3: Bentang Alam, Perbatasan & IKLAN RETRO */}
          <div className="space-y-8 md:pl-4">
            <div>
              <h4 className="text-lg font-black font-display tracking-tight uppercase mb-3 border-b-2 border-[#1C1917] pb-1">
                V. Gerbang Batas Negara
              </h4>
              <p>
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#FF4F79] font-bold"
                >
                  Bengkayang
                </a>{" "}
                berbatasan darat langsung dengan wilayah Sarawak, Malaysia, khususnya di Kecamatan Jagoi Babang. Wilayah ini aktif dikembangkan menjadi salah satu sentra pangan strategis perbatasan nasional.
              </p>
            </div>

            {/* Vintage Advertisement Box */}
            <div className="border-4 border-dashed border-[#1C1917] p-5 bg-[#FCF9F2] relative mt-6 flex flex-col justify-between min-h-[220px]">
              <div className="text-center">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] bg-[#1C1917] text-white px-2 py-0.5 mb-3 inline-block">
                  Iklan Pilihan Redaksi
                </span>
                <h5 className="text-xl font-black font-display tracking-tight uppercase mb-2">
                  Rumah Makan Semayot
                </h5>
                <p className="text-[11px] font-sans font-bold leading-normal mb-4 text-[#57534E]">
                  Spesialis Masakan Tradisional Dayak &amp; Olahan Daging Asap Autentik di Bumi Amas,{" "}
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#FF4F79]"
                  >
                    Bengkayang
                  </a>.
                </p>
              </div>
              <div className="border-t border-[#1C1917]/20 pt-3 text-center">
                <p className="text-xs font-bold italic mb-2">
                  "Dari Tungku Asap Tradisional, Menuju Hangatnya Kebersamaan"
                </p>
                <div className="text-[10px] font-sans font-bold tracking-wider flex justify-center gap-3">
                  <span>Telp: 0816-4947-0780</span>
                  <span>|</span>
                  <span>Cash Only</span>
                </div>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Newspaper Footer / Page End */}
        <div className="mt-16 pt-6 border-t-4 border-double border-[#1C1917] flex justify-between items-center text-xs font-sans font-bold uppercase text-[#78716C]">
          <span>SEMAYOT NEWS © 2026</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#FF4F79]" />
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4F79]"
            >
              Bengkayang, Kalimantan Barat
            </a>
          </span>
          <span>Halaman Utama</span>
        </div>
      </div>
    </section>
  );
};

export default BengkayangSection;

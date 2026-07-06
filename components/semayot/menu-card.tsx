"use client";

import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MenuItem } from "@/lib/semayot/menu-data";
import { semayotBusinessInfo } from "@/lib/semayot/business-info";
import { Phone, AlertCircle } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const formattedPhone = semayotBusinessInfo.phone.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(
    `Halo Rumah Makan Semayot, saya tertarik memesan atau menanyakan ketersediaan menu: *${item.name}*. Apakah menu khas ini siap disajikan hari ini?`
  );
  const orderUrl = `https://wa.me/62${formattedPhone.substring(1)}?text=${encodedMessage}`;

  // 3D tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 25 });

  // Shine position
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      rotateX.set((y - 0.5) * -12);
      rotateY.set((x - 0.5) * 12);
      shineX.set(x * 100);
      shineY.set(y * 100);
    },
    [rotateX, rotateY, shineX, shineY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const shineBackground = useTransform(
    [shineX, shineY],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
  );

  const categoryEmoji = item.category === "dayak" ? "🍃" : item.category === "smoked" ? "🔥" : "🌶️";
  const categoryLabel = item.category === "dayak" ? "Dayak Specialty" : item.category === "smoked" ? "Smoked Meat" : "Spicy Delicacy";

  return (
    <div className="perspective-container">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.03, z: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white/80 backdrop-blur-sm border border-[#E7E5E4] rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(28,25,23,0.04)] hover:shadow-[0_16px_40px_rgba(28,25,23,0.1)] transition-shadow duration-300 flex flex-col h-full menu-card-glow"
      >
        {/* Shine overlay */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
          style={{ background: shineBackground }}
        />

        {/* Food placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-[#FFF0F3] to-[#FAF6F0] flex items-center justify-center overflow-hidden border-b border-[#E7E5E4]">
          <div className="absolute w-28 h-28 rounded-full bg-[#FFC2D6]/15 blur-2xl top-2 left-2" />
          <div className="absolute w-20 h-20 rounded-full bg-[#D97706]/10 blur-2xl bottom-2 right-2" />

          <div className="relative text-center z-10 flex flex-col items-center">
            <span className="text-5xl mb-2">{categoryEmoji}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8A29E]">
              {categoryLabel}
            </span>
          </div>

          {item.badge && (
            <div className="absolute top-4 left-4 bg-[#D97706] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-[2px_2px_0px_#1C1917]">
              {item.badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow relative z-20">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-lg font-bold text-[#1C1917] leading-snug font-display">
              {item.name}
            </h3>
            <span className="text-xs font-extrabold text-[#D97706] whitespace-nowrap bg-[#FFFBEB] px-2.5 py-1 rounded-lg border border-[#FDE68A]">
              {item.price}
            </span>
          </div>

          <p className="text-sm text-[#57534E] leading-relaxed mb-5 flex-grow">
            {item.description}
          </p>

          {item.needsOwnerConfirmation && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#A8A29E] font-bold bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1.5 rounded-xl mb-4">
              <AlertCircle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span>Khas Ulasan Pelanggan (Perlu Konfirmasi)</span>
            </div>
          )}

          <div className="mt-auto">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-bold py-3 px-4 rounded-2xl transition-colors duration-200 shadow-[0_2px_8px_rgba(28,25,23,0.08)]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Tanya Ketersediaan</span>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

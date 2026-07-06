"use client";

import React from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const testimonials = [
  {
    id: 1,
    name: "Andi Wijaya",
    role: "Pelanggan Setia",
    company: "Bengkayang",
    content:
      "Daging asapnya benar-benar juara! Rasa smoky-nya pas dan bumbu meresap sampai ke dalam. Setiap kali ke Bengkayang, mampir ke Semayot adalah wajib.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andi&backgroundColor=b6e3f4",
  },
  {
    id: 2,
    name: "Kristina Natalia",
    role: "Wisatawan",
    company: "Pontianak",
    content:
      "Suasana rumah makannya sangat nyaman dan autentik. Pelayanannya cepat dan ramah. Babi panggangnya wajib dicoba — kulitnya garing, dagingnya lembut!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kristina&backgroundColor=ffdfbf",
  },
  {
    id: 3,
    name: "Budi Santoso",
    role: "Pengusaha",
    company: "Singkawang",
    content:
      "Sering bawa tamu bisnis ke sini. Makanan khas Dayak-nya selalu jadi pembicaraan. Tempat yang pas untuk santap siang setelah perjalanan jauh.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&backgroundColor=c0aede",
  },
  {
    id: 4,
    name: "Maria Kusuma",
    role: "Pelanggan",
    company: "Bengkayang",
    content:
      "Sayur daun singkong tumisnya enak banget, tidak pahit. Kombinasi lauk dan sayur tradisionalnya bikin nostalgia masakan rumah. Harga juga terjangkau!",
    rating: 4,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=ffdfbf",
  },
  {
    id: 5,
    name: "Joko Prasetyo",
    role: "Traveler",
    company: "Jakarta",
    content:
      "Kuliner terbaik yang saya temui di Kalimantan Barat. Daging asap dengan sambal khas Dayak-nya luar biasa. Recommended banget buat wisatawan!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joko&backgroundColor=b6e3f4",
  },
];

export const SemayotTestimonials: React.FC = () => {
  return (
    <AnimatedTestimonials
      title="Ulasan Pelanggan"
      subtitle="Apa kata mereka yang sudah mencicipi masakan tradisional Dayak kami."
      badgeText={
        <a
          href="https://www.google.com/maps/place/Rumah+Makan+Semayot/@0.8312772,109.4858797,17z/data=!4m8!3m7!1s0x31e335c4a9c2c4cb:0xfc8a3aa13021ead2!8m2!3d0.8312772!4d109.4858797!9m1!1b1!16s%2Fg%2F11fqll5pxj?entry=ttu"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline transition-all flex items-center gap-1 text-xs md:text-sm"
        >
          <span>⭐ 4.9 dari 9 ulasan Google Maps</span>
        </a>
      }
      testimonials={testimonials}
      autoRotateInterval={5000}
      className="bg-[#FFF0F3]"
      isDark={false}
    />
  );
};
export default SemayotTestimonials;

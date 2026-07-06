"use client";

import React, { useState, useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion, AnimatePresence } from "framer-motion";

const chatMessages = [
  { id: 1, sender: "customer", text: "Halo Kak, mau pesen babi asap 2 porsi ya!", delay: 0 },
  { id: 2, sender: "owner", text: "Siap Kak! Babi asap favorit ya, lagi fresh 🔥", delay: 1.5 },
  { id: 3, sender: "customer", text: "Sama tumis daun singkong 1 porsi ya Kak", delay: 3 },
  { id: 4, sender: "owner", text: "Oke Kak, pesanan sedang disiapkan. Estimasi 15 menit!", delay: 4.5 },
  { id: 5, sender: "customer", text: "Wah cepat! Makasih Kak 🙏", delay: 6 },
  { id: 6, sender: "owner", text: "Pesanan siap diantar! Selamat menikmati 😊", delay: 7.5 },
  { id: 7, sender: "customer", text: "Babi asapnya enak! Pasti balik lagi 🔥👍", delay: 9 },
];

export const WhatsAppChat: React.FC = () => {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const startChat = () => {
      setIsPlaying(true);
      setVisibleMessages([]);
      chatMessages.forEach((msg) => {
        setTimeout(() => {
          setVisibleMessages((prev) => [...prev, msg.id]);
        }, msg.delay * 1000);
      });
      setTimeout(() => setIsPlaying(false), 12000);
    };
    const initialTimeout = setTimeout(startChat, 2000);
    const interval = setInterval(startChat, 15000);
    return () => { clearTimeout(initialTimeout); clearInterval(interval); };
  }, []);

  return (
    <div className="flex flex-col items-start gap-4">
      {/* Lottie Animation */}
      <div className="w-32 h-32 lg:w-40 lg:h-40 shrink-0">
        <Player src="/Chat WhatsApp.lottie" loop autoplay style={{ width: "100%", height: "100%" }} />
      </div>

      {/* iPhone Mockup */}
      <div className="w-full max-w-[300px] sm:max-w-[344px] shrink-0">
        {/* Phone Frame */}
        <div className="bg-[#0A0A0A] rounded-[44px] p-[10px] shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-[#2A2A2A]">
          {/* Screen */}
          <div className="bg-[#ECE5DD] rounded-[34px] overflow-hidden relative">
            {/* Notch */}
            <div className="h-[34px] bg-[#ECE5DD] relative flex items-center justify-center z-10">
              <div className="w-[100px] h-[26px] bg-[#0A0A0A] rounded-b-[16px]" />
            </div>

            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 pb-3 border-b border-[#D4CFC7]/50">
              <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-sm shrink-0">RM</div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1C1917] truncate">Rumah Makan Semayot</p>
                <p className="text-[10px] text-[#25D366]">online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="px-3 py-2.5 space-y-2 min-h-[200px] max-h-[380px] overflow-hidden">
              <AnimatePresence>
                {chatMessages.map((msg) => {
                  const isVisible = visibleMessages.includes(msg.id);
                  const isCustomer = msg.sender === "customer";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.25, type: "spring", stiffness: 220 }}
                      className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-snug ${
                        isCustomer
                          ? "bg-[#DCF8C6] rounded-br-md text-[#1C1917]"
                          : "bg-white rounded-bl-md text-[#1C1917]"
                      } shadow-[0_1px_2px_rgba(0,0,0,0.05)]`}>
                        <p>{msg.text}</p>
                        <p className="text-[9px] text-[#667781] text-right mt-1">{isCustomer ? "Anda" : "Semayot"} · ✓✓</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isPlaying && visibleMessages.length < chatMessages.length && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-md shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-1">
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-[#667781]" />
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.12 }} className="w-2 h-2 rounded-full bg-[#667781]" />
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.24 }} className="w-2 h-2 rounded-full bg-[#667781]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Home Indicator */}
            <div className="h-6 flex items-center justify-center bg-[#ECE5DD]">
              <div className="w-32 h-[4px] bg-[#0A0A0A]/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChat;
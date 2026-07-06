"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Jam buka berapa?",
  "Menu apa saja?",
  "Lokasi di mana?",
];

function SemaAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-8 h-8" : "w-7 h-7";
  const px = size === "md" ? "32px" : "28px";
  return (
    <div className={`relative ${dim} rounded-full overflow-hidden bg-gray-200 flex-shrink-0${size === "sm" ? " mt-1" : ""}`}>
      <Image src="/semayot/images/avatar.jpg" alt="Maskot Sema" fill className="object-cover object-top" sizes={px} />
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSubmit = async (e?: React.FormEvent, directMessage?: string) => {
    e?.preventDefault();
    const msg = directMessage || input;
    if (!msg.trim() || isLoading) return;

    const userMessage = msg.trim();
    setInput("");
    setError(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsg]);

    const conversation = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal mengirim pesan");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantText = "";
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantText } : m
          )
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleRetry = () => {
    setError(null);
    const lastUser = messages.filter((m) => m.role === "user").pop();
    if (lastUser) {
      setMessages((prev) => prev.filter((m) => m.id !== lastUser.id));
      handleSubmit(undefined, lastUser.content);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 bg-[#FF4F79] text-white rounded-full shadow-xl hover:bg-[#E03D63] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4F79] focus:ring-offset-2"
            aria-label="Buka chat Tanya Semayot"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Tanya Semayot</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[9999] w-full max-w-[360px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[#FFD4DF]/80 backdrop-blur-md"
            style={{ backgroundColor: "rgba(255, 240, 243, 0.95)", maxHeight: "500px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#FF4F79] text-white flex-shrink-0">
              <SemaAvatar size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">Tanya Semayot</h3>
                <p className="text-xs text-white/80">Maskot Sema</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Tutup chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[280px]">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  {/* Welcome Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-2"
                  >
                    <SemaAvatar />
                    <div className="bg-[#FAF6F0] text-[#1C1917] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] text-sm leading-relaxed">
                      Halo! Selamat datang di Rumah Makan Semayot. Ada yang bisa saya bantu? 🐷
                    </div>
                  </motion.div>

                  {/* Suggested Questions */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2 pl-9"
                  >
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit(undefined, q)}
                        className="px-3 py-1.5 bg-[#FF4F79] text-white text-xs font-medium rounded-full hover:bg-[#E03D63] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4F79] focus:ring-offset-1"
                      >
                        {q}
                      </button>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index === messages.length - 1 ? 0.05 : 0 }}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <SemaAvatar />
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#FF4F79] text-white rounded-tr-sm"
                            : "bg-[#FAF6F0] text-[#1C1917] rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2"
                    >
                      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mt-1">
                        <Image
                          src="/semayot/images/avatar.jpg"
                          alt="Maskot Sema"
                          fill
                          className="object-cover object-top"
                          sizes="28px"
                        />
                      </div>
                      <div className="bg-[#FAF6F0] rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-[#FF4F79]/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-[#FF4F79]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-[#FF4F79]/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Error state */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2"
                    >
                      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mt-1">
                        <Image
                          src="/semayot/images/avatar.jpg"
                          alt="Maskot Sema"
                          fill
                          className="object-cover object-top"
                          sizes="28px"
                        />
                      </div>
                      <div className="bg-red-50 text-red-700 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%]">
                        <p className="mb-2">Maaf, terjadi kesalahan. Coba lagi?</p>
                        <button
                          onClick={handleRetry}
                          className="text-xs font-medium bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-colors"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 bg-white/80 border-t border-[#FFD4DF] backdrop-blur-sm flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanya Semayot..."
                  className="flex-1 bg-[#FFF0F3] border border-[#FFD4DF] rounded-full px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#FF4F79] focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-[#FF4F79] text-white flex items-center justify-center hover:bg-[#E03D63] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4F79] focus:ring-offset-2"
                  aria-label="Kirim pesan"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

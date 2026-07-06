export function SemayotFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#E8F95C] text-[#0A0A0A] relative overflow-hidden" aria-label="Footer">
      {/* Giant Brand Name */}
      <div className="px-6 md:px-12 lg:px-20 pt-10 md:pt-14 lg:pt-16 pb-6 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[14vw] md:text-[11vw] lg:text-[9vw] font-black leading-[0.82] tracking-tighter font-sans text-[#0A0A0A] uppercase">
            SEMAYOT
          </h2>
        </div>
      </div>

      {/* Separator */}
      <div className="px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto border-t border-[#0A0A0A]/25" />
      </div>

      {/* Bottom Content */}
      <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14 lg:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24">
          {/* Left: Geometric Shapes */}
          <div className="flex items-end" aria-hidden="true">
            <div className="flex gap-2 md:gap-3 items-end">
              {/* 3 vertical bars */}
              <div className="w-6 sm:w-8 md:w-12 h-32 sm:h-44 md:h-64 bg-[#0A0A0A]" />
              <div className="w-6 sm:w-8 md:w-12 h-32 sm:h-44 md:h-64 bg-[#0A0A0A]" />
              <div className="w-8 sm:w-10 md:w-14 h-32 sm:h-44 md:h-64 bg-[#0A0A0A]" />
              {/* 2 horizontal rectangles */}
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="w-24 sm:w-36 md:w-52 h-14 sm:h-20 md:h-28 bg-[#0A0A0A]" />
                <div className="w-24 sm:w-36 md:w-52 h-14 sm:h-20 md:h-28 bg-[#0A0A0A]" />
              </div>
            </div>
          </div>

          {/* Right: Contact, Subscribe, Acknowledgement, Credits */}
          <div className="flex flex-col gap-8 md:gap-10">
            {/* Contact Info */}
            <div className="space-y-1 text-sm font-bold leading-relaxed">
              <p>WhatsApp: +62 816 4947 0780</p>
              <p>Telepon: +62 816 4947 0780</p>
              <p>Alamat: Bumi Amas, Bengkayang</p>
              <p>Kalimantan Barat, Indonesia</p>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-sm font-bold">Dapatkan update terbaru:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Alamat Email"
                  aria-label="Alamat Email"
                  className="flex-1 bg-transparent border border-[#0A0A0A]/40 px-3 py-2 text-sm font-semibold placeholder:text-[#0A0A0A]/50 focus:outline-none focus:border-[#0A0A0A] transition-colors"
                />
                <button className="shrink-0 border border-[#0A0A0A] px-4 py-2 text-sm font-bold hover:bg-[#0A0A0A] hover:text-[#E8F95C] transition-colors">
                  Berlangganan
                </button>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-[#0A0A0A]/25" />

            {/* Acknowledgement */}
            <p className="text-sm font-bold leading-relaxed">
              Rumah Makan Semayot menghargai warisan budaya Dayak dan kuliner tradisional Kalimantan Barat. Kami berkomitmen untuk menjaga cita rasa autentik, memakai bahan segar dan lokal, serta menghadirkan pelayanan terbaik dalam setiap hidangan yang kami sajikan.
            </p>

            {/* Credits */}
            <div className="flex flex-col gap-2 text-xs md:text-sm font-bold text-[#0A0A0A]/80 pt-6 border-t border-[#0A0A0A]/15">
              <p className="text-[#0A0A0A]/50 uppercase tracking-widest text-[10px] mb-1">
                Design & Development
              </p>
              <p className="leading-relaxed">
                © {currentYear} Sentra Mitra Design - All Rights Reserved.
              </p>
              <p className="leading-relaxed">
                This website is proudly designed and maintained by Sentra Mitra Design.
              </p>
              <p className="leading-relaxed">
                Special courtesy to <a href="https://www.instagram.com/alyn_kristiani/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#0A0A0A] transition-colors">dr. Alyn</a> for the trusted collaboration in 2026.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-[#0A0A0A]/40 mt-2 pt-2 border-t border-[#0A0A0A]/5">
                <a href="/robots.txt" className="hover:text-[#0A0A0A] hover:underline">robots.txt</a>
                <span>•</span>
                <a href="/sitemap.xml" className="hover:text-[#0A0A0A] hover:underline">sitemap.xml</a>
                <span>•</span>
                <a href="/llms.txt" className="hover:text-[#0A0A0A] hover:underline">llms.txt (AI guidelines)</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default SemayotFooter;

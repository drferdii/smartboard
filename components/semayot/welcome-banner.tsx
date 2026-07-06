import Image from "next/image";

export function WelcomeBanner() {
  return (
    <section className="bg-[#FFF0F3] py-12 md:py-16 border-b border-[#FFD4DF]/60 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <div className="flex gap-3">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
              <Image src="/semayot/images/menu1.webp" alt="Babi Panggang Khas" fill className="object-cover" sizes="96px" />
            </div>
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white -mt-4 md:-mt-6">
              <Image src="/semayot/images/menu2.webp" alt="Daging Asap" fill className="object-cover" sizes="96px" />
            </div>
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
              <Image src="/semayot/images/menu3.webp" alt="Sayuran Tradisional" fill className="object-cover" sizes="96px" />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1917] mb-3 font-display tracking-tight">
              Tradisi rasa, kualitas prima.
            </h2>
            <p className="text-base md:text-lg text-[#57534E] font-medium max-w-md">
              Setiap hidangan dibuat dengan standar tinggi dan bahan pilihan.
              Pengalaman makan yang istimewa.
            </p>
            <p className="text-xs text-[#A8A29E] font-bold mt-3 uppercase tracking-wider">
              Non-halal · Masakan khas Dayak
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

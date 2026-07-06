import { semayotBusinessInfo } from "./business-info";

export interface HomepageCopy {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    nonHalalWarning: string;
  };
  service: {
    badge: string;
    title: string;
    subtitle: string;
    pillars: Array<{
      title: string;
      description: string;
      icon: 'utensils' | 'heart' | 'sparkles' | 'message-square';
    }>;
  };
  recommendation: {
    badge: string;
    title: string;
    subtitle: string;
    mascotBubble: string;
  };
  location: {
    badge: string;
    title: string;
    directionsLabel: string;
    operationalHoursLabel: string;
    paymentNote: string;
    ctaMaps: string;
    ctaCall: string;
  };
  footer: {
    desc: string;
    copyright: string;
    tagline: string;
  };
}

export const homepageCopy: HomepageCopy = {
  hero: {
    badge: `📍 Bengkayang, Kalimantan Barat`,
    headline: "Kenikmatan autentik dalam setiap sajian.",
    subheadline: `Rumah makan spesialis masakan tradisional Dayak dan olahan daging asap otentik di ${semayotBusinessInfo.name}. Resep turun-temurun, bumbu pilihan, rasa yang dirindukan.`,
    ctaPrimary: "Buka Google Maps",
    ctaSecondary: "Hubungi Rumah Makan",
    nonHalalWarning: "Non-halal · Masakan khas Dayak",
  },
  service: {
    badge: "Keunggulan Kami",
    title: "Tradisi rasa, kualitas prima.",
    subtitle: "Setiap hidangan dibuat dengan standar tinggi dan bahan pilihan, mengangkat pengalaman makan dari sekadar sehari-hari menjadi sesuatu yang istimewa.",
    pillars: [
      {
        title: "Resep Otentik Dayak",
        description: "Bumbu rempah tradisional yang diwariskan turun-temurun, diracik dengan penuh ketelitian.",
        icon: "utensils"
      },
      {
        title: "Bahan Pilihan Terbaik",
        description: "Daging segar dan rempah pilihan hanya untuk hidangan terbaik di meja Anda.",
        icon: "heart"
      },
      {
        title: "Suasana Hangat & Bersih",
        description: "Nikmati santapan dalam suasana rumahan yang nyaman di kawasan Bumi Amas.",
        icon: "sparkles"
      },
      {
        title: "Pelayanan dari Hati",
        description: "Kami melayani setiap tamu dengan senyuman, layaknya menyambut keluarga sendiri.",
        icon: "message-square"
      }
    ]
  },
  recommendation: {
    badge: "Pilihan Hari Ini",
    title: "Rekomendasi Khas Semayot",
    subtitle: "Setiap hari kami menghadirkan hidangan tradisional dengan olahan bumbu otentik dan sajian asap beraroma wangi kayu bakar. Tanya menu spesial hari ini!",
    mascotBubble: "Coba tanya menu spesial hari ini, pasti bikin nagih!"
  },
  location: {
    badge: "Lokasi Kami",
    title: "Santap Langsung di Bengkayang",
    directionsLabel: "Panduan Lokasi:",
    operationalHoursLabel: "Jam Operasional & Pembayaran:",
    paymentNote: "Metode Pembayaran: Tunai (Cash Only)",
    ctaMaps: "Navigasi Google Maps",
    ctaCall: "Hubungi via Telepon"
  },
  footer: {
    desc: `Rumah makan spesialis masakan tradisional Dayak dan olahan daging asap di Bumi Amas, Bengkayang.`,
    tagline: "Resep turun-temurun, rasa yang dirindukan.",
    copyright: `© ${new Date().getFullYear()} Rumah Makan Semayot. Hak Cipta Dilindungi.`
  }
};

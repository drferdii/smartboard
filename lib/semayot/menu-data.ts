export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  badge?: string;
  category: 'dayak' | 'smoked' | 'pedas' | 'minuman';
  needsOwnerConfirmation: boolean;
}

export const menuDisclaimer = "Daftar menu resmi lengkap belum tercantum di profil publik. Menu di bawah ini dirangkum berdasarkan ulasan hidangan khas Dayak & daging asap lokal dari pelanggan dan memerlukan konfirmasi pemilik.";

export const featuredMenu: MenuItem[] = [
  {
    id: "hidangan-tradisional-dayak",
    name: "Hidangan Tradisional Dayak",
    description: "Sajian khas Dayak dengan rempah-rempah hutan otentik, diolah secara turun-temurun dengan cita rasa khas lokal Bengkayang.",
    price: "Hubungi Kontak",
    badge: "Khas Dayak",
    category: "dayak",
    needsOwnerConfirmation: true
  },
  {
    id: "smoked-wild-meat-semayot",
    name: "Daging Asap Khas Semayot",
    description: "Olahan daging asap tradisional beraroma kayu bakar yang harum, empuk, dan gurih khas pedalaman Kalimantan Barat.",
    price: "Hubungi Kontak",
    badge: "Paling Dicari",
    category: "smoked",
    needsOwnerConfirmation: true
  },
  {
    id: "dayak-spicy-delicacy",
    name: "Tumisan Pedas Rempah Dayak",
    description: "Hidangan dengan rasa pedas melimpah yang pas di lidah, memadukan daun singkong, kecombrang, dan rempah pedas Kalimantan.",
    price: "Hubungi Kontak",
    badge: "Pedas Pas",
    category: "pedas",
    needsOwnerConfirmation: true
  }
];

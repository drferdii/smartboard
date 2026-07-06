export type GreetingState = {
  title: string;
  msg: string;
  agentMessages: string[];
};

export function createGreeting(hours: number): GreetingState {
  if (hours >= 11 && hours < 15) {
    return {
      title: 'LAYANAN MAKAN SIANG · SELAMAT SIANG ☀️',
      msg: 'Jam makan siang dimulai. Tetap jaga kerapihan pelayanan dan pastikan pesanan keluar tepat waktu.',
      agentMessages: [
        'Sema Agent sedang memuat data operasional terverifikasi untuk shift makan siang.',
        'Jika sumber data belum tersedia, dashboard akan menampilkan status unavailable secara eksplisit.',
        'Ringkasan bisnis di bawah sapaan ini hanya akan muncul setelah payload backend tervalidasi.',
      ],
    };
  }

  if (hours >= 15 && hours < 18) {
    return {
      title: 'TREN SORE HARI · SELAMAT SORE ☕',
      msg: 'Sore hari biasanya menjadi puncak pesanan takeaway. Mari rapikan meja kasir dan cek stok bahan asap.',
      agentMessages: [
        'Sema Agent sedang menunggu ringkasan transaksi sore dari sumber kasir yang aktif.',
        'Dashboard tidak lagi memakai angka demo; semua sinyal operasional akan berasal dari backend atau state unavailable.',
        'Jika koneksi data putus, komponen overview akan menahan klaim operasional dan menampilkan alasannya.',
      ],
    };
  }

  if (hours >= 18 || hours < 5) {
    return {
      title: 'KONSOL MALAM HARI · SELAMAT MALAM 🌙',
      msg: 'Layanan malam hari sedang berjalan. Pastikan kebersihan area makan sebelum jam tutup pukul 21:00.',
      agentMessages: [
        'Sema Agent sedang menyelaraskan ringkasan malam dengan payload backend terbaru.',
        'Kondisi operasional hanya akan diumumkan jika sumber kasir, inventaris, dan cuaca berhasil dimuat.',
        'Status unavailable akan ditampilkan apa adanya jika ada integrasi yang belum aktif.',
      ],
    };
  }

  return {
    title: 'HALO KAWAN SEMAYOT · SELAMAT PAGI 🌅',
    msg: 'Mari persiapkan bahan segar dan nyalakan tungku panggangan dengan semangat pagi!',
    agentMessages: [
      'Sema Agent sedang memverifikasi koneksi dashboard sebelum menampilkan angka operasional pagi ini.',
      'Semua angka bisnis di halaman ini akan berasal dari sumber riil atau ditandai unavailable.',
      'Jika integrasi kasir belum aktif, dashboard akan menahan semua klaim performa sampai data valid tersedia.',
    ],
  };
}

const defaultGreetingHour = new Date().getHours();

export const DEFAULT_OVERVIEW_GREETING = createGreeting(defaultGreetingHour);

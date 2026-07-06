'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemCreateSchema, type MenuItemCreate } from '@/lib/admin/schemas/menu';
import { FileUpload } from '@/components/admin/FileUpload';

export function MenuForm({ menuId }: { menuId?: string }) {
  const router = useRouter();
  const isEdit = !!menuId;
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [displayPrice, setDisplayPrice] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<MenuItemCreate>({
    resolver: zodResolver(menuItemCreateSchema),
  });

  useEffect(() => {
    if (!isEdit) return;
    fetch('/api/admin/menu?include_inactive=true')
      .then((r) => r.json())
      .then((json) => {
        const item = json.data?.find((m: { id: string }) => m.id === menuId);
        if (item) {
          setValue('name', item.name);
          setValue('description', item.description ?? '');
          const idr = Math.floor(item.price_cents / 100);
          setValue('price_cents', idr);
          setDisplayPrice(idr ? idr.toLocaleString('id-ID') : "");
          setValue('category', item.category);
          setValue('badge', item.badge ?? '');
          setPhotoUrl(item.photo_url);
        }
        setLoading(false);
      });
  }, [menuId, isEdit, setValue]);

  const onSubmit = async (data: MenuItemCreate) => {
    setServerError(null);
    const payload = { ...data, photo_url: photoUrl ?? '', price_cents: Math.round(data.price_cents * 100) };
    const url = isEdit ? `/api/admin/menu/${menuId}` : '/api/admin/menu';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (res.ok) {
      router.push('/admin/menu');
    } else {
      setServerError(json.error?.message ?? 'Gagal menyimpan menu.');
    }
  };

  if (loading) {
    return (
      <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-8 animate-pulse">
        Menyiapkan formulir editor katalog...
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in space-y-6">
      {/* Form Title */}
      <div className="border-b border-border pb-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-1 font-bold">
          PROSES_FORM: {isEdit ? 'UPDATE_ITEM' : 'INSERT_ITEM'}
        </span>
        <h2 className="font-display text-xl font-semibold text-foreground uppercase tracking-wider">
          {isEdit ? 'Ubah Informasi Menu' : 'Tambahkan Menu Hidangan'}
        </h2>
      </div>

      {serverError && (
        <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider">
          DB_ERROR: {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="border border-border bg-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
            Nama Hidangan / Produk *
          </label>
          <input 
            {...register('name')} 
            className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground" 
            placeholder="cth: DAGING ASAP SUWIR PREMIUM" 
          />
          {errors.name && <p className="font-mono text-[9px] text-red-600 mt-1 uppercase tracking-wider">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
            Keterangan / Deskripsi Rasa
          </label>
          <textarea 
            {...register('description')} 
            className="w-full px-4 py-3 border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:border-foreground leading-relaxed" 
            rows={3} 
            placeholder="Tuliskan komposisi atau kepedasan hidangan..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
              Harga Jual (Rp) *
            </label>
            <input type="hidden" {...register('price_cents', { valueAsNumber: true })} />
            <input
              type="text"
              value={displayPrice}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setDisplayPrice(val ? parseInt(val, 10).toLocaleString('id-ID') : "");
                setValue('price_cents', val ? parseInt(val, 10) : 0, { shouldValidate: true });
              }}
              className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
              placeholder="cth: 45.000"
            />
            {errors.price_cents && <p className="font-mono text-[9px] text-red-600 mt-1 uppercase tracking-wider">{errors.price_cents.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
              Klasifikasi Kategori *
            </label>
            <select 
              {...register('category')} 
              className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground uppercase font-bold"
            >
              <option value="dayak">DAYAK TRADISIONAL</option>
              <option value="smoked">DAGING ASAP</option>
              <option value="pedas">CITA RASA PEDAS</option>
              <option value="minuman">MINUMAN SEGAR</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
            Label / Lencana Promosi
          </label>
          <input 
            {...register('badge')} 
            className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground" 
            placeholder="cth: TERLARIS, REKOMENDASI, PEDAS GILA" 
          />
        </div>

        <div className="space-y-2">
          <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">
            Unggah Berkas Gambar / Foto Produk
          </label>
          <div className="border border-dashed border-border bg-background p-4">
            <FileUpload bucket="menu-photos" currentUrl={photoUrl} onUploaded={setPhotoUrl} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-border/60">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="border border-foreground bg-foreground text-background font-mono text-[10px] font-bold px-6 py-3.5 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'MEMPROSES...' : isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH CATALOG'}
          </button>
          <button 
            type="button" 
            onClick={() => router.push('/admin/menu')} 
            className="border border-border hover:border-foreground bg-transparent text-foreground font-mono text-[10px] font-bold px-6 py-3.5 uppercase tracking-widest hover:bg-card transition-all duration-300"
          >
            BATAL
          </button>
        </div>
      </form>
    </div>
  );
}

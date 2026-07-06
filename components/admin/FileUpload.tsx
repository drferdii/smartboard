'use client';

import { useState } from 'react';
import { createClient } from '@/lib/admin/supabase/client';

export function FileUpload({
  bucket,
  currentUrl,
  onUploaded,
}: {
  bucket: string;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File terlalu besar (max 5MB).');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('File harus gambar.');
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filename, file, { upsert: false });
    if (uploadError) {
      setError('Gagal upload foto.');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename);
    onUploaded(publicUrl);
    setUploading(false);
  };

  return (
    <div>
      {currentUrl && (
        <img src={currentUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={uploading}
        className="text-sm"
      />
      {uploading && <p className="text-xs text-[#57534E] mt-1">Mengupload...</p>}
      {error && <p className="text-xs text-[#DC2626] mt-1">{error}</p>}
    </div>
  );
}
